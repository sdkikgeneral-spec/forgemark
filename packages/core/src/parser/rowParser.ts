/**
 * Row記法パーサー
 * [[ A | B | C ]]{.class} 形式のRow構文を解析する
 * remarkが段落内のインライン記法を変換してしまうため、
 * テキスト文字列を直接解析する手書きパーサーを使用する
 */

import { parseAttrBlock } from "./attrParser.js";
import { parseInlineElements } from "./inlineParser.js";
import { replaceEscapes, restoreEscapes } from "./escapeHandler.js";
import type { RowNode, AstNode, TextNode } from "../ast/types.js";

/** Row構文にマッチするパターン */
const ROW_PATTERN = /^\[\[([\s\S]*?)\]\](\{[^}]*(?:\{[^}]*\}[^}]*)?\})?/;

/**
 * テキスト行がRow記法かどうかを判定する
 */
export function isRowSyntax(text: string): boolean {
  const escaped = replaceEscapes(text);
  return ROW_PATTERN.test(escaped.trim());
}

/**
 * テキスト行をRowノードに変換する
 * @param text - Row記法を含むテキスト行（例: "[[ A | B ]]{.row}"）
 * @returns RowノードまたはnullU（Row記法でない場合）
 */
export function parseRowSyntax(text: string): RowNode | null {
  const escaped = replaceEscapes(text.trim());
  const match = escaped.match(ROW_PATTERN);
  if (!match) return null;

  const innerEscaped = match[1] ?? "";
  const attrRaw = match[2] ?? "";
  const attrs = parseAttrBlock(attrRaw);

  // | で列を分割（エスケープ済みパイプは \x00PIPE\x00）
  const columnTexts = innerEscaped.split("|");
  const columns: AstNode[][] = columnTexts.map((colText) => {
    const restored = restoreEscapes(colText.trim());
    return parseColumnContent(restored);
  });

  return {
    id: "",
    type: "Row",
    class: attrs.classes,
    dir: extractDir(attrs.attrs),
    columns,
  };
}

/**
 * Row列の内容をASTノード配列に変換する
 */
function parseColumnContent(text: string): AstNode[] {
  const trimmed = text.trim();
  if (!trimmed) {
    // 空列はテキストノード（スペーサー）として扱う
    return [
      {
        id: "",
        type: "Text",
        class: [],
        dir: "auto",
        content: "",
      } satisfies TextNode,
    ];
  }

  // インライン要素をパース
  const inlineNodes = parseInlineElements(trimmed);
  if (inlineNodes.length > 0) return inlineNodes;

  // パースできない場合はTextノード
  return [
    {
      id: "",
      type: "Text",
      class: [],
      dir: "auto",
      content: trimmed,
    } satisfies TextNode,
  ];
}

/**
 * 属性マップからDir値を抽出する
 */
function extractDir(
  attrs: Record<string, string | true>,
): "auto" | "ltr" | "rtl" {
  const dir = attrs["dir"];
  if (dir === "ltr" || dir === "rtl" || dir === "auto") return dir;
  return "auto";
}
