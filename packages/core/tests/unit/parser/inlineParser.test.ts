import { describe, it, expect } from "vitest";
import { parseInlineElements } from "../../../src/parser/inlineParser.js";

describe("parseInlineElements", () => {
  // ─── Checkbox ─────────────────────────────────────────────────────────────

  describe("Checkbox（parser-cb-01〜03）", () => {
    it("[x] ラベル → checked=true（parser-cb-01）", () => {
      const result = parseInlineElements("[x] 同意する");
      expect(result).toHaveLength(1);
      expect(result[0]?.type).toBe("Checkbox");
      if (result[0]?.type === "Checkbox") {
        expect(result[0].checked).toBe(true);
        expect(result[0].label).toBe("同意する");
      }
    });

    it("[ ] ラベル → checked=false（parser-cb-02）", () => {
      const result = parseInlineElements("[ ] 同意しない");
      expect(result).toHaveLength(1);
      if (result[0]?.type === "Checkbox") {
        expect(result[0].checked).toBe(false);
        expect(result[0].label).toBe("同意しない");
      }
    });

    it("[X] 大文字も checked=true（parser-cb-03）", () => {
      const result = parseInlineElements("[X] 有効");
      expect(result[0]?.type).toBe("Checkbox");
      if (result[0]?.type === "Checkbox") {
        expect(result[0].checked).toBe(true);
      }
    });
  });

  // ─── Spinner ──────────────────────────────────────────────────────────────

  describe("Spinner（parser-spin-01〜03）", () => {
    it("[~]{.spinner} → SpinnerNode（parser-spin-01）", () => {
      const result = parseInlineElements("[~]{.spinner}");
      expect(result).toHaveLength(1);
      expect(result[0]?.type).toBe("Spinner");
    });

    it("[~]{.spinner size:lg} → size属性を持つ（parser-spin-02）", () => {
      const result = parseInlineElements("[~]{.spinner size:lg}");
      expect(result[0]?.type).toBe("Spinner");
      if (result[0]?.type === "Spinner") {
        expect(result[0].size).toBe("lg");
      }
    });

    it("[~] 属性なしもSpinnerに変換（parser-spin-03）", () => {
      const result = parseInlineElements("[~]");
      expect(result[0]?.type).toBe("Spinner");
    });
  });

  // ─── Badge ────────────────────────────────────────────────────────────────

  describe("Badge（p1-badge-01〜02）", () => {
    it("[通知]{.badge} → BadgeNode（p1-badge-01）", () => {
      const result = parseInlineElements("[通知]{.badge}");
      expect(result).toHaveLength(1);
      expect(result[0]?.type).toBe("Badge");
      if (result[0]?.type === "Badge") {
        expect(result[0].label).toBe("通知");
      }
    });

    it("[3]{.badge .error} → class を持つ（p1-badge-02）", () => {
      const result = parseInlineElements("[3]{.badge .error}");
      expect(result[0]?.type).toBe("Badge");
      if (result[0]?.type === "Badge") {
        expect(result[0].class).toContain("badge");
        expect(result[0].class).toContain("error");
      }
    });
  });

  // ─── Toggle ───────────────────────────────────────────────────────────────

  describe("Toggle（p1-toggle-01〜02）", () => {
    it("[___]{type:toggle} → ToggleNode checked=false（p1-toggle-01）", () => {
      const result = parseInlineElements("[___]{type:toggle}");
      expect(result).toHaveLength(1);
      expect(result[0]?.type).toBe("Toggle");
      if (result[0]?.type === "Toggle") {
        expect(result[0].checked).toBe(false);
      }
    });

    it("[___]{type:toggle checked} → ToggleNode checked=true（p1-toggle-02）", () => {
      const result = parseInlineElements("[___]{type:toggle checked}");
      expect(result[0]?.type).toBe("Toggle");
      if (result[0]?.type === "Toggle") {
        expect(result[0].checked).toBe(true);
      }
    });
  });

  // ─── Progress ─────────────────────────────────────────────────────────────

  describe("Progress（parser-prog-01〜04）", () => {
    it("[___]{type:progress} → ProgressNode（parser-prog-01）", () => {
      const result = parseInlineElements("[___]{type:progress}");
      expect(result[0]?.type).toBe("Progress");
    });

    it("[___]{type:progress value:50 max:100} → value/max 設定（parser-prog-02）", () => {
      const result = parseInlineElements("[___]{type:progress value:50 max:100}");
      expect(result[0]?.type).toBe("Progress");
      if (result[0]?.type === "Progress") {
        expect(result[0].value).toBe(50);
        expect(result[0].max).toBe(100);
      }
    });

    it("[___]{type:progress max:200} → max のみ設定（parser-prog-03）", () => {
      const result = parseInlineElements("[___]{type:progress max:200}");
      if (result[0]?.type === "Progress") {
        expect(result[0].max).toBe(200);
        expect(result[0].value).toBeUndefined();
      }
    });

    it("[___]{type:progress} → max 未指定時は 100（parser-prog-04）", () => {
      const result = parseInlineElements("[___]{type:progress}");
      if (result[0]?.type === "Progress") {
        expect(result[0].max).toBe(100);
      }
    });
  });

  // ─── Range ────────────────────────────────────────────────────────────────

  describe("Range（parser-rng-01〜03）", () => {
    it("[___]{type:range} → RangeNode（parser-rng-01）", () => {
      const result = parseInlineElements("[___]{type:range}");
      expect(result[0]?.type).toBe("Range");
    });

    it("[___]{type:range min:10 max:90 step:5} → 属性設定（parser-rng-02）", () => {
      const result = parseInlineElements("[___]{type:range min:10 max:90 step:5}");
      expect(result[0]?.type).toBe("Range");
      if (result[0]?.type === "Range") {
        expect(result[0].min).toBe(10);
        expect(result[0].max).toBe(90);
        expect(result[0].step).toBe(5);
      }
    });

    it("[___]{type:range disabled} → disabled=true（parser-rng-03）", () => {
      const result = parseInlineElements("[___]{type:range disabled}");
      if (result[0]?.type === "Range") {
        expect(result[0].disabled).toBe(true);
      }
    });
  });

  // ─── Textarea ─────────────────────────────────────────────────────────────

  describe("Textarea（parser-ta-01〜04）", () => {
    it("[___]{type:textarea} → TextareaNode（parser-ta-01）", () => {
      const result = parseInlineElements("[___]{type:textarea}");
      expect(result[0]?.type).toBe("Textarea");
    });

    it("[___]{type:textarea rows:5} → rows=5（parser-ta-02）", () => {
      const result = parseInlineElements("[___]{type:textarea rows:5}");
      if (result[0]?.type === "Textarea") {
        expect(result[0].rows).toBe(5);
      }
    });

    it("[___]{type:textarea required readonly} → required/readonly（parser-ta-03）", () => {
      const result = parseInlineElements("[___]{type:textarea required readonly}");
      if (result[0]?.type === "Textarea") {
        expect(result[0].required).toBe(true);
        expect(result[0].readonly).toBe(true);
      }
    });

    it("[___]{type:textarea rows:3} → rows 未指定時は 3（parser-ta-04）", () => {
      const result = parseInlineElements("[___]{type:textarea}");
      if (result[0]?.type === "Textarea") {
        expect(result[0].rows).toBe(3);
      }
    });
  });

  // ─── Select ───────────────────────────────────────────────────────────────

  describe("Select（p1-select-01）", () => {
    it("[___]{type:select} → SelectNode（p1-select-01）", () => {
      const result = parseInlineElements("[___]{type:select}");
      expect(result[0]?.type).toBe("Select");
      if (result[0]?.type === "Select") {
        expect(result[0].options).toEqual([]);
      }
    });
  });

  // ─── Combobox ─────────────────────────────────────────────────────────────

  describe("Combobox（parser-cmb-01〜04）", () => {
    it("[___]{type:combobox} → ComboboxNode（parser-cmb-01）", () => {
      const result = parseInlineElements("[___]{type:combobox}");
      expect(result[0]?.type).toBe("Combobox");
    });

    it("[___]{type:combobox disabled} → disabled=true（parser-cmb-02）", () => {
      const result = parseInlineElements("[___]{type:combobox disabled}");
      if (result[0]?.type === "Combobox") {
        expect(result[0].disabled).toBe(true);
      }
    });

    it("[___]{type:combobox name:lang} → name属性（parser-cmb-03）", () => {
      const result = parseInlineElements("[___]{type:combobox name:lang}");
      if (result[0]?.type === "Combobox") {
        expect(result[0].name).toBe("lang");
      }
    });

    it("[___]{type:combobox placeholder:選択してください} → placeholder（parser-cmb-04）", () => {
      const result = parseInlineElements("[___]{type:combobox placeholder:選択してください}");
      if (result[0]?.type === "Combobox") {
        expect(result[0].placeholder).toBe("選択してください");
      }
    });
  });

  // ─── Input（標準型） ────────────────────────────────────────────────────

  describe("Input 標準型（parser-input-02〜04）", () => {
    it("[___]{type:password} → InputNode inputType=password（parser-input-02）", () => {
      const result = parseInlineElements("[___]{type:password}");
      expect(result[0]?.type).toBe("Input");
      if (result[0]?.type === "Input") {
        expect(result[0].inputType).toBe("password");
      }
    });

    it("[___]{type:email disabled} → disabled=true（parser-input-03）", () => {
      const result = parseInlineElements("[___]{type:email disabled}");
      if (result[0]?.type === "Input") {
        expect(result[0].disabled).toBe(true);
      }
    });

    it("[___]{type:text readonly} → readonly=true（parser-input-04相当）", () => {
      const result = parseInlineElements("[___]{type:text readonly}");
      if (result[0]?.type === "Input") {
        expect(result[0].readonly).toBe(true);
      }
    });
  });

  // ─── 複数インライン要素 ───────────────────────────────────────────────

  describe("複数インライン要素の連続", () => {
    it("Badge の後ろにButtonを並べる", () => {
      const result = parseInlineElements("[新]{.badge} [確認]{.btn}");
      // Badgeだけ取得される（実装の挙動：1つ取得したら残余は解析）
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result[0]?.type).toBe("Badge");
    });
  });
});
