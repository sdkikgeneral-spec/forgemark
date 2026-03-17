/**
 * 循環参照検出
 * DFS + グレー/ブラックマーク法で循環依存を検出する
 *
 * グレー = 現在のDFSスタック上にある（処理中）
 * ブラック = 全サブツリー探索済み
 *
 * 循環パス全体を ["A.md", "B.md", "A.md"] 形式で保持する
 */

import type { DependencyGraph } from "./dependencyGraph.js";

/** 循環検出結果 */
export interface CycleResult {
  /** 循環が存在するか */
  hasCycle: boolean;
  /**
   * 検出された循環パスの配列
   * 各要素は循環を構成するファイルパスの配列
   * （例: [["A.md", "B.md", "A.md"], ["C.md", "D.md", "C.md"]]）
   */
  cycles: string[][];
}

/** ノードの訪問状態 */
type VisitState = "unvisited" | "gray" | "black";

/**
 * DFS + グレー/ブラック法で循環を検出する
 * @param graph - 依存グラフ
 */
export function detectCycles(graph: DependencyGraph): CycleResult {
  const visitState = new Map<string, VisitState>();
  const cycles: string[][] = [];

  // 全ノードに対してDFSを実行
  for (const [filePath] of graph.getNodes()) {
    if ((visitState.get(filePath) ?? "unvisited") === "unvisited") {
      dfs(filePath, graph, visitState, [], cycles);
    }
  }

  return {
    hasCycle: cycles.length > 0,
    cycles,
  };
}

/**
 * 再帰的DFS
 * @param current - 現在のノード
 * @param graph - 依存グラフ
 * @param visitState - 訪問状態マップ
 * @param path - 現在のDFSパス（循環パス構築用）
 * @param cycles - 検出された循環の蓄積先
 */
function dfs(
  current: string,
  graph: DependencyGraph,
  visitState: Map<string, VisitState>,
  path: string[],
  cycles: string[][],
): void {
  // グレーマーク: 処理中
  visitState.set(current, "gray");
  path.push(current);

  const node = graph.getNode(current);
  if (node) {
    for (const dep of node.dependencies) {
      const depState = visitState.get(dep) ?? "unvisited";

      if (depState === "gray") {
        // 循環検出: グレーノードに再到達
        const cycleStart = path.indexOf(dep);
        const cyclePath = [...path.slice(cycleStart), dep];
        cycles.push(cyclePath);
      } else if (depState === "unvisited") {
        dfs(dep, graph, visitState, path, cycles);
      }
      // ブラックノードはスキップ（既に探索済み）
    }
  }

  // ブラックマーク: 全サブツリー探索済み
  path.pop();
  visitState.set(current, "black");
}

/**
 * 循環パスを人間が読みやすい文字列に変換する
 * @param cycle - 循環パス配列
 * @returns 例: "A.md → B.md → A.md"
 */
export function formatCyclePath(cycle: string[]): string {
  return cycle.join(" → ");
}
