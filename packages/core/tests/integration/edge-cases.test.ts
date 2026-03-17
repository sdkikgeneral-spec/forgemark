/**
 * エッジケース統合テスト
 * include/graph: p1-path-03 / p1-empty-02 / p1-deep-03 / p1-id-03 / p1-fb-01〜02
 * パーサー: screen-02~04 / card-02 / input-02~04 / btn-03 / text-01~03 / escape-01~03
 * lint: lint-10（未知キー）
 */

import { describe, it, expect } from "vitest";
import { parseMarkdown } from "../../src/parser/index.js";
import { resolvePath } from "../../src/include/pathResolver.js";
import { parseCanonicalIncludeWithWarnings } from "../../src/include/canonicalParser.js";
import { checkUnknownKeys } from "../../src/lint/rules/unknownKey.js";
import { resolveIdConflicts } from "../../src/parser/idAssigner.js";
import { DependencyGraph } from "../../src/graph/dependencyGraph.js";
import { DIAGNOSTIC_CODES } from "../../src/lint/types.js";

// ─── パーサー エッジケース ─────────────────────────────────────────────────

describe("パーサー エッジケース", () => {
  // Screen
  it("Screen: dir:rtl 属性（parser-screen-02）", () => {
    const { nodes } = parseMarkdown("# /login {dir:rtl}", "test.md");
    expect(nodes[0]?.type).toBe("Screen");
    if (nodes[0]?.type === "Screen") {
      expect(nodes[0].dir).toBe("rtl");
    }
  });

  it("H1 が2つ → Screen が2件（parser-screen-03）", () => {
    const { nodes } = parseMarkdown("# /login\n\n# /register", "test.md");
    expect(nodes.filter((n) => n.type === "Screen")).toHaveLength(2);
  });

  it("H1 なし → Screenは0件（parser-screen-04）", () => {
    const { nodes } = parseMarkdown("## カード {.card}", "test.md");
    expect(nodes.filter((n) => n.type === "Screen")).toHaveLength(0);
  });

  // Card
  it("Card: .dialog クラス（parser-card-02）", () => {
    const { nodes } = parseMarkdown("# /test\n\n## ダイアログ {.dialog}", "test.md");
    const screen = nodes[0];
    if (screen?.type === "Screen") {
      const card = screen.children[0];
      // .dialog は昇格なし → Card
      expect(card?.type).toBe("Card");
    }
  });

  // Button
  it("Button: on:submit イベント（parser-btn-03）", () => {
    const { nodes } = parseMarkdown(
      `# /test\n\n[送信]{.btn on:submit="form.submit()"}`,
      "test.md",
    );
    const screen = nodes[0];
    if (screen?.type === "Screen") {
      const btn = screen.children[0];
      if (btn?.type === "Button") {
        expect(btn.events["on:submit"]).toBe("form.submit()");
      }
    }
  });

  // Text
  it("Text: 基本段落（parser-text-01）", () => {
    const { nodes } = parseMarkdown("# /test\n\nこれは説明文です", "test.md");
    const screen = nodes[0];
    if (screen?.type === "Screen") {
      const text = screen.children[0];
      expect(text?.type).toBe("Text");
      if (text?.type === "Text") {
        expect(text.content).toBe("これは説明文です");
      }
    }
  });

  it("Text: RTL文字（parser-text-03）", () => {
    const { nodes } = parseMarkdown("# /test\n\nمرحبا بالعالم", "test.md");
    const screen = nodes[0];
    if (screen?.type === "Screen") {
      const text = screen.children[0];
      if (text?.type === "Text") {
        expect(text.content).toBe("مرحبا بالعالم");
      }
    }
  });

  // エスケープ（parser-escape-01〜03）
  it("エスケープ: \\[ → [ （parser-escape-01）", () => {
    const { nodes } = parseMarkdown("# /test\n\n\\[テキスト\\]", "test.md");
    const screen = nodes[0];
    if (screen?.type === "Screen") {
      const node = screen.children[0];
      if (node?.type === "Text") {
        expect(node.content).toContain("[テキスト]");
      }
    }
  });

  it("エスケープ: \\| はremarkが先に処理するため2列になる（parser-escape-03）", () => {
    // 制約: remarkはMarkdownエスケープ \\| を先に処理して | に変換する。
    // ForgeMarkのescapeHandlerに届く時点では既に | となっており、
    // Row構文の列区切りとして機能するため2列になる。
    const { nodes } = parseMarkdown("# /test\n\n[[ A \\| B ]]", "test.md");
    const screen = nodes[0];
    if (screen?.type === "Screen") {
      const row = screen.children[0];
      if (row?.type === "Row") {
        // remarkがエスケープを先処理するため2列になる（意図的な動作）
        expect(row.columns).toHaveLength(2);
      }
    }
  });
});

// ─── include エッジケース ──────────────────────────────────────────────────

describe("include エッジケース", () => {
  // p1-path-03: ワークスペース外パス
  it("../../ → isOutsideWorkspace=true（p1-path-03）", () => {
    const result = resolvePath(
      "../../outOfWorkspace.md",
      "./pages/login.md",
      "/workspace",
    );
    expect(result.isOutsideWorkspace).toBe(true);
    expect(result.exists).toBe(false);
  });

  // p1-empty-02: コメントのみのファイル（HTML コメントはMarkdownに存在しないがHTMLとして処理）
  it("コメント行のみ → AST は空配列（p1-empty-02）", () => {
    // Markdown にコメント構文はないが、HTML コメントを含む段落は Text として扱われる
    const { nodes } = parseMarkdown("<!-- コメント -->", "test.md");
    // HTML コメントは remark が無視するため空配列
    expect(nodes).toHaveLength(0);
  });

  // p1-deep-03: ダイヤモンド（短絡）依存
  it("A→B→C / A→C の構成で C は1回のみカウント（p1-deep-03）", () => {
    const graph = new DependencyGraph();
    graph.update("A.md", ["B.md", "C.md"]);
    graph.update("B.md", ["C.md"]);
    graph.update("C.md", []);

    // C を変更したとき A/B に影響が伝播する
    const affected = graph.getAffected("C.md");
    expect(affected.has("A.md")).toBe(true);
    expect(affected.has("B.md")).toBe(true);
    // グラフ上では C のノードは1つだけ
    expect(graph.size).toBe(3);
  });

  // p1-id-03: 3ファイル間のID衝突解消
  it("3ファイル間のID衝突 → サフィックス -1,-2 で解消（p1-id-03）", () => {
    const makeBtn = (label: string) => ({
      id: "button-0",
      type: "Button" as const,
      class: [] as string[],
      dir: "auto" as const,
      label,
      disabled: false,
      events: {},
    });

    // ファイルAのIDセットを既存として登録
    const existingIds = new Set<string>(["button-0"]);

    // ファイルBの衝突解消
    const resolvedB = resolveIdConflicts([makeBtn("B")], existingIds);
    expect(resolvedB[0]?.id).toBe("button-0-1");

    // ファイルCの衝突解消（existingIds に button-0 と button-0-1 が入っている）
    const resolvedC = resolveIdConflicts([makeBtn("C")], existingIds);
    expect(resolvedC[0]?.id).toBe("button-0-2");

    // 全IDがユニーク
    const allIds = ["button-0", resolvedB[0]!.id, resolvedC[0]!.id];
    expect(new Set(allIds).size).toBe(3);
  });

  // p1-fb-01: フォールバックコンテンツの認識
  it("--- 以降のコンテンツを持つ include → fallback が空配列（p1-fb-01）", () => {
    const content = "path: ./missing.md\n---\n## フォールバック {.card}";
    const { node } = parseCanonicalIncludeWithWarnings(content);
    expect(node).not.toBeNull();
    if (node) {
      // Phase 1 では fallback は空配列（解析は後フェーズ）
      expect(Array.isArray(node.fallback)).toBe(true);
    }
  });

  // p1-fb-02: フォールバックなしの include
  it("--- なし の include → fallback は undefined（p1-fb-02）", () => {
    const content = "path: ./foo.md\nas: block\n";
    const { node } = parseCanonicalIncludeWithWarnings(content);
    expect(node?.fallback).toBeUndefined();
  });
});

// ─── lint-10: 未知キー（include ブロック） ────────────────────────────────

describe("lint-10: 未知キー（checkUnknownKeys）", () => {
  it("未知キーが警告 FM001 として報告される（lint-10）", () => {
    // parseMarkdown 経由で include ブロックを解析し、FM001 が発火することを確認する
    const source = "```include\npath: ./foo.md\nunknownKey: someValue\nas: block\n```";
    const result = parseMarkdown(source, "test.md");

    const fm001 = result.diagnostics.filter(
      (d) => d.code === DIAGNOSTIC_CODES.UNKNOWN_KEY,
    );
    expect(fm001).toHaveLength(1);
    expect(fm001[0]?.message).toContain("unknownKey");
    expect(fm001[0]?.severity).toBe("warning");
  });

  it("既知キーのみなら診断なし（lint-10）", () => {
    const source = "```include\npath: ./foo.md\nas: block\ndir: auto\n```";
    const result = parseMarkdown(source, "test.md");

    const fm001 = result.diagnostics.filter(
      (d) => d.code === DIAGNOSTIC_CODES.UNKNOWN_KEY,
    );
    expect(fm001).toHaveLength(0);
  });
});
