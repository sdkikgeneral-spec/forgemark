/**
 * パーサーエントリポイント
 * Markdownテキストを解析してForgeMark UI ASTを返す
 */

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { transformMdastToAst } from "./remarkPlugin.js";
import { assignIds } from "./idAssigner.js";
import type { AstNode, IncludeNode } from "../ast/types.js";
import type { Diagnostic } from "../lint/types.js";
import { runLintRules } from "../lint/linter.js";

/** parseMarkdown()の戻り値 */
export interface ParseResult {
  /** UI ASTノード配列（IDは採番済み） */
  nodes: AstNode[];
  /** lintルール違反の診断情報 */
  diagnostics: Diagnostic[];
  /** 依存グラフ更新のための生includeノード一覧 */
  includes: IncludeNode[];
}

/**
 * Markdownテキストを解析してUI ASTを返す
 * ファイルシステムにアクセスしない純粋関数
 * @param source - Markdownソーステキスト
 * @param filePath - ワークスペース相対パス（診断・id採番に使用）
 */
export function parseMarkdown(source: string, filePath: string): ParseResult {
  // unified + remark-parse + remark-gfm でMarkdown ASTを構築
  // remark-gfm はGFMテーブル構文のサポートに必要
  const rawNodes = buildAstNodes(source);

  // fallbackRaw を持つ Include ノードのフォールバックを解析する
  const nodesWithFallback = resolveFallbackRaw(rawNodes);

  // IDを採番
  const nodes = assignIds(nodesWithFallback);

  // includeノードを収集
  const includes = collectIncludes(nodes);

  // lintルールを実行
  const diagnostics = runLintRules(nodes, filePath);

  return { nodes, diagnostics, includes };
}

/**
 * Markdown文字列をUI ASTノード配列に変換する（lint・ID採番なし）
 * フォールバックコンテンツのパースに使用する
 */
function buildAstNodes(source: string): AstNode[] {
  const processor = unified().use(remarkParse).use(remarkGfm);
  const mdast = processor.parse(source);
  return transformMdastToAst(mdast);
}

/**
 * Include ノードの fallbackRaw を再帰的に解析して fallback ASTに変換する
 * 変換後は fallbackRaw を削除する（一時フィールドのため）
 */
function resolveFallbackRaw(nodes: AstNode[]): AstNode[] {
  return nodes.map((node) => {
    if (node.type === "Include") {
      if (node.fallbackRaw !== undefined) {
        const fallbackNodes = buildAstNodes(node.fallbackRaw);
        // fallbackRaw を消費して fallback ASTをセット
        const { fallbackRaw: _consumed, ...rest } = node;
        return { ...rest, fallback: assignIds(fallbackNodes) } as IncludeNode;
      }
      // fallback がある場合は子ノードも再帰処理
      if (node.fallback && node.fallback.length > 0) {
        return { ...node, fallback: resolveFallbackRaw(node.fallback) };
      }
      return node;
    }

    // 子ノードを持つ型を再帰処理
    return resolveChildFallbacks(node);
  });
}

/**
 * 子ノードを持つ型の fallbackRaw を再帰的に解決する
 */
function resolveChildFallbacks(node: AstNode): AstNode {
  switch (node.type) {
    case "Screen":
      return { ...node, children: resolveFallbackRaw(node.children) };
    case "Card":
      return { ...node, children: resolveFallbackRaw(node.children) };
    case "Row":
      return {
        ...node,
        columns: node.columns.map((col) => resolveFallbackRaw(col)),
      };
    case "Alert":
      return { ...node, children: resolveFallbackRaw(node.children) };
    case "Pane":
      return { ...node, children: resolveFallbackRaw(node.children) };
    case "Tab":
      return { ...node, children: resolveFallbackRaw(node.children) };
    case "AccordionItem":
      return { ...node, children: resolveFallbackRaw(node.children) };
    case "GridCell":
      return { ...node, children: resolveFallbackRaw(node.children) };
    default:
      return node;
  }
}

/**
 * ASTノード配列からIncludeノードを再帰的に収集する
 */
function collectIncludes(nodes: AstNode[]): IncludeNode[] {
  const result: IncludeNode[] = [];
  for (const node of nodes) {
    if (node.type === "Include") {
      result.push(node);
    }
    // 子ノードを再帰的に処理
    const children = getChildren(node);
    if (children.length > 0) {
      result.push(...collectIncludes(children));
    }
  }
  return result;
}

/**
 * ノードの子ノード配列を返す（種別ごとに異なるプロパティに対応）
 */
function getChildren(node: AstNode): AstNode[] {
  switch (node.type) {
    case "Screen":
    case "Card":
    case "Alert":
    case "Pane":
    case "Tab":
    case "AccordionItem":
    case "GridCell":
      return node.children;
    case "Row":
      return node.columns.flat();
    case "Include":
      return node.fallback ?? [];
    default:
      return [];
  }
}
