import { describe, it, expect } from "vitest";
import { DependencyGraph } from "../../../src/graph/dependencyGraph.js";

describe("DependencyGraph", () => {
  describe("update", () => {
    it("新しいノードを追加できる", () => {
      const graph = new DependencyGraph();
      graph.update("A.md", ["B.md", "C.md"]);

      expect(graph.has("A.md")).toBe(true);
      expect(graph.has("B.md")).toBe(true);
      expect(graph.has("C.md")).toBe(true);
    });

    it("依存エッジを正しく設定する", () => {
      const graph = new DependencyGraph();
      graph.update("A.md", ["B.md"]);

      const aNode = graph.getNode("A.md");
      const bNode = graph.getNode("B.md");
      expect(aNode?.dependencies.has("B.md")).toBe(true);
      expect(bNode?.dependents.has("A.md")).toBe(true);
    });

    it("既存ノードの依存を更新した場合、古いエッジを削除する", () => {
      const graph = new DependencyGraph();
      graph.update("A.md", ["B.md"]);
      graph.update("A.md", ["C.md"]); // BからCへ変更

      const aNode = graph.getNode("A.md");
      const bNode = graph.getNode("B.md");
      expect(aNode?.dependencies.has("B.md")).toBe(false);
      expect(aNode?.dependencies.has("C.md")).toBe(true);
      expect(bNode?.dependents.has("A.md")).toBe(false);
    });
  });

  describe("remove", () => {
    it("ノードを削除できる", () => {
      const graph = new DependencyGraph();
      graph.update("A.md", ["B.md"]);
      graph.remove("A.md");
      expect(graph.has("A.md")).toBe(false);
    });

    it("削除時に依存エッジを適切にクリーンアップする", () => {
      const graph = new DependencyGraph();
      graph.update("A.md", ["B.md"]);
      graph.remove("A.md");
      const bNode = graph.getNode("B.md");
      expect(bNode?.dependents.has("A.md")).toBe(false);
    });
  });

  describe("getAffected", () => {
    it("変更ファイルを含む影響範囲を返す", () => {
      const graph = new DependencyGraph();
      graph.update("A.md", ["B.md"]);
      graph.update("B.md", []);

      const affected = graph.getAffected("B.md");
      expect(affected.has("B.md")).toBe(true);
      expect(affected.has("A.md")).toBe(true);
    });

    it("直接的な依存がない場合は自身のみ", () => {
      const graph = new DependencyGraph();
      graph.update("A.md", []);

      const affected = graph.getAffected("A.md");
      expect(affected.size).toBe(1);
      expect(affected.has("A.md")).toBe(true);
    });

    it("ダイヤモンド依存でDが変更された場合A/B/C全てに影響する（SC-32: p1-diamond-02）", () => {
      const graph = new DependencyGraph();
      graph.update("A.md", ["B.md", "C.md"]);
      graph.update("B.md", ["D.md"]);
      graph.update("C.md", ["D.md"]);
      graph.update("D.md", []);

      const affected = graph.getAffected("D.md");
      expect(affected.has("D.md")).toBe(true);
      expect(affected.has("B.md")).toBe(true);
      expect(affected.has("C.md")).toBe(true);
      expect(affected.has("A.md")).toBe(true);
    });
  });

  describe("size", () => {
    it("ノード数を返す", () => {
      const graph = new DependencyGraph();
      graph.update("A.md", ["B.md"]);
      // A.md と B.md の2ノード
      expect(graph.size).toBe(2);
    });
  });
});
