import { describe, it, expect } from "vitest";
import { DependencyGraph } from "../../src/graph/dependencyGraph.js";
import { detectCycles } from "../../src/graph/cycleDetector.js";
import { topoSort } from "../../src/graph/topoSort.js";
import { parseMarkdown } from "../../src/parser/index.js";

describe("include依存グラフ - 統合テスト", () => {
  describe("依存グラフの構築", () => {
    it("parseMarkdownの結果からグラフを構築できる", () => {
      const md = "# /test\n\n```include\npath: ./comp.md\nas: block\ndir: auto\n```";
      const result = parseMarkdown(md, "main.md");

      const graph = new DependencyGraph();
      const deps = result.includes.map((inc) => inc.path);
      graph.update("main.md", deps);

      expect(graph.has("main.md")).toBe(true);
      expect(graph.has("./comp.md")).toBe(true);
    });
  });

  describe("循環検出とグラフの組み合わせ", () => {
    it("3ファイル構成で循環なしを正しく判定する（SC-12: p1-deep-01拡張）", () => {
      const graph = new DependencyGraph();
      graph.update("A.md", ["B.md"]);
      graph.update("B.md", ["C.md"]);
      graph.update("C.md", []);

      const { hasCycle } = detectCycles(graph);
      expect(hasCycle).toBe(false);

      const order = topoSort(graph);
      // C→B→A の依存順
      const cIdx = order.indexOf("C.md");
      const aIdx = order.indexOf("A.md");
      expect(cIdx).toBeLessThan(aIdx);
    });

    it("循環グラフでtopoSortが無限ループしない", () => {
      const graph = new DependencyGraph();
      graph.update("A.md", ["B.md"]);
      graph.update("B.md", ["C.md"]);
      graph.update("C.md", ["A.md"]);

      const { hasCycle, cycles } = detectCycles(graph);
      expect(hasCycle).toBe(true);
      expect(cycles[0]).toContain("A.md");

      // topoSortも無限ループしない
      expect(() => topoSort(graph)).not.toThrow();
    });
  });

  describe("差分更新", () => {
    it("ファイル変更後にgetAffectedが正しい影響範囲を返す", () => {
      const graph = new DependencyGraph();
      graph.update("main.md", ["header.md", "content.md"]);
      graph.update("header.md", ["logo.md"]);
      graph.update("content.md", []);
      graph.update("logo.md", []);

      // logo.md が変更された場合
      const affected = graph.getAffected("logo.md");
      expect(affected.has("logo.md")).toBe(true);
      expect(affected.has("header.md")).toBe(true);
      expect(affected.has("main.md")).toBe(true);
      // content.md は影響なし
      expect(affected.has("content.md")).toBe(false);
    });
  });
});
