/**
 * トポロジカルソート
 * 依存グラフをトポロジカル順序でソートして再レンダリング順序を決定する
 * 循環が存在する場合は例外をスローせず、可能な限りソートする
 */

import type { DependencyGraph } from "./dependencyGraph.js";

/**
 * 依存グラフをトポロジカルソート順でファイルパスを返す
 * 依存されているファイルが先（依存元が後）に来る順序
 * @param graph - 依存グラフ
 * @returns トポロジカルソート済みファイルパス配列
 */
export function topoSort(graph: DependencyGraph): string[] {
  const nodes = graph.getNodes();
  const visited = new Set<string>();
  const result: string[] = [];

  /**
   * DFSによるトポロジカルソート
   */
  function visit(filePath: string, visiting: Set<string>): void {
    if (visited.has(filePath)) return;
    if (visiting.has(filePath)) {
      // 循環検出: このノードはスキップ（循環はcycleDetectorで別途処理）
      return;
    }

    visiting.add(filePath);

    const node = nodes.get(filePath);
    if (node) {
      // 依存先を先に訪問
      for (const dep of node.dependencies) {
        visit(dep, visiting);
      }
    }

    visiting.delete(filePath);
    visited.add(filePath);
    result.push(filePath);
  }

  // 全ノードに対してDFSを実行
  for (const [filePath] of nodes) {
    visit(filePath, new Set());
  }

  return result;
}
