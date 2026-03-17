/**
 * lint診断情報の型定義
 * VS Code の vscode.Diagnostic と対応する設計にして
 * Phase 3のVS Code拡張側でのアダプター変換を最小化する
 */

/** 診断の重大度 */
export type DiagnosticSeverity = "error" | "warning" | "information" | "hint";

/** ソース位置（行・文字位置ベース、0始まり） */
export interface DiagnosticPosition {
  line: number;
  character: number;
}

/** ソース範囲 */
export interface DiagnosticRange {
  start: DiagnosticPosition;
  end: DiagnosticPosition;
}

/** lint診断情報 */
export interface Diagnostic {
  /**
   * ルールコード（例: "FM001"）
   * テストIDとの対応: FM001=unknownKey, FM002=invalidValue,
   * FM003=missingPath, FM004=circularInclude, FM005=unsupportedEvent,
   * FM006=structuralError, FM007=lintWarning（pane flex/w競合 等）
   */
  code: string;
  /** 診断メッセージ */
  message: string;
  /** 重大度 */
  severity: DiagnosticSeverity;
  /** 対象ファイルのワークスペース相対パス */
  filePath: string;
  /** 診断対象のソース範囲 */
  range: DiagnosticRange;
  /** 追加情報（オプション） */
  source?: string;
}

/** lintルールコード一覧 */
export const DIAGNOSTIC_CODES = {
  /** includeブロックの未知キー */
  UNKNOWN_KEY: "FM001",
  /** 属性値の不正値（dir, as 等） */
  INVALID_VALUE: "FM002",
  /** 存在しないincludeパス */
  MISSING_PATH: "FM003",
  /** includeの循環参照 */
  CIRCULAR_INCLUDE: "FM004",
  /** 未サポートイベント（on:hover 等） */
  UNSUPPORTED_EVENT: "FM005",
  /** Row内にblock includeが使われている */
  BLOCK_IN_ROW: "FM006",
  /** 有効な親コンテキスト外でH3が使われている */
  H3_OUTSIDE_CONTEXT: "FM007",
  /** Paneに flex と w/h が同時指定されている */
  PANE_SIZE_CONFLICT: "FM008",
} as const;
