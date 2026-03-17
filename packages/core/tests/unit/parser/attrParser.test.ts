import { describe, it, expect } from "vitest";
import { parseAttrBlock } from "../../../src/parser/attrParser.js";

describe("parseAttrBlock", () => {
  describe("クラス属性", () => {
    it("単一クラスを解析する", () => {
      const result = parseAttrBlock("{.btn}");
      expect(result.classes).toEqual(["btn"]);
    });

    it("複数クラスを解析する", () => {
      const result = parseAttrBlock("{.btn .primary}");
      expect(result.classes).toEqual(["btn", "primary"]);
    });

    it("波括弧なしでも解析できる", () => {
      const result = parseAttrBlock(".btn .primary");
      expect(result.classes).toEqual(["btn", "primary"]);
    });
  });

  describe("キーバリュー属性", () => {
    it("type属性を解析する", () => {
      const result = parseAttrBlock("{type:email}");
      expect(result.attrs["type"]).toBe("email");
    });

    it("required（値なし）をtrueとして解析する", () => {
      const result = parseAttrBlock("{required}");
      expect(result.attrs["required"]).toBe(true);
    });

    it("複数属性を解析する", () => {
      const result = parseAttrBlock("{type:email required}");
      expect(result.attrs["type"]).toBe("email");
      expect(result.attrs["required"]).toBe(true);
    });

    it("dir属性を解析する", () => {
      const result = parseAttrBlock("{dir:rtl}");
      expect(result.attrs["dir"]).toBe("rtl");
    });
  });

  describe("クォート付き値", () => {
    it("ダブルクォートで囲んだ値を解析する（SC-16: p1-esc-01）", () => {
      const result = parseAttrBlock(`{placeholder:"it's a test"}`);
      expect(result.attrs["placeholder"]).toBe("it's a test");
    });

    it("値中にネストしたシングルクォートを処理する（SC-16: p1-esc-02）", () => {
      const result = parseAttrBlock(`{on:click="dlg.close('ok')"}`);
      expect(result.events["on:click"]).toBe("dlg.close('ok')");
    });

    it("エスケープされた改行を処理する（SC-16: p1-esc-03）", () => {
      const result = parseAttrBlock(`{placeholder:"line1\\nline2"}`);
      expect(result.attrs["placeholder"]).toBe("line1\nline2");
    });

    it("Tailwindブラケット記法を解析する（SC-16: p1-esc-04）", () => {
      const result = parseAttrBlock(`{class:"w-[320px]"}`);
      // クォートなし class 指定はattrsに入る
      expect(result.attrs["class"]).toBe("w-[320px]");
    });
  });

  describe("イベントハンドラ", () => {
    it("on:click イベントを解析する", () => {
      const result = parseAttrBlock(`{on:click="auth.login()"}`);
      expect(result.events["on:click"]).toBe("auth.login()");
    });

    it("on:changeイベントを解析する", () => {
      const result = parseAttrBlock(`{on:change="form.update()"}`);
      expect(result.events["on:change"]).toBe("form.update()");
    });
  });

  describe("複合テスト", () => {
    it("クラスとキーバリューとイベントを同時に解析する", () => {
      const result = parseAttrBlock(`{.btn .primary type:submit on:click="auth.login()"}`);
      expect(result.classes).toEqual(["btn", "primary"]);
      expect(result.attrs["type"]).toBe("submit");
      expect(result.events["on:click"]).toBe("auth.login()");
    });
  });

  describe("エッジケース", () => {
    it("空文字列を解析する", () => {
      const result = parseAttrBlock("");
      expect(result.classes).toEqual([]);
      expect(result.attrs).toEqual({});
      expect(result.events).toEqual({});
    });

    it("空の波括弧を解析する", () => {
      const result = parseAttrBlock("{}");
      expect(result.classes).toEqual([]);
      expect(result.attrs).toEqual({});
    });
  });
});
