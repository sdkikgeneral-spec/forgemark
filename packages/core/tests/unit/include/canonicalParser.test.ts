import { describe, it, expect } from "vitest";
import {
  parseCanonicalInclude,
  parseCanonicalIncludeWithWarnings,
} from "../../../src/include/canonicalParser.js";

describe("parseCanonicalInclude", () => {
  it("path のみの正規形を解析する", () => {
    const node = parseCanonicalInclude("path: ./foo.md");
    expect(node).not.toBeNull();
    expect(node?.path).toBe("./foo.md");
    expect(node?.as).toBe("block");
    expect(node?.dir).toBe("auto");
  });

  it("as: inline を解析する", () => {
    const node = parseCanonicalInclude("path: ./foo.md\nas: inline");
    expect(node?.as).toBe("inline");
  });

  it("dir: rtl を解析する", () => {
    const node = parseCanonicalInclude("path: ./foo.md\ndir: rtl");
    expect(node?.dir).toBe("rtl");
  });

  it("class を解析する", () => {
    const node = parseCanonicalInclude("path: ./foo.md\nclass: .right .gap-12");
    expect(node?.class).toContain("right");
    expect(node?.class).toContain("gap-12");
  });

  it("path がない場合はnullを返す", () => {
    const node = parseCanonicalInclude("as: block");
    expect(node).toBeNull();
  });

  it("--- 区切り以降はフォールバックとして認識する", () => {
    const content = "path: ./foo.md\n---\n[読み込めませんでした]{.text-error}";
    const node = parseCanonicalInclude(content);
    // フォールバックが存在する（空配列でもundefinedでない）
    expect(node?.fallback).toBeDefined();
  });
});

describe("parseCanonicalIncludeWithWarnings", () => {
  it("未知キーを警告として返す", () => {
    const { node, unknownKeys } = parseCanonicalIncludeWithWarnings(
      "path: ./foo.md\nunknownKey: value",
    );
    expect(node).not.toBeNull();
    expect(unknownKeys).toHaveLength(1);
    expect(unknownKeys[0]?.key).toBe("unknownKey");
  });

  it("既知キーのみの場合は警告なし", () => {
    const { unknownKeys } = parseCanonicalIncludeWithWarnings(
      "path: ./foo.md\nas: block\ndir: auto",
    );
    expect(unknownKeys).toHaveLength(0);
  });
});
