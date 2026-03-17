/**
 * 未知キー検出ルール (FM001)
 * include ブロックの未知キーを検出する
 * unknownKeys は canonicalParser / sugarParser がノードにセットする
 */

import type { AstNode } from "../../ast/types.js";
import type { Diagnostic } from "../types.js";
import { DIAGNOSTIC_CODES } from "../types.js";

/**
 * ASTを走査して未知キーの診断を生成する
 * @param nodes - ASTノード配列
 * @param filePath - 対象ファイルパス
 */
export function checkUnknownKeys(
  nodes: AstNode[],
  filePath: string,
): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  checkNodesRecursively(nodes, filePath, diagnostics);
  return diagnostics;
}

function checkNodesRecursively(
  nodes: AstNode[],
  filePath: string,
  diagnostics: Diagnostic[],
): void {
  for (const node of nodes) {
    if (node.type === "Include" && node.unknownKeys && node.unknownKeys.length > 0) {
      const range = node.position
        ? {
            start: { line: node.position.start.line - 1, character: 0 },
            end: { line: node.position.end.line - 1, character: 0 },
          }
        : { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } };

      for (const key of node.unknownKeys) {
        diagnostics.push({
          code: DIAGNOSTIC_CODES.UNKNOWN_KEY,
          message: `Unknown key '${key}' in include block`,
          severity: "warning",
          filePath,
          range,
        });
      }
    }

    // 子ノードを再帰的にチェック
    const children = getChildren(node);
    if (children.length > 0) {
      checkNodesRecursively(children, filePath, diagnostics);
    }
  }
}

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
