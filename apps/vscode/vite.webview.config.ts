import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  // webview/ をルートにする
  root: "webview",
  plugins: [react(), tailwindcss()],
  build: {
    outDir: path.resolve(__dirname, "dist/webview"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // ファイル名を固定してPreviewPanel.tsから参照しやすくする
        entryFileNames: "main.js",
        assetFileNames: "[name][extname]",
      },
    },
  },
  resolve: {
    alias: {
      "@forgemark/renderer": path.resolve(
        __dirname,
        "../../packages/renderer/src/index.ts"
      ),
      // webview ではランタイムにcoreを使わないため空スタブに差し替える
      "@forgemark/core": path.resolve(__dirname, "webview/stubs/core.ts"),
      "node:path": path.resolve(__dirname, "webview/stubs/node-path.ts"),
      "node:fs": path.resolve(__dirname, "webview/stubs/node-fs.ts"),
    },
  },
});
