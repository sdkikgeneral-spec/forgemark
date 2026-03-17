import { describe, it, expect } from "vitest";
import { DependencyGraph } from "../../../src/graph/dependencyGraph.js";
import { topoSort } from "../../../src/graph/topoSort.js";

describe("topoSort", () => {
  it("依存先が依存元より前に来る", () => {
    const graph = new DependencyGraph();
    graph.update("A.md", ["B.md"]);
    graph.update("B.md", ["C.md"]);
    graph.update("C.md", []);

    const order = topoSort(graph);
    const aIdx = order.indexOf("A.md");
    const bIdx = order.indexOf("B.md");
    const cIdx = order.indexOf("C.md");

    // C → B → A の順序
    expect(cIdx).toBeLessThan(bIdx);
    expect(bIdx).toBeLessThan(aIdx);
  });

  it("全ノードを含む", () => {
    const graph = new DependencyGraph();
    graph.update("A.md", ["B.md"]);
    graph.update("B.md", []);

    const order = topoSort(graph);
    expect(order).toContain("A.md");
    expect(order).toContain("B.md");
  });

  it("ダイヤモンド依存でDが最初に来る", () => {
    const graph = new DependencyGraph();
    graph.update("A.md", ["B.md", "C.md"]);
    graph.update("B.md", ["D.md"]);
    graph.update("C.md", ["D.md"]);
    graph.update("D.md", []);

    const order = topoSort(graph);
    const dIdx = order.indexOf("D.md");
    const aIdx = order.indexOf("A.md");
    // D は A より前
    expect(dIdx).toBeLessThan(aIdx);
  });

  it("循環があっても無限ループしない", () => {
    const graph = new DependencyGraph();
    graph.update("A.md", ["B.md"]);
    graph.update("B.md", ["A.md"]);

    // 例外をスローせず、全ノードを返す
    expect(() => topoSort(graph)).not.toThrow();
    const order = topoSort(graph);
    expect(order.length).toBeGreaterThan(0);
  });
});
