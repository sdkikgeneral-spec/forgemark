/**
 * 構造的ルール (FM006)
 * H3位置の不正、block-in-Row等の構造的な問題を検出する
 */

import type { AstNode } from "../../ast/types.js";
import type { Diagnostic } from "../types.js";
import { DIAGNOSTIC_CODES } from "../types.js";

/**
 * ASTノードから構造的問題の診断を生成する
 */
export function checkStructuralRules(
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
    // Row内のblock includeチェック (FM006)
    if (node.type === "Row") {
      for (const column of node.columns) {
        for (const child of column) {
          if (child.type === "Include" && child.as === "block") {
            diagnostics.push({
              code: DIAGNOSTIC_CODES.BLOCK_IN_ROW,
              message: `Inline include required inside Row (use as: inline)`,
              severity: "warning",
              filePath,
              range: {
                start: { line: 0, character: 0 },
                end: { line: 0, character: 0 },
              },
            });
          }
        }
      }
    }

    // UnknownノードはH3位置不正を示す可能性がある (FM007)
    if (node.type === "Unknown" && node.raw.startsWith("### ")) {
      diagnostics.push({
        code: DIAGNOSTIC_CODES.H3_OUTSIDE_CONTEXT,
        message: `H3 is only valid inside a MenuBar/Tabs/Accordion/Panes/Grid (## {.menubar/.tabs/...})`,
        severity: "warning",
        filePath,
        range: {
          start: { line: 0, character: 0 },
          end: { line: 0, character: 0 },
        },
      });
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
    default:
      return [];
  }
}
