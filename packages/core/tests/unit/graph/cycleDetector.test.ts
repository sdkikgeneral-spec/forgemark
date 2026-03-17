import { describe, it, expect } from "vitest";
import { DependencyGraph } from "../../../src/graph/dependencyGraph.js";
import { detectCycles, formatCyclePath } from "../../../src/graph/cycleDetector.js";

describe("detectCycles", () => {
  it("循環なしのグラフはhasCycle=falseを返す", () => {
    const graph = new DependencyGraph();
    graph.update("A.md", ["B.md"]);
    graph.update("B.md", ["C.md"]);
    graph.update("C.md", []);

    const result = detectCycles(graph);
    expect(result.hasCycle).toBe(false);
    expect(result.cycles).toHaveLength(0);
  });

  it("直接循環（A→B→A）を検出する", () => {
    const graph = new DependencyGraph();
    graph.update("A.md", ["B.md"]);
    graph.update("B.md", ["A.md"]);

    const result = detectCycles(graph);
    expect(result.hasCycle).toBe(true);
    expect(result.cycles).toHaveLength(1);
  });

  it("間接循環（A→B→C→A）を検出する", () => {
    const graph = new DependencyGraph();
    graph.update("A.md", ["B.md"]);
    graph.update("B.md", ["C.md"]);
    graph.update("C.md", ["A.md"]);

    const result = detectCycles(graph);
    expect(result.hasCycle).toBe(true);
    // A→B→C→Aの循環
    expect(result.cycles[0]).toContain("A.md");
    expect(result.cycles[0]).toContain("B.md");
    expect(result.cycles[0]).toContain("C.md");
  });

  it("4階層循環（SC-12: p1-deep-02）", () => {
    const graph = new DependencyGraph();
    graph.update("A.md", ["B.md"]);
    graph.update("B.md", ["C.md"]);
    graph.update("C.md", ["D.md"]);
    graph.update("D.md", ["A.md"]);

    const result = detectCycles(graph);
    expect(result.hasCycle).toBe(true);
  });

  it("循環なしの4階層グラフ（SC-12: p1-deep-01）", () => {
    const graph = new DependencyGraph();
    graph.update("A.md", ["B.md"]);
    graph.update("B.md", ["C.md"]);
    graph.update("C.md", ["D.md"]);
    graph.update("D.md", []);

    const result = detectCycles(graph);
    expect(result.hasCycle).toBe(false);
  });

  it("ダイヤモンド依存（SC-32: p1-diamond-01）では循環なし", () => {
    // A→B、A→C、B→D、C→D
    const graph = new DependencyGraph();
    graph.update("A.md", ["B.md", "C.md"]);
    graph.update("B.md", ["D.md"]);
    graph.update("C.md", ["D.md"]);
    graph.update("D.md", []);

    const result = detectCycles(graph);
    expect(result.hasCycle).toBe(false);
  });
});

describe("formatCyclePath", () => {
  it("循環パスを矢印区切りの文字列に変換する", () => {
    expect(formatCyclePath(["A.md", "B.md", "A.md"])).toBe(
      "A.md → B.md → A.md",
    );
  });
});
