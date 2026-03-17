/**
 * includeパス解決モジュール
 * パスの正規化・ワークスペース外チェック・存在確認を行う
 * ファイルシステムアクセスはこのモジュールにのみ集約する
 */

import * as path from "node:path";
import * as fs from "node:fs";

/** パス解決結果 */
export interface PathResolveResult {
  /** 正規化済みワークスペース相対パス */
  normalizedPath: string;
  /** ワークスペース外に出ているか */
  isOutsideWorkspace: boolean;
  /** パスが実際に存在するか */
  exists: boolean;
}

/**
 * includeパスを解決・正規化する
 * @param includePath - include記述内のパス（例: "./components/../Btn.md"）
 * @param fromFilePath - 記述元ファイルのワークスペース相対パス
 * @param workspaceRoot - ワークスペースルートの絶対パス
 */
export function resolvePath(
  includePath: string,
  fromFilePath: string,
  workspaceRoot: string,
): PathResolveResult {
  // 記述元ファイルのディレクトリを基準に絶対パスを計算
  const fromDir = path.dirname(path.resolve(workspaceRoot, fromFilePath));
  const absolutePath = path.resolve(fromDir, includePath);

  // ワークスペース外チェック
  const normalizedWorkspace = path.normalize(workspaceRoot);
  const normalizedAbsolute = path.normalize(absolutePath);

  if (!normalizedAbsolute.startsWith(normalizedWorkspace + path.sep) &&
      normalizedAbsolute !== normalizedWorkspace) {
    return {
      normalizedPath: includePath,
      isOutsideWorkspace: true,
      exists: false,
    };
  }

  // ワークスペース相対パスに変換
  const relativePath = path
    .relative(workspaceRoot, absolutePath)
    .split(path.sep)
    .join("/");

  // ファイル存在確認
  let exists = false;
  try {
    exists = fs.existsSync(absolutePath);
  } catch {
    exists = false;
  }

  return {
    normalizedPath: `./${relativePath}`,
    isOutsideWorkspace: false,
    exists,
  };
}

/**
 * パスを正規化する（ファイルシステムアクセスなし）
 * ././././ → ./ や ./components/../Btn.md → ./Btn.md の変換
 * @param includePath - 正規化するパス
 */
export function normalizePath(includePath: string): string {
  // Node.jsのpath.normalizeを使用してパスを正規化
  // posixスタイルで処理する
  const parts = includePath.split("/");
  const normalized: string[] = [];

  for (const part of parts) {
    if (part === "." || part === "") {
      // ./ はルート相対の場合のみ残す
      if (normalized.length === 0) normalized.push(".");
    } else if (part === "..") {
      if (normalized.length > 1) {
        normalized.pop();
      } else {
        // ルートより上 → そのまま追加（ワークスペース外チェックは別関数）
        normalized.push("..");
      }
    } else {
      normalized.push(part);
    }
  }

  const result = normalized.join("/");
  // 相対パスが . だけの場合は ./ に
  if (result === ".") return "./";
  return result;
}
