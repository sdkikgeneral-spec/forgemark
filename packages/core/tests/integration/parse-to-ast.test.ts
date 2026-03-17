import { describe, it, expect } from "vitest";
import { parseMarkdown } from "../../src/parser/index.js";

describe("parseMarkdown - 統合テスト", () => {
  describe("基本パーサー", () => {
    it("H1をScreenノードに変換する", () => {
      const result = parseMarkdown("# /login", "test.md");
      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0]?.type).toBe("Screen");
    });

    it("H2をCardノードに変換する（SC-04相当）", () => {
      const result = parseMarkdown("# /test\n\n## ログイン {.card}", "test.md");
      const screen = result.nodes[0];
      expect(screen?.type).toBe("Screen");
      if (screen?.type === "Screen") {
        expect(screen.children[0]?.type).toBe("Card");
      }
    });

    it("空ファイルはASTが空配列になる（SC-15: p1-empty-01）", () => {
      const result = parseMarkdown("", "test.md");
      expect(result.nodes).toHaveLength(0);
    });

    it("H1のみのファイルはScreenノード1件（SC-15: p1-empty-03）", () => {
      const result = parseMarkdown("# /screen", "test.md");
      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0]?.type).toBe("Screen");
    });

    it("H2のみのファイルはCardノード1件（SC-15: p1-empty-04）", () => {
      const result = parseMarkdown("## カード {.card}", "test.md");
      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0]?.type).toBe("Card");
    });
  });

  describe("Inputノード", () => {
    it("typeを解析する", () => {
      const result = parseMarkdown(
        "# /test\n\n## フォーム {.card}\n\n[________________]{type:email required}",
        "test.md",
      );
      const screen = result.nodes[0];
      if (screen?.type === "Screen") {
        const card = screen.children[0];
        if (card?.type === "Card") {
          expect(card.children[0]?.type).toBe("Input");
          const input = card.children[0];
          if (input?.type === "Input") {
            expect(input.inputType).toBe("email");
            expect(input.required).toBe(true);
          }
        }
      }
    });
  });

  describe("Buttonノード", () => {
    it("イベントを解析する", () => {
      const result = parseMarkdown(
        `# /test\n\n[ログイン]{.btn .primary on:click="auth.login()"}`,
        "test.md",
      );
      const screen = result.nodes[0];
      if (screen?.type === "Screen") {
        const btn = screen.children[0];
        if (btn?.type === "Button") {
          expect(btn.label).toBe("ログイン");
          expect(btn.events["on:click"]).toBe("auth.login()");
        }
      }
    });
  });

  describe("Rowノード", () => {
    it("[[ A | B ]] をRowノードに変換する", () => {
      const result = parseMarkdown(
        "# /test\n\n[[ スペース | [OK]{.btn} ]]",
        "test.md",
      );
      const screen = result.nodes[0];
      if (screen?.type === "Screen") {
        const row = screen.children[0];
        expect(row?.type).toBe("Row");
        if (row?.type === "Row") {
          expect(row.columns).toHaveLength(2);
        }
      }
    });
  });

  describe("MenuBar", () => {
    it("MenuBarとMenuを正しく変換する", () => {
      const md = `# /app {.screen}

## メニュー {.menubar}

### &File

- [新規]{on:click="file.new()"}
`;
      const result = parseMarkdown(md, "test.md");
      const screen = result.nodes[0];
      if (screen?.type === "Screen") {
        const menubar = screen.children[0];
        expect(menubar?.type).toBe("MenuBar");
        if (menubar?.type === "MenuBar") {
          expect(menubar.menus).toHaveLength(1);
          expect(menubar.menus[0]?.type).toBe("Menu");
        }
      }
    });
  });

  describe("include", () => {
    it("正規形includeをIncludeノードに変換する", () => {
      const md = "# /test\n\n```include\npath: ./foo.md\nas: block\ndir: auto\n```";
      const result = parseMarkdown(md, "test.md");
      const screen = result.nodes[0];
      if (screen?.type === "Screen") {
        expect(screen.children[0]?.type).toBe("Include");
        const inc = screen.children[0];
        if (inc?.type === "Include") {
          expect(inc.path).toBe("./foo.md");
          expect(inc.as).toBe("block");
        }
      }
    });

    it("includes配列にIncludeノードが含まれる", () => {
      const md = "# /test\n\n```include\npath: ./foo.md\nas: block\ndir: auto\n```";
      const result = parseMarkdown(md, "test.md");
      expect(result.includes).toHaveLength(1);
      expect(result.includes[0]?.path).toBe("./foo.md");
    });
  });

  describe("IDの採番", () => {
    it("全ノードにIDが付与される", () => {
      const result = parseMarkdown(
        "# /test\n\n## カード {.card}\n\n[ボタン]{.btn}",
        "test.md",
      );
      const screen = result.nodes[0];
      expect(screen?.id).toBe("screen-0");
      if (screen?.type === "Screen") {
        expect(screen.children[0]?.id).toBe("card-0");
        if (screen.children[0]?.type === "Card") {
          expect(screen.children[0].children[0]?.id).toBe("button-0");
        }
      }
    });
  });
});
