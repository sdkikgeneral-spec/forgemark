import { describe, it, expect } from "vitest";
import { isRowSyntax, parseRowSyntax } from "../../../src/parser/rowParser.js";

describe("isRowSyntax", () => {
  it("[[ A | B ]] を Row構文と認識する", () => {
    expect(isRowSyntax("[[ A | B ]]")).toBe(true);
  });

  it("[[ A | B ]]{.row} を Row構文と認識する", () => {
    expect(isRowSyntax("[[ A | B ]]{.row .right}")).toBe(true);
  });

  it("通常テキストは Row構文ではない", () => {
    expect(isRowSyntax("テキスト")).toBe(false);
  });

  it("[ボタン]{.btn} は Row構文ではない", () => {
    expect(isRowSyntax("[ボタン]{.btn}")).toBe(false);
  });
});

describe("parseRowSyntax", () => {
  it("2列のRowを生成する", () => {
    const result = parseRowSyntax("[[ スペース | [OK]{.btn} ]]");
    expect(result).not.toBeNull();
    expect(result?.type).toBe("Row");
    expect(result?.columns).toHaveLength(2);
  });

  it("3列のRowを生成する", () => {
    const result = parseRowSyntax("[[ A | B | C ]]");
    expect(result?.columns).toHaveLength(3);
  });

  it("クラス属性を解析する", () => {
    const result = parseRowSyntax("[[ A | B ]]{.row .right .gap-8}");
    expect(result?.class).toContain("row");
    expect(result?.class).toContain("right");
    expect(result?.class).toContain("gap-8");
  });

  it("Row構文でない場合はnullを返す", () => {
    expect(parseRowSyntax("テキスト")).toBeNull();
  });

  it("空列をTextノードとして処理する", () => {
    const result = parseRowSyntax("[[ スペース | ]]");
    expect(result?.columns[0]).toBeDefined();
    expect(result?.columns[1]).toBeDefined();
  });
});
