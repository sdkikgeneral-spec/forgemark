import { describe, it, expect } from "vitest";
import { checkInvalidValues } from "../../../src/lint/rules/invalidValue.js";
import { checkUnsupportedEvents } from "../../../src/lint/rules/unsupportedEvent.js";
import { checkStructuralRules } from "../../../src/lint/rules/structuralRules.js";
import { checkCircularIncludes } from "../../../src/lint/rules/circularInclude.js";
import { DependencyGraph } from "../../../src/graph/dependencyGraph.js";
import { DIAGNOSTIC_CODES } from "../../../src/lint/types.js";
import type { AstNode, PaneNode, RowNode, IncludeNode } from "../../../src/ast/types.js";

const FILE_PATH = "test.md";

describe("checkInvalidValues", () => {
  it("Pane の flex と w の競合を警告する（SC-22: p1-panes-06）", () => {
    const pane: PaneNode = {
      id: "pane-0",
      type: "Pane",
      class: [],
      dir: "auto",
      label: "テスト",
      flex: 1,
      w: 240,
      collapsed: false,
      children: [],
    };
    const diagnostics = checkInvalidValues([pane], FILE_PATH);
    expect(diagnostics.some((d) => d.code === DIAGNOSTIC_CODES.PANE_SIZE_CONFLICT)).toBe(true);
  });

  it("正常なPaneノードは警告なし", () => {
    const pane: PaneNode = {
      id: "pane-0",
      type: "Pane",
      class: [],
      dir: "auto",
      label: "テスト",
      flex: 1,
      collapsed: false,
      children: [],
    };
    const diagnostics = checkInvalidValues([pane], FILE_PATH);
    expect(diagnostics).toHaveLength(0);
  });
});

describe("checkUnsupportedEvents", () => {
  it("on:hover は未サポートイベントとして警告する", () => {
    const button: AstNode = {
      id: "button-0",
      type: "Button",
      class: [],
      dir: "auto",
      label: "テスト",
      disabled: false,
      events: { "on:hover": "foo()" },
    };
    const diagnostics = checkUnsupportedEvents([button], FILE_PATH);
    expect(diagnostics.some((d) => d.code === DIAGNOSTIC_CODES.UNSUPPORTED_EVENT)).toBe(true);
  });

  it("on:click は正常", () => {
    const button: AstNode = {
      id: "button-0",
      type: "Button",
      class: [],
      dir: "auto",
      label: "テスト",
      disabled: false,
      events: { "on:click": "foo()" },
    };
    const diagnostics = checkUnsupportedEvents([button], FILE_PATH);
    expect(diagnostics).toHaveLength(0);
  });
});

describe("checkStructuralRules", () => {
  it("Row内のblock includeに警告する", () => {
    const includeNode: IncludeNode = {
      id: "include-0",
      type: "Include",
      class: [],
      dir: "auto",
      path: "./foo.md",
      as: "block",
      resolved: false,
    };
    const row: RowNode = {
      id: "row-0",
      type: "Row",
      class: [],
      dir: "auto",
      columns: [[includeNode]],
    };
    const diagnostics = checkStructuralRules([row], FILE_PATH);
    expect(diagnostics.some((d) => d.code === DIAGNOSTIC_CODES.BLOCK_IN_ROW)).toBe(true);
  });

  it("Row内のinline includeは警告なし", () => {
    const includeNode: IncludeNode = {
      id: "include-0",
      type: "Include",
      class: [],
      dir: "auto",
      path: "./foo.md",
      as: "inline",
      resolved: false,
    };
    const row: RowNode = {
      id: "row-0",
      type: "Row",
      class: [],
      dir: "auto",
      columns: [[includeNode]],
    };
    const diagnostics = checkStructuralRules([row], FILE_PATH);
    expect(diagnostics).toHaveLength(0);
  });
});

describe("checkCircularIncludes", () => {
  it("循環参照をerrorとして報告する", () => {
    const graph = new DependencyGraph();
    graph.update("A.md", ["B.md"]);
    graph.update("B.md", ["A.md"]);

    const diagnostics = checkCircularIncludes(graph);
    expect(diagnostics.some((d) => d.code === DIAGNOSTIC_CODES.CIRCULAR_INCLUDE)).toBe(true);
    expect(diagnostics.some((d) => d.severity === "error")).toBe(true);
  });

  it("循環なしのグラフは診断なし", () => {
    const graph = new DependencyGraph();
    graph.update("A.md", ["B.md"]);
    graph.update("B.md", []);

    const diagnostics = checkCircularIncludes(graph);
    expect(diagnostics).toHaveLength(0);
  });

  it("循環パスが全関連ファイルに報告される", () => {
    const graph = new DependencyGraph();
    graph.update("A.md", ["B.md"]);
    graph.update("B.md", ["A.md"]);

    const diagnostics = checkCircularIncludes(graph);
    const filePaths = diagnostics.map((d) => d.filePath);
    expect(filePaths).toContain("A.md");
    expect(filePaths).toContain("B.md");
  });
});
