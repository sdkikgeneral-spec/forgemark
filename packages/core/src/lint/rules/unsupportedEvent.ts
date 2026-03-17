/**
 * 未サポートイベント検出ルール (FM005)
 * on:click, on:change, on:submit 以外のイベントを検出する
 */

import type { AstNode } from "../../ast/types.js";
import type { Diagnostic } from "../types.js";
import { DIAGNOSTIC_CODES } from "../types.js";

/** MVPでサポートされるイベント */
const SUPPORTED_EVENTS = new Set(["on:click", "on:change", "on:submit"]);

/**
 * ASTノードから未サポートイベントの診断を生成する
 */
export function checkUnsupportedEvents(
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
    // eventsプロパティを持つノードをチェック
    if ("events" in node && node.events) {
      for (const eventKey of Object.keys(node.events)) {
        if (!SUPPORTED_EVENTS.has(eventKey)) {
          diagnostics.push({
            code: DIAGNOSTIC_CODES.UNSUPPORTED_EVENT,
            message: `Unsupported event '${eventKey}'. Supported events: on:click, on:change, on:submit`,
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
    case "Menu":
      return node.items;
    case "Toolbar":
      return node.groups.flat();
    default:
      return [];
  }
}
