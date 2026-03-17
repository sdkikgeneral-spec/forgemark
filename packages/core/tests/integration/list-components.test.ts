/**
 * リスト系コンポーネント統合テスト
 * RadioGroup / Dropdown / Listbox / Toolbar / StatusBar / Select(options) / Combobox(options)
 */

import { describe, it, expect } from "vitest";
import { parseMarkdown } from "../../src/parser/index.js";

/** Screenの最初のchildを取得する */
function firstChild(md: string) {
  const { nodes } = parseMarkdown(md, "test.md");
  const screen = nodes[0];
  if (screen?.type !== "Screen") return undefined;
  return screen.children[0];
}

// ─── RadioGroup / RadioItem（parser-rg-01〜03） ───────────────────────────

describe("RadioGroup / RadioItem（parser-rg-01〜03）", () => {
  it("## {.radio-group} → RadioGroup（parser-rg-01）", () => {
    const node = firstChild("# /test\n\n## 性別 {.radio-group}");
    expect(node?.type).toBe("RadioGroup");
  });

  it("RadioGroup内のリスト → RadioItem（parser-rg-02）", () => {
    const md = `# /test

## 性別 {.radio-group}

- (•) 男性
- ( ) 女性
- ( ) その他
`;
    const node = firstChild(md);
    if (node?.type === "RadioGroup") {
      expect(node.items).toHaveLength(3);
      expect(node.items[0]?.type).toBe("RadioItem");
      expect(node.items[0]?.label).toBe("男性");
      expect(node.items[0]?.selected).toBe(true);
      expect(node.items[1]?.selected).toBe(false);
    }
  });

  it("RadioItem: value 属性（parser-rg-03）", () => {
    const md = `# /test

## 設定 {.radio-group}

- (•) 有効 {value:"enabled"}
- ( ) 無効 {value:"disabled"}
`;
    const node = firstChild(md);
    if (node?.type === "RadioGroup") {
      expect(node.items[0]?.value).toBe("enabled");
      expect(node.items[1]?.value).toBe("disabled");
    }
  });
});

// ─── Dropdown / DropdownItem（parser-dd-01〜04） ──────────────────────────

describe("Dropdown / DropdownItem（parser-dd-01〜04）", () => {
  it("## ラベル {.dropdown} → Dropdown（parser-dd-01）", () => {
    const node = firstChild("# /test\n\n## アクション {.dropdown}");
    expect(node?.type).toBe("Dropdown");
    if (node?.type === "Dropdown") {
      expect(node.label).toBe("アクション");
    }
  });

  it("Dropdown内リスト → DropdownItem（parser-dd-02）", () => {
    const md = `# /test

## メニュー {.dropdown}

- [編集]{on:click="doc.edit()"}
- [削除]{on:click="doc.delete()"}
`;
    const node = firstChild(md);
    if (node?.type === "Dropdown") {
      expect(node.items).toHaveLength(2);
      expect(node.items[0]?.type).toBe("DropdownItem");
      const item = node.items[0];
      if (item?.type === "DropdownItem") {
        expect(item.label).toBe("編集");
        expect(item.events["on:click"]).toBe("doc.edit()");
      }
    }
  });

  it("DropdownItem: disabled（parser-dd-03）", () => {
    const md = `# /test

## メニュー {.dropdown}

- [削除]{disabled on:click="doc.delete()"}
`;
    const node = firstChild(md);
    if (node?.type === "Dropdown") {
      const item = node.items[0];
      if (item?.type === "DropdownItem") {
        expect(item.disabled).toBe(true);
      }
    }
  });

  it("Dropdown内のセパレーター（parser-dd-04）", () => {
    const md = `# /test

## メニュー {.dropdown}

- [編集]{on:click="doc.edit()"}
- ---
- [削除]{on:click="doc.delete()"}
`;
    const node = firstChild(md);
    if (node?.type === "Dropdown") {
      expect(node.items).toHaveLength(3);
      expect(node.items[1]?.type).toBe("MenuSeparator");
    }
  });
});

// ─── Listbox / ListboxItem（parser-lb-01〜04） ────────────────────────────

describe("Listbox / ListboxItem（parser-lb-01〜04）", () => {
  it("## {.listbox} → Listbox（parser-lb-01）", () => {
    const node = firstChild("# /test\n\n## リスト {.listbox}");
    expect(node?.type).toBe("Listbox");
  });

  it("Listbox内リスト → ListboxItem（parser-lb-02）", () => {
    const md = `# /test

## リスト {.listbox}

- 項目A
- 項目B {selected}
`;
    const node = firstChild(md);
    if (node?.type === "Listbox") {
      expect(node.items).toHaveLength(2);
      expect(node.items[0]?.type).toBe("ListboxItem");
      expect(node.items[1]?.selected).toBe(true);
    }
  });

  it("Listbox: multiple 属性（parser-lb-03）", () => {
    const node = firstChild("# /test\n\n## リスト {.listbox multiple}");
    if (node?.type === "Listbox") {
      expect(node.multiple).toBe(true);
    }
  });

  it("ListboxItem: disabled（parser-lb-04）", () => {
    const md = `# /test

## リスト {.listbox}

- 無効項目 {disabled}
`;
    const node = firstChild(md);
    if (node?.type === "Listbox") {
      expect(node.items[0]?.disabled).toBe(true);
    }
  });
});

// ─── Toolbar / ToolbarItem（parser-tb-01〜05） ────────────────────────────

describe("Toolbar / ToolbarItem（parser-tb-01〜05）", () => {
  it("## {.toolbar} → Toolbar（parser-tb-01）", () => {
    const node = firstChild("# /test\n\n## ツールバー {.toolbar}");
    expect(node?.type).toBe("Toolbar");
  });

  it("Toolbar内リスト → ToolbarItem（parser-tb-02）", () => {
    const md = `# /test

## ツールバー {.toolbar}

- [保存]{on:click="file.save()"}
- [開く]{on:click="file.open()"}
`;
    const node = firstChild(md);
    if (node?.type === "Toolbar") {
      const allItems = node.groups.flat();
      expect(allItems.length).toBeGreaterThan(0);
      const item = allItems[0];
      expect(item?.type).toBe("ToolbarItem");
      if (item?.type === "ToolbarItem") {
        expect(item.label).toBe("保存");
      }
    }
  });

  it("ToolbarItem: checked 属性（parser-tb-03）", () => {
    const md = `# /test

## ツールバー {.toolbar}

- [太字]{checked on:click="fmt.bold()"}
`;
    const node = firstChild(md);
    if (node?.type === "Toolbar") {
      const item = node.groups.flat()[0];
      if (item?.type === "ToolbarItem") {
        expect(item.checked).toBe(true);
      }
    }
  });

  it("--- でグループ分割（parser-tb-04）", () => {
    const md = `# /test

## ツールバー {.toolbar}

- [太字]{on:click="fmt.bold()"}
- ---
- [コピー]{on:click="edit.copy()"}
`;
    const node = firstChild(md);
    if (node?.type === "Toolbar") {
      expect(node.groups.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("ToolbarItem: disabled（parser-tb-05）", () => {
    const md = `# /test

## ツールバー {.toolbar}

- [貼り付け]{disabled on:click="edit.paste()"}
`;
    const node = firstChild(md);
    if (node?.type === "Toolbar") {
      const item = node.groups.flat()[0];
      if (item?.type === "ToolbarItem") {
        expect(item.disabled).toBe(true);
      }
    }
  });
});

// ─── StatusBar / StatusItem（parser-sb-01〜04） ───────────────────────────

describe("StatusBar / StatusItem（parser-sb-01〜04）", () => {
  it("## {.statusbar} → StatusBar（parser-sb-01）", () => {
    const node = firstChild("# /test\n\n## ステータス {.statusbar}");
    expect(node?.type).toBe("StatusBar");
  });

  it("StatusBar内リスト → StatusItem（parser-sb-02）", () => {
    const md = `# /test

## ステータス {.statusbar}

- 行: 10
- 列: 5
`;
    const node = firstChild(md);
    if (node?.type === "StatusBar") {
      expect(node.items).toHaveLength(2);
      expect(node.items[0]?.type).toBe("StatusItem");
      expect(node.items[0]?.content).toBe("行: 10");
    }
  });

  it("StatusItem: align:right（parser-sb-03）", () => {
    const md = `# /test

## ステータス {.statusbar}

- UTF-8 {align:right}
`;
    const node = firstChild(md);
    if (node?.type === "StatusBar") {
      expect(node.items[0]?.align).toBe("right");
    }
  });

  it("StatusItem: align 未指定は left（parser-sb-04）", () => {
    const md = `# /test

## ステータス {.statusbar}

- 準備完了
`;
    const node = firstChild(md);
    if (node?.type === "StatusBar") {
      expect(node.items[0]?.align).toBe("left");
    }
  });
});

// ─── Select options（p1-select-02〜03） ──────────────────────────────────

describe("Select options（p1-select-02〜03）", () => {
  it("Select直後のリストが options に変換される（p1-select-02）", () => {
    const md = `# /test

[___]{type:select}

- 選択肢1
- 選択肢2
- 選択肢3
`;
    const { nodes } = parseMarkdown(md, "test.md");
    // Selectはルートレベルで生成される（Screen外の場合）
    const selectNode = nodes.find((n) => n.type === "Select");
    if (selectNode?.type === "Select") {
      expect(selectNode.options).toHaveLength(3);
    }
  });

  it("Select option: selected（p1-select-03）", () => {
    const md = `# /test

## フォーム {.card}

[___]{type:select}

- 選択肢1 {value:"v1" selected}
- 選択肢2 {value:"v2"}
`;
    const { nodes } = parseMarkdown(md, "test.md");
    const screen = nodes[0];
    if (screen?.type === "Screen") {
      const card = screen.children[0];
      if (card?.type === "Card") {
        const sel = card.children[0];
        if (sel?.type === "Select") {
          expect(sel.options[0]?.selected).toBe(true);
          expect(sel.options[0]?.value).toBe("v1");
        }
      }
    }
  });
});
