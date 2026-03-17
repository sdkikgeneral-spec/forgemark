/**
 * includeフェンスド正規形パーサー
 * ```include
 * path: ./foo.md
 * as: block
 * dir: auto
 * ---
 * フォールバックコンテンツ
 * ``` の形式を解析する
 */

import type { IncludeNode } from "../ast/types.js";

/** サポートされるincludeキー */
const SUPPORTED_KEYS = new Set(["path", "as", "dir", "class"]);

/** 未知キーの警告情報 */
export interface UnknownKeyWarning {
  key: string;
}

/** 正規形パース結果 */
export interface CanonicalParseResult {
  node: IncludeNode | null;
  unknownKeys: UnknownKeyWarning[];
}

/**
 * フェンスドincludeブロックの内容を解析する
 * @param content - コードブロック内のテキスト（```include と ``` を除いた部分）
 */
export function parseCanonicalInclude(content: string): IncludeNode | null {
  const { node } = parseCanonicalIncludeWithWarnings(content);
  return node;
}

/**
 * フェンスドincludeブロックを解析して未知キー警告も返す
 */
export function parseCanonicalIncludeWithWarnings(
  content: string,
): CanonicalParseResult {
  const unknownKeys: UnknownKeyWarning[] = [];
  const lines = content.split("\n");

  let path = "";
  let as: "block" | "inline" = "block";
  let dir: "auto" | "ltr" | "rtl" = "auto";
  const classes: string[] = [];
  let fallbackStart = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";

    // --- 区切り: フォールバックコンテンツ開始
    if (line.trim() === "---") {
      fallbackStart = i + 1;
      break;
    }

    // キーバリュー行: "key: value" の形式
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;

    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();

    if (!SUPPORTED_KEYS.has(key)) {
      unknownKeys.push({ key });
      continue;
    }

    switch (key) {
      case "path":
        path = value;
        break;
      case "as":
        if (value === "inline" || value === "block") {
          as = value;
        }
        break;
      case "dir":
        if (value === "ltr" || value === "rtl" || value === "auto") {
          dir = value;
        }
        break;
      case "class":
        // ".class1 .class2" → ["class1", "class2"]
        classes.push(
          ...value
            .split(/\s+/)
            .filter((c) => c.startsWith("."))
            .map((c) => c.slice(1)),
        );
        break;
    }
  }

  if (!path) return { node: null, unknownKeys };

  // フォールバックの生Markdown文字列を保持（parser/index.ts で ASTへ変換する）
  const fallbackRaw =
    fallbackStart >= 0 ? lines.slice(fallbackStart).join("\n") : undefined;

  const node: IncludeNode = {
    id: "",
    type: "Include",
    class: classes,
    dir,
    path,
    as,
    resolved: false,
    // fallback は parser/index.ts が fallbackRaw を解析後にセットする
    fallback: fallbackRaw !== undefined ? [] : undefined,
    fallbackRaw,
    unknownKeys: unknownKeys.length > 0 ? unknownKeys.map((w) => w.key) : undefined,
  };

  return { node, unknownKeys };
}
