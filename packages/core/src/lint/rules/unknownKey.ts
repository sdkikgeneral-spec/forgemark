/**
 * 未知キー検出ルール (FM001)
 * include ブロックの未知キーを検出する
 */

import type { AstNode } from "../../ast/types.js";
import type { Diagnostic } from "../types.js";
import { DIAGNOSTIC_CODES } from "../types.js";

/** includeブロックでサポートされるキー */
const SUPPORTED_INCLUDE_KEYS = new Set(["path", "as", "dir", "class"]);

/**
 * ASTノードから未知キーの診断を生成する
 * @param nodes - ASTノード配列
 * @param filePath - 対象ファイルパス
 * @param unknownIncludeKeys - parseCanonicalIncludeWithWarningsが返す未知キー情報
 */
export function checkUnknownKeys(
  nodes: AstNode[],
  filePath: string,
  unknownIncludeKeys?: Array<{ key: string; nodeIndex: number }>,
): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  if (unknownIncludeKeys) {
    for (const { key } of unknownIncludeKeys) {
      diagnostics.push({
        code: DIAGNOSTIC_CODES.UNKNOWN_KEY,
        message: `Unknown key '${key}' in include block`,
        severity: "warning",
        filePath,
        range: {
          start: { line: 0, character: 0 },
          end: { line: 0, character: 0 },
        },
      });
    }
  }

  return diagnostics;
}

export { SUPPORTED_INCLUDE_KEYS };
