/**
 * パス不在検出ルール (FM003)
 * include の path が存在しない場合に診断を生成する
 * このルールのみがファイルシステムにアクセスする
 */

import type { AstNode, IncludeNode } from "../../ast/types.js";
import type { Diagnostic } from "../types.js";
import { DIAGNOSTIC_CODES } from "../types.js";
import { resolvePath } from "../../include/pathResolver.js";

/**
 * IncludeノードのパスをチェックしてMissingPath診断を生成する
 * @param nodes - ASTノード配列
 * @param filePath - 対象ファイルパス
 * @param workspaceRoot - ワークスペースルート絶対パス
 */
export function checkMissingPaths(
  nodes: AstNode[],
  filePath: string,
  workspaceRoot: string,
): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const includes = collectIncludes(nodes);

  for (const includeNode of includes) {
    const result = resolvePath(includeNode.path, filePath, workspaceRoot);

    if (result.isOutsideWorkspace) {
      diagnostics.push({
        code: DIAGNOSTIC_CODES.MISSING_PATH,
        message: `Include path '${includeNode.path}' is outside the workspace`,
        severity: "error",
        filePath,
        range: {
          start: { line: 0, character: 0 },
          end: { line: 0, character: 0 },
        },
      });
    } else if (!result.exists) {
      diagnostics.push({
        code: DIAGNOSTIC_CODES.MISSING_PATH,
        message: `Include path '${includeNode.path}' does not exist`,
        severity: "error",
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

/**
 * ASTノード配列からIncludeノードを再帰的に収集する
 */
function collectIncludes(nodes: AstNode[]): IncludeNode[] {
  const result: IncludeNode[] = [];
  for (const node of nodes) {
    if (node.type === "Include") {
      result.push(node);
    }
    const children = getChildren(node);
    if (children.length > 0) {
      result.push(...collectIncludes(children));
    }
  }
  return result;
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
