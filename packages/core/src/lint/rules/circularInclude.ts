/**
 * 循環参照検出ルール (FM004)
 * 依存グラフの循環参照を診断として報告する
 */

import type { Diagnostic } from "../types.js";
import { DIAGNOSTIC_CODES } from "../types.js";
import type { DependencyGraph } from "../../graph/dependencyGraph.js";
import { detectCycles, formatCyclePath } from "../../graph/cycleDetector.js";

/**
 * 依存グラフから循環参照の診断を生成する
 * @param graph - 依存グラフ
 * @returns 循環参照の診断情報配列
 */
export function checkCircularIncludes(
  graph: DependencyGraph,
): Diagnostic[] {
  const { cycles } = detectCycles(graph);
  const diagnostics: Diagnostic[] = [];

  for (const cycle of cycles) {
    const cyclePath = formatCyclePath(cycle);
    // 循環に含まれる全ファイルに診断を報告する
    const uniqueFiles = new Set(cycle.slice(0, -1)); // 末尾の重複ファイルを除く

    for (const filePath of uniqueFiles) {
      diagnostics.push({
        code: DIAGNOSTIC_CODES.CIRCULAR_INCLUDE,
        message: `Circular include detected: ${cyclePath}`,
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
