import { describe, it, expect } from "vitest";
import {
  normalizeSugarIncludes,
  sugarToCanonical,
} from "../../../src/include/normalizer.js";

describe("sugarToCanonical", () => {
  it("pathのみの糖衣形を正規形に変換する（SC-11: p1-sugar-01）", () => {
    const result = sugarToCanonical('path="./foo.md"');
    expect(result).toBe(
      "```include\npath: ./foo.md\nas: block\ndir: auto\n```",
    );
  });

  it("as=inline の糖衣形を正規形に変換する（SC-11: p1-sugar-02）", () => {
    const result = sugarToCanonical('path="./foo.md" as="inline"');
    expect(result).toContain("as: inline");
  });

  it("dir=rtl の糖衣形を正規形に変換する（SC-11: p1-sugar-03）", () => {
    const result = sugarToCanonical('path="./foo.md" dir="rtl"');
    expect(result).toContain("dir: rtl");
  });

  it("出力キー順序は path → as → dir → class の固定順序", () => {
    const result = sugarToCanonical('path="./foo.md" dir="rtl" as="inline"');
    const lines = result.split("\n");
    const pathLine = lines.findIndex((l) => l.startsWith("path:"));
    const asLine = lines.findIndex((l) => l.startsWith("as:"));
    const dirLine = lines.findIndex((l) => l.startsWith("dir:"));
    expect(pathLine).toBeLessThan(asLine);
    expect(asLine).toBeLessThan(dirLine);
  });
});

describe("normalizeSugarIncludes", () => {
  it("テキスト内の全糖衣includeを正規形に変換する（SC-11: p1-sugar-04）", () => {
    const source = [
      "# テスト",
      "",
      '```include path="./a.md"```',
      "",
      '```include path="./b.md" as="inline"```',
    ].join("\n");

    const result = normalizeSugarIncludes(source);
    expect(result).toContain("path: ./a.md");
    expect(result).toContain("path: ./b.md");
    expect(result).toContain("as: inline");
    // 糖衣形が残っていないこと
    expect(result).not.toContain('path="./a.md"');
  });

  it("糖衣形がない場合は入力と同一の文字列を返す", () => {
    const source = "# テスト\n\n通常テキスト";
    expect(normalizeSugarIncludes(source)).toBe(source);
  });

  it("正規形のincludeは変更しない", () => {
    const source = "```include\npath: ./foo.md\nas: block\ndir: auto\n```";
    expect(normalizeSugarIncludes(source)).toBe(source);
  });
});
