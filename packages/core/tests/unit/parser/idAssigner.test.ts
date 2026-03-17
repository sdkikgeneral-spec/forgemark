import { describe, it, expect } from "vitest";
import { assignIds, resolveIdConflicts } from "../../../src/parser/idAssigner.js";
import type { AstNode, ButtonNode, InputNode, CardNode } from "../../../src/ast/types.js";

function makeButton(label: string): ButtonNode {
  return {
    id: "",
    type: "Button",
    class: [],
    dir: "auto",
    label,
    disabled: false,
    events: {},
  };
}

function makeInput(): InputNode {
  return {
    id: "",
    type: "Input",
    class: [],
    dir: "auto",
    inputType: "text",
    required: false,
    disabled: false,
    readonly: false,
  };
}

function makeCard(label: string, children: AstNode[]): CardNode {
  return {
    id: "",
    type: "Card",
    class: [],
    dir: "auto",
    label,
    children,
  };
}

describe("assignIds", () => {
  it("各ノードに {type}-{index} 形式のIDを付与する", () => {
    const nodes = [makeButton("A"), makeButton("B"), makeInput()];
    const result = assignIds(nodes);
    expect(result[0]?.id).toBe("button-0");
    expect(result[1]?.id).toBe("button-1");
    expect(result[2]?.id).toBe("input-0");
  });

  it("複数の異なる型に対してそれぞれ0始まりのインデックスを付与する", () => {
    const nodes = [makeButton("A"), makeInput(), makeButton("B")];
    const result = assignIds(nodes);
    expect(result[0]?.id).toBe("button-0");
    expect(result[1]?.id).toBe("input-0");
    expect(result[2]?.id).toBe("button-1");
  });

  it("Cardの子ノードも再帰的にIDを付与する", () => {
    const nodes = [makeCard("Test", [makeButton("OK"), makeButton("Cancel")])];
    const result = assignIds(nodes);
    const card = result[0] as CardNode;
    expect(card.id).toBe("card-0");
    expect(card.children[0]?.id).toBe("button-0");
    expect(card.children[1]?.id).toBe("button-1");
  });

  it("ノード型はlowercaseに変換される", () => {
    const nodes = [{ id: "", type: "Screen" as const, class: [], dir: "auto" as const, route: "/", children: [] }];
    const result = assignIds(nodes);
    expect(result[0]?.id).toBe("screen-0");
  });
});

describe("resolveIdConflicts", () => {
  it("include展開後のID衝突を解消する（SC-31: p1-id-01）", () => {
    const existingIds = new Set(["button-0"]);
    const nodes: AstNode[] = [{ ...makeButton("A"), id: "button-0" }];
    const result = resolveIdConflicts(nodes, existingIds);
    expect(result[0]?.id).toBe("button-0-1");
  });

  it("2回includeした場合は -2 サフィックスが付く（SC-31: p1-id-02）", () => {
    const existingIds = new Set(["button-0", "button-0-1"]);
    const nodes: AstNode[] = [{ ...makeButton("A"), id: "button-0" }];
    const result = resolveIdConflicts(nodes, existingIds);
    expect(result[0]?.id).toBe("button-0-2");
  });

  it("衝突がない場合はIDを変更しない", () => {
    const existingIds = new Set<string>();
    const nodes: AstNode[] = [{ ...makeButton("A"), id: "button-0" }];
    const result = resolveIdConflicts(nodes, existingIds);
    expect(result[0]?.id).toBe("button-0");
  });
});
