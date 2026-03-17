/**
 * コンポーネント統合テスト
 * Tree / Panes / Tabs / Accordion / Alert / Grid / Table /
 * Image / Avatar / Divider / Menu詳細 の parse-to-AST を検証する
 */

import { describe, it, expect } from "vitest";
import { parseMarkdown } from "../../src/parser/index.js";

// ─── ヘルパー ─────────────────────────────────────────────────────────────

/** Screenの最初のchildを取得する */
function firstChild(md: string) {
  const { nodes } = parseMarkdown(md, "test.md");
  const screen = nodes[0];
  if (screen?.type !== "Screen") return undefined;
  return screen.children[0];
}

// ─── Tree / TreeItem（SC-21: p1-tree-01〜05） ─────────────────────────────

describe("Tree / TreeItem（SC-21）", () => {
  it("## {.tree} → Tree ノード（p1-tree-01）", () => {
    const node = firstChild("# /test\n\n## ファイルツリー {.tree}");
    expect(node?.type).toBe("Tree");
  });

  it("Tree直下のリスト → TreeItem（p1-tree-02）", () => {
    const md = `# /test

## ファイルツリー {.tree}

- src {icon:"folder"}
`;
    const node = firstChild(md);
    expect(node?.type).toBe("Tree");
    if (node?.type === "Tree") {
      expect(node.items).toHaveLength(1);
      expect(node.items[0]?.type).toBe("TreeItem");
      expect(node.items[0]?.label).toBe("src");
      expect(node.items[0]?.icon).toBe("folder");
    }
  });

  it("TreeItem: selected + collapsed 属性（p1-tree-04）", () => {
    const md = `# /test

## ツリー {.tree}

- main.md {selected collapsed}
`;
    const node = firstChild(md);
    if (node?.type === "Tree") {
      const item = node.items[0];
      expect(item?.selected).toBe(true);
      expect(item?.collapsed).toBe(true);
    }
  });

  it("TreeItem: disabled 属性（p1-tree-05）", () => {
    const md = `# /test

## ツリー {.tree}

- node_modules {disabled}
`;
    const node = firstChild(md);
    if (node?.type === "Tree") {
      expect(node.items[0]?.disabled).toBe(true);
    }
  });

  it("TreeItem: ネスト2階層（p1-tree-03）", () => {
    const md = `# /test

## ツリー {.tree}

- src
  - index.ts
`;
    const node = firstChild(md);
    if (node?.type === "Tree") {
      const parent = node.items[0];
      expect(parent?.children).toHaveLength(1);
      expect(parent?.children[0]?.label).toBe("index.ts");
    }
  });
});

// ─── Panes / Pane（SC-22: p1-panes-01〜07） ──────────────────────────────

describe("Panes / Pane（SC-22）", () => {
  it("## {.panes vertical} → direction=vertical（p1-panes-02）", () => {
    const node = firstChild("# /test\n\n## レイアウト {.panes vertical}");
    expect(node?.type).toBe("Panes");
    if (node?.type === "Panes") {
      expect(node.direction).toBe("vertical");
    }
  });

  it("## {.panes} 方向省略 → direction=horizontal（p1-panes-03）", () => {
    const node = firstChild("# /test\n\n## レイアウト {.panes}");
    if (node?.type === "Panes") {
      expect(node.direction).toBe("horizontal");
    }
  });

  it("Panes内H3 → Pane ノード（p1-panes-04）", () => {
    const md = `# /test

## レイアウト {.panes horizontal}

### 左ペイン {.pane w:240}
`;
    const node = firstChild(md);
    if (node?.type === "Panes") {
      expect(node.panes).toHaveLength(1);
      expect(node.panes[0]?.type).toBe("Pane");
      expect(node.panes[0]?.w).toBe(240);
    }
  });

  it("Pane: flex:1（p1-panes-05）", () => {
    const md = `# /test

## レイアウト {.panes horizontal}

### メイン {.pane flex:1}
`;
    const node = firstChild(md);
    if (node?.type === "Panes") {
      expect(node.panes[0]?.flex).toBe(1);
    }
  });

  it("Pane: collapsed（p1-panes-07）", () => {
    const md = `# /test

## レイアウト {.panes horizontal}

### サイドバー {.pane collapsed}
`;
    const node = firstChild(md);
    if (node?.type === "Panes") {
      expect(node.panes[0]?.collapsed).toBe(true);
    }
  });
});

// ─── Tabs / Tab（parser-tabs-01〜04） ─────────────────────────────────────

describe("Tabs / Tab（parser-tabs-01〜04）", () => {
  it("## {.tabs} → Tabs ノード（parser-tabs-01）", () => {
    const node = firstChild("# /test\n\n## タブ {.tabs}");
    expect(node?.type).toBe("Tabs");
  });

  it("Tabs内H3 → Tab ノード（parser-tabs-02）", () => {
    const md = `# /test

## タブ {.tabs}

### 概要

テキスト
`;
    const node = firstChild(md);
    if (node?.type === "Tabs") {
      expect(node.tabs).toHaveLength(1);
      expect(node.tabs[0]?.type).toBe("Tab");
      expect(node.tabs[0]?.label).toBe("概要");
    }
  });

  it("Tab: selected 属性（parser-tabs-03）", () => {
    const md = `# /test

## タブ {.tabs}

### 概要 {selected}
`;
    const node = firstChild(md);
    if (node?.type === "Tabs") {
      expect(node.tabs[0]?.selected).toBe(true);
    }
  });

  it("Tab: disabled 属性（parser-tabs-04）", () => {
    const md = `# /test

## タブ {.tabs}

### 設定 {disabled}
`;
    const node = firstChild(md);
    if (node?.type === "Tabs") {
      expect(node.tabs[0]?.disabled).toBe(true);
    }
  });
});

// ─── Accordion / AccordionItem（parser-acc-01〜03） ───────────────────────

describe("Accordion / AccordionItem（parser-acc-01〜03）", () => {
  it("## {.accordion} → Accordion ノード（parser-acc-01）", () => {
    const node = firstChild("# /test\n\n## FAQ {.accordion}");
    expect(node?.type).toBe("Accordion");
  });

  it("Accordion内H3 → AccordionItem（parser-acc-02）", () => {
    const md = `# /test

## FAQ {.accordion}

### よくある質問

内容
`;
    const node = firstChild(md);
    if (node?.type === "Accordion") {
      expect(node.items).toHaveLength(1);
      expect(node.items[0]?.type).toBe("AccordionItem");
      expect(node.items[0]?.label).toBe("よくある質問");
    }
  });

  it("AccordionItem: collapsed=true（parser-acc-03）", () => {
    const md = `# /test

## FAQ {.accordion}

### Q1 {collapsed}
`;
    const node = firstChild(md);
    if (node?.type === "Accordion") {
      expect(node.items[0]?.collapsed).toBe(true);
    }
  });
});

// ─── Alert（parser-alt-01〜04） ───────────────────────────────────────────

describe("Alert（parser-alt-01〜04）", () => {
  it("## {.alert .info} → Alert variant=info（parser-alt-01）", () => {
    const node = firstChild("# /test\n\n## 情報 {.alert .info}");
    expect(node?.type).toBe("Alert");
    if (node?.type === "Alert") {
      expect(node.variant).toBe("info");
    }
  });

  it("## {.alert .success} → variant=success（parser-alt-02）", () => {
    const node = firstChild("# /test\n\n## 完了 {.alert .success}");
    if (node?.type === "Alert") expect(node.variant).toBe("success");
  });

  it("## {.alert .warning} → variant=warning（parser-alt-03）", () => {
    const node = firstChild("# /test\n\n## 警告 {.alert .warning}");
    if (node?.type === "Alert") expect(node.variant).toBe("warning");
  });

  it("## {.alert .error} → variant=error（parser-alt-04）", () => {
    const node = firstChild("# /test\n\n## エラー {.alert .error}");
    if (node?.type === "Alert") expect(node.variant).toBe("error");
  });
});

// ─── Grid / GridCell（parser-grid-01〜04） ────────────────────────────────

describe("Grid / GridCell（parser-grid-01〜04）", () => {
  it("## {.grid cols:3} → Grid cols=3（parser-grid-01）", () => {
    const node = firstChild("# /test\n\n## グリッド {.grid cols:3}");
    expect(node?.type).toBe("Grid");
    if (node?.type === "Grid") {
      expect(node.cols).toBe(3);
    }
  });

  it("Grid内H3 → GridCell（parser-grid-02）", () => {
    const md = `# /test

## グリッド {.grid cols:2}

### カード A
`;
    const node = firstChild(md);
    if (node?.type === "Grid") {
      expect(node.cells).toHaveLength(1);
      expect(node.cells[0]?.type).toBe("GridCell");
    }
  });

  it("GridCell: span 属性（parser-grid-03）", () => {
    const md = `# /test

## グリッド {.grid cols:3}

### ヘッダー {span:3}
`;
    const node = firstChild(md);
    if (node?.type === "Grid") {
      expect(node.cells[0]?.span).toBe(3);
    }
  });

  it("Grid gap 属性（parser-grid-04）", () => {
    const node = firstChild("# /test\n\n## グリッド {.grid cols:2 gap:4}");
    if (node?.type === "Grid") {
      expect(node.gap).toBe(4);
    }
  });
});

// ─── Table（parser-tbl-01〜04） ───────────────────────────────────────────

describe("Table（parser-tbl-01〜04）", () => {
  it("## {.table} → Table ノード（parser-tbl-01）", () => {
    const node = firstChild("# /test\n\n## データ {.table}");
    expect(node?.type).toBe("Table");
  });

  it("## {.table striped} → striped=true（parser-tbl-02）", () => {
    const node = firstChild("# /test\n\n## データ {.table striped}");
    if (node?.type === "Table") {
      expect(node.striped).toBe(true);
    }
  });

  it("Markdownテーブルから columns/rows を取得（parser-tbl-03）", () => {
    const md = `# /test

## データ {.table}

| 名前 | 年齢 |
| --- | --- |
| Alice | 30 |
| Bob | 25 |
`;
    const node = firstChild(md);
    if (node?.type === "Table") {
      expect(node.columns).toEqual(["名前", "年齢"]);
      expect(node.rows).toHaveLength(2);
      expect(node.rows[0]).toEqual(["Alice", "30"]);
    }
  });

  it("## {.table bordered hoverable compact}（parser-tbl-04）", () => {
    const node = firstChild("# /test\n\n## データ {.table bordered hoverable compact}");
    if (node?.type === "Table") {
      expect(node.bordered).toBe(true);
      expect(node.hoverable).toBe(true);
      expect(node.compact).toBe(true);
    }
  });
});

// ─── Image / Avatar（parser-img-01〜04 / parser-av-01〜03） ───────────────

describe("Image / Avatar", () => {
  it("![alt](src) → Image ノード（parser-img-01）", () => {
    const md = "# /test\n\n![ロゴ](logo.png)";
    const { nodes } = parseMarkdown(md, "test.md");
    const screen = nodes[0];
    if (screen?.type === "Screen") {
      const img = screen.children[0];
      expect(img?.type).toBe("Image");
      if (img?.type === "Image") {
        expect(img.src).toBe("logo.png");
        expect(img.alt).toBe("ロゴ");
      }
    }
  });

  it("![alt](src) w/h 属性（parser-img-02）", () => {
    // title属性で属性ブロックを渡す（マークダウン拡張）
    const md = '# /test\n\n![ロゴ](logo.png "w:200 h:100")';
    const { nodes } = parseMarkdown(md, "test.md");
    const screen = nodes[0];
    if (screen?.type === "Screen") {
      const img = screen.children[0];
      if (img?.type === "Image") {
        expect(img.w).toBe(200);
        expect(img.h).toBe(100);
      }
    }
  });

  it("![alt](src) .avatar クラス → Avatar ノード（parser-av-01）", () => {
    const md = '# /test\n\n![ユーザー](avatar.png ".avatar")';
    const { nodes } = parseMarkdown(md, "test.md");
    const screen = nodes[0];
    if (screen?.type === "Screen") {
      const img = screen.children[0];
      expect(img?.type).toBe("Avatar");
    }
  });

  it("Avatar: size 属性（parser-av-02）", () => {
    const md = '# /test\n\n![ユーザー](avatar.png ".avatar size:48")';
    const { nodes } = parseMarkdown(md, "test.md");
    const screen = nodes[0];
    if (screen?.type === "Screen") {
      const img = screen.children[0];
      if (img?.type === "Avatar") {
        expect(img.size).toBe(48);
      }
    }
  });
});

// ─── Divider（parser-div-01〜05） ─────────────────────────────────────────

describe("Divider（parser-div-01〜05）", () => {
  it("--- → Divider ノード（parser-div-01）", () => {
    const md = "# /test\n\nテキスト\n\n---\n\nテキスト2";
    const { nodes } = parseMarkdown(md, "test.md");
    const screen = nodes[0];
    if (screen?.type === "Screen") {
      const divider = screen.children.find((c) => c.type === "Divider");
      expect(divider?.type).toBe("Divider");
    }
  });

  it("MenuBar内の --- → MenuSeparator（parser-div-02）", () => {
    const md = `# /test

## メニュー {.menubar}

### &ファイル

- [新規]{on:click="file.new()"}
- ---
- [終了]{on:click="app.exit()"}
`;
    const { nodes } = parseMarkdown(md, "test.md");
    const screen = nodes[0];
    if (screen?.type === "Screen") {
      const menubar = screen.children[0];
      if (menubar?.type === "MenuBar") {
        const menu = menubar.menus[0];
        if (menu?.type === "Menu") {
          const sep = menu.items.find((i) => i.type === "MenuSeparator");
          expect(sep?.type).toBe("MenuSeparator");
        }
      }
    }
  });
});

// ─── Menu 詳細（parser-menu-02〜11） ─────────────────────────────────────

describe("Menu 詳細（parser-menu-02〜11）", () => {
  it("MenuItem: label + on:click（parser-menu-02）", () => {
    const md = `# /test

## メニュー {.menubar}

### &ファイル

- [新規]{on:click="file.new()"}
`;
    const { nodes } = parseMarkdown(md, "test.md");
    const screen = nodes[0];
    if (screen?.type === "Screen") {
      const menubar = screen.children[0];
      if (menubar?.type === "MenuBar") {
        const menu = menubar.menus[0];
        if (menu?.type === "Menu") {
          expect(menu.items[0]?.type).toBe("MenuItem");
          const item = menu.items[0];
          if (item?.type === "MenuItem") {
            expect(item.label).toBe("新規");
            expect(item.events["on:click"]).toBe("file.new()");
          }
        }
      }
    }
  });

  it("MenuItem: shortcut 属性（parser-menu-03）", () => {
    const md = `# /test

## メニュー {.menubar}

### &ファイル

- [保存]{shortcut:"Ctrl+S" on:click="file.save()"}
`;
    const { nodes } = parseMarkdown(md, "test.md");
    const screen = nodes[0];
    if (screen?.type === "Screen") {
      const menubar = screen.children[0];
      if (menubar?.type === "MenuBar") {
        const menu = menubar.menus[0];
        if (menu?.type === "Menu") {
          const item = menu.items[0];
          if (item?.type === "MenuItem") {
            expect(item.shortcut).toBe("Ctrl+S");
          }
        }
      }
    }
  });

  it("MenuItem: disabled（parser-menu-04）", () => {
    const md = `# /test

## メニュー {.menubar}

### &編集

- [元に戻す]{disabled on:click="edit.undo()"}
`;
    const { nodes } = parseMarkdown(md, "test.md");
    const screen = nodes[0];
    if (screen?.type === "Screen") {
      const menubar = screen.children[0];
      if (menubar?.type === "MenuBar") {
        const menu = menubar.menus[0];
        if (menu?.type === "Menu") {
          const item = menu.items[0];
          if (item?.type === "MenuItem") {
            expect(item.disabled).toBe(true);
          }
        }
      }
    }
  });

  it("MenuBar: アクセラレーター（parser-menu-05）", () => {
    const md = `# /test

## メニュー {.menubar}

### &File
`;
    const { nodes } = parseMarkdown(md, "test.md");
    const screen = nodes[0];
    if (screen?.type === "Screen") {
      const menubar = screen.children[0];
      if (menubar?.type === "MenuBar") {
        const menu = menubar.menus[0];
        if (menu?.type === "Menu") {
          expect(menu.label).toBe("File");
          expect(menu.accelerator).toBe("F");
        }
      }
    }
  });
});

// ─── Breadcrumb（parser-bc-01〜03） ──────────────────────────────────────

describe("Breadcrumb", () => {
  it("## {.breadcrumb} → Breadcrumb ノード（parser-bc-01）", () => {
    const node = firstChild("# /test\n\n## ナビ {.breadcrumb}");
    expect(node?.type).toBe("Breadcrumb");
  });

  it("Breadcrumb内リスト → BreadcrumbItem（parser-bc-02）", () => {
    const md = `# /test

## ナビ {.breadcrumb}

- [ホーム]{on:click="nav.home()"}
- [設定]
- プロフィール
`;
    const node = firstChild(md);
    if (node?.type === "Breadcrumb") {
      expect(node.items).toHaveLength(3);
      expect(node.items[0]?.type).toBe("BreadcrumbItem");
      expect(node.items[0]?.label).toBe("ホーム");
    }
  });
});
