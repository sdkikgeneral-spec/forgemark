import { describe, it, expect } from "vitest";
import {
  splitHeadingLabel,
  mapH1ToScreen,
  mapH2ToNode,
  mapH3ToNode,
  extractAlertVariant,
  extractGridCols,
} from "../../../src/parser/headingMapper.js";

describe("splitHeadingLabel", () => {
  it("ラベルと属性ブロックを分離する", () => {
    const { label, attrRaw } = splitHeadingLabel("ログイン {.card .w-400}");
    expect(label).toBe("ログイン");
    expect(attrRaw).toBe("{.card .w-400}");
  });

  it("属性なしの見出しを処理する", () => {
    const { label, attrRaw } = splitHeadingLabel("ログイン");
    expect(label).toBe("ログイン");
    expect(attrRaw).toBe("");
  });
});

describe("mapH1ToScreen", () => {
  it("/login → routeが /login になる", () => {
    const node = mapH1ToScreen("/login {.screen .desktop}");
    expect(node.type).toBe("Screen");
    expect(node.route).toBe("/login");
    expect(node.class).toContain("screen");
    expect(node.class).toContain("desktop");
  });

  it("スラッシュなしのラベルにもプレフィックスを付ける", () => {
    const node = mapH1ToScreen("dashboard");
    expect(node.route).toBe("/dashboard");
  });
});

describe("mapH2ToNode", () => {
  it("クラスなし → Card", () => {
    const result = mapH2ToNode("ログインフォーム {.card}");
    expect(result.type).toBe("Card");
    expect(result.label).toBe("ログインフォーム");
  });

  it("{.menubar} → MenuBar に昇格する", () => {
    const result = mapH2ToNode("メニュー {.menubar}");
    expect(result.type).toBe("MenuBar");
  });

  it("{.tree} → Tree に昇格する", () => {
    const result = mapH2ToNode("ファイルツリー {.tree}");
    expect(result.type).toBe("Tree");
  });

  it("{.panes horizontal} → Panes に昇格する", () => {
    const result = mapH2ToNode("画面 {.panes horizontal}");
    expect(result.type).toBe("Panes");
  });

  it("{.radio-group} → RadioGroup に昇格する", () => {
    const result = mapH2ToNode("テーマ {.radio-group name:\"theme\"}");
    expect(result.type).toBe("RadioGroup");
  });

  it("{.tabs} → Tabs に昇格する", () => {
    const result = mapH2ToNode("タブ {.tabs}");
    expect(result.type).toBe("Tabs");
  });

  it("{.accordion} → Accordion に昇格する", () => {
    const result = mapH2ToNode("設定 {.accordion}");
    expect(result.type).toBe("Accordion");
  });

  it("{.alert .warning} → Alert に昇格する", () => {
    const result = mapH2ToNode("警告 {.alert .warning}");
    expect(result.type).toBe("Alert");
  });

  it("{.grid} → Grid に昇格する", () => {
    const result = mapH2ToNode("グリッド {.grid cols:4}");
    expect(result.type).toBe("Grid");
  });

  it("{.table} → Table に昇格する", () => {
    const result = mapH2ToNode("テーブル {.table striped}");
    expect(result.type).toBe("Table");
  });
});

describe("mapH3ToNode", () => {
  it("MenuBar内のH3 → Menu", () => {
    const result = mapH3ToNode("&File", "MenuBar");
    expect(result.type).toBe("Menu");
    expect(result.label).toBe("&File");
  });

  it("Panes内のH3 → Pane", () => {
    const result = mapH3ToNode("左ペイン {.pane w:220}", "Panes");
    expect(result.type).toBe("Pane");
  });

  it("Tabs内のH3 → Tab", () => {
    const result = mapH3ToNode("タスク {.tab}", "Tabs");
    expect(result.type).toBe("Tab");
  });

  it("Accordion内のH3 → AccordionItem", () => {
    const result = mapH3ToNode("アカウント {.accordion-item}", "Accordion");
    expect(result.type).toBe("AccordionItem");
  });

  it("不明な親コンテキスト → null", () => {
    const result = mapH3ToNode("何か", "Card");
    expect(result.type).toBeNull();
  });
});

describe("extractAlertVariant", () => {
  it("warning クラスから variant を抽出する", () => {
    expect(extractAlertVariant(["alert", "warning"])).toBe("warning");
  });

  it("error クラスから variant を抽出する", () => {
    expect(extractAlertVariant(["alert", "error"])).toBe("error");
  });

  it("バリアントなしは info にフォールバックする", () => {
    expect(extractAlertVariant(["alert"])).toBe("info");
  });
});

describe("extractGridCols", () => {
  it("cols属性からカラム数を抽出する", () => {
    expect(extractGridCols({ cols: "4" }, [])).toBe(4);
  });

  it("grid-cols-3 クラスからカラム数を抽出する", () => {
    expect(extractGridCols({}, ["grid-cols-3"])).toBe(3);
  });

  it("指定なしはデフォルト1", () => {
    expect(extractGridCols({}, [])).toBe(1);
  });
});
