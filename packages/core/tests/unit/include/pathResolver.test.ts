import { describe, it, expect } from "vitest";
import { normalizePath } from "../../../src/include/pathResolver.js";

describe("normalizePath", () => {
  it("./components/../components/Btn.md → ./components/Btn.md（SC-13: p1-path-01）", () => {
    const result = normalizePath("./components/../components/Btn.md");
    expect(result).toBe("./components/Btn.md");
  });

  it("././././Btn.md → ./Btn.md（SC-13: p1-path-02）", () => {
    const result = normalizePath("././././Btn.md");
    expect(result).toBe("./Btn.md");
  });

  it("UTF-8ファイル名を正常解決する（SC-14: p1-utf8-01）", () => {
    const result = normalizePath("./コンポーネント/Btn.md");
    expect(result).toBe("./コンポーネント/Btn.md");
  });

  it("スペースを含むファイル名（SC-14: p1-utf8-02）", () => {
    const result = normalizePath("./my component.md");
    expect(result).toBe("./my component.md");
  });

  it("アラビア文字のファイル名（SC-14: p1-utf8-03）", () => {
    const result = normalizePath("./تسجيل.md");
    expect(result).toBe("./تسجيل.md");
  });
});

// resolvePath はファイルシステムにアクセスするため、統合テストで確認する
