/**
 * lintエンジン
 * 全lintルールを集約して実行するエントリポイント
 * ファイルシステムアクセスが不要なルールのみを実行する
 * （missingPathルールはファイルシステムアクセスが必要なため別途呼び出す）
 */

import type { AstNode } from "../ast/types.js";
import type { Diagnostic } from "./types.js";
import { checkUnknownKeys } from "./rules/unknownKey.js";
import { checkInvalidValues } from "./rules/invalidValue.js";
import { checkUnsupportedEvents } from "./rules/unsupportedEvent.js";
import { checkStructuralRules } from "./rules/structuralRules.js";

/**
 * lintルールを実行してDiagnostic配列を返す
 * ファイルシステムにアクセスしない（純粋関数）
 * @param nodes - ASTノード配列
 * @param filePath - 対象ファイルパス
 */
export function runLintRules(
  nodes: AstNode[],
  filePath: string,
): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  diagnostics.push(...checkUnknownKeys(nodes, filePath));
  diagnostics.push(...checkInvalidValues(nodes, filePath));
  diagnostics.push(...checkUnsupportedEvents(nodes, filePath));
  diagnostics.push(...checkStructuralRules(nodes, filePath));

  return diagnostics;
}
