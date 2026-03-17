/**
 * 不正値検出ルール (FM002)
 * dir属性の不正値、as属性の不正値等を検出する
 */

import type { AstNode } from "../../ast/types.js";
import type { Diagnostic } from "../types.js";
import { DIAGNOSTIC_CODES } from "../types.js";

/** dirの有効値 */
const VALID_DIRS = new Set(["auto", "ltr", "rtl"]);
/** asの有効値 */
const VALID_AS_VALUES = new Set(["block", "inline"]);
/** Alertバリアントの有効値 */
const VALID_ALERT_VARIANTS = new Set(["info", "success", "warning", "error"]);

/**
 * ASTノードから不正値の診断を生成する
 */
export function checkInvalidValues(
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
    // dir属性チェック
    if (node.dir && !VALID_DIRS.has(node.dir)) {
      diagnostics.push({
        code: DIAGNOSTIC_CODES.INVALID_VALUE,
        message: `Invalid dir value '${node.dir}'. Must be one of: auto, ltr, rtl`,
        severity: "error",
        filePath,
        range: {
          start: { line: 0, character: 0 },
          end: { line: 0, character: 0 },
        },
      });
    }

    // include as属性チェック
    if (node.type === "Include" && !VALID_AS_VALUES.has(node.as)) {
      diagnostics.push({
        code: DIAGNOSTIC_CODES.INVALID_VALUE,
        message: `Invalid 'as' value '${node.as}'. Must be 'block' or 'inline'`,
        severity: "error",
        filePath,
        range: {
          start: { line: 0, character: 0 },
          end: { line: 0, character: 0 },
        },
      });
    }

    // Alert バリアントチェック
    if (node.type === "Alert" && !VALID_ALERT_VARIANTS.has(node.variant)) {
      diagnostics.push({
        code: DIAGNOSTIC_CODES.INVALID_VALUE,
        message: `Invalid alert variant '${node.variant}'`,
        severity: "error",
        filePath,
        range: {
          start: { line: 0, character: 0 },
          end: { line: 0, character: 0 },
        },
      });
    }

    // Pane flex/w 競合チェック (FM008)
    if (node.type === "Pane" && node.flex !== undefined && node.w !== undefined) {
      diagnostics.push({
        code: DIAGNOSTIC_CODES.PANE_SIZE_CONFLICT,
        message: `Cannot specify both 'flex' and 'w'/'h' on the same Pane`,
        severity: "warning",
        filePath,
        range: {
          start: { line: 0, character: 0 },
          end: { line: 0, character: 0 },
        },
      });
    }

    // Badgeのon:click禁止チェック
    if (node.type === "Badge") {
      // Badgeにはeventsプロパティがないので型レベルで防止済み
    }
  }
}
