import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // テストファイルのパターン
    include: ["tests/**/*.test.ts"],
    // カバレッジ設定
    coverage: {
      provider: "v8",
      include: [
        "src/parser/**",
        "src/include/**",
        "src/graph/**",
        "src/lint/**",
        "src/ast/**",
      ],
      exclude: ["src/index.ts"],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 85,
        statements: 90,
      },
    },
  },
});
