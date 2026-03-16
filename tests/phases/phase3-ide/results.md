# Phase 3 — テスト結果

**フェーズ**: D5–D7 VS Code 拡張
**最終更新**: —
**実行環境**: Node 20 / @vscode/test-electron

---

## サマリー

| 区分 | 件数 |
| --- | --- |
| 合計 | — |
| PASS | — |
| FAIL | — |
| SKIP | — |
| TODO | — |

---

## E2E 回帰（§10）

| テストID | 説明 | 状態 | メモ |
| --- | --- | --- | --- |
| `e2e-preview-01` | .md 開く→WebviewPanel 自動表示 | TODO | |
| `e2e-preview-02` | md 編集→プレビュー更新 | TODO | |
| `e2e-preview-03` | テーマ clean 切替 | TODO | |
| `e2e-preview-04` | カーソル→ハイライト | TODO | |
| `e2e-snippet-01` | `inc` スニペット展開 | TODO | |
| `e2e-complete-01` | path 補完 | TODO | |
| `e2e-complete-02` | as 補完 | TODO | |
| `e2e-jump-01` | 有効パス F12 | TODO | |
| `e2e-jump-02` | 存在しないパス F12 | TODO | |
| `e2e-rename-01` | ファイルリネーム追従 | TODO | |
| `e2e-rename-02` | フォルダリネーム追従 | TODO | |
| `e2e-format-01` | 糖衣→正規整形 | TODO | |
| `e2e-format-02` | formatOnSave: false | TODO | |
| `e2e-codegen-01` | コード生成→差分エディタ | TODO | |
| `e2e-codegen-02` | 既存ファイルあり→上書き確認 | TODO | |
| `e2e-codegen-03` | Unknown ノード含む生成 | TODO | |
| `e2e-lint-01` | 存在しないpath→Problems Error | TODO | |
| `e2e-lint-02` | 循環参照→全ファイルError | TODO | |
| `e2e-lint-03` | 未知キー→Problems Warning | TODO | |

---

## SC-51: スニペット展開

| テストID | 説明 | 状態 | メモ |
| --- | --- | --- | --- |
| `p3-snip-01` | テキスト挿入内容の一致 | TODO | |
| `p3-snip-02` | Tab 順序（path→as→dir） | TODO | |
| `p3-snip-03` | as のデフォルト block | TODO | |

---

## SC-52: 補完候補

| テストID | 説明 | 状態 | メモ |
| --- | --- | --- | --- |
| `p3-complete-01` | path: ./ → .md 一覧 | TODO | |
| `p3-complete-02` | 絞り込み補完 | TODO | |
| `p3-complete-03` | as: 候補 2件 | TODO | |
| `p3-complete-04` | dir: 候補 3件 | TODO | |
| `p3-complete-05` | include外では補完なし | TODO | |
| `p3-complete-06` | .md 0件 → 空リスト | TODO | |

---

## SC-53: ジャンプ

| テストID | 説明 | 状態 | メモ |
| --- | --- | --- | --- |
| `p3-jump-01` | F12 でジャンプ | TODO | |
| `p3-jump-02` | Ctrl+Click でジャンプ | TODO | |
| `p3-jump-03` | 存在しないパス→エラートースト | TODO | |
| `p3-jump-04` | 値の途中にカーソル | TODO | |
| `p3-jump-05` | 糖衣形でジャンプ | TODO | |

---

## SC-54: リネーム追従

| テストID | 説明 | 状態 | メモ |
| --- | --- | --- | --- |
| `p3-rename-01` | 1参照元のリネーム | TODO | |
| `p3-rename-02` | 3参照元の一括更新 | TODO | |
| `p3-rename-03` | フォルダリネーム | TODO | |
| `p3-rename-04` | undo による復元 | TODO | |
| `p3-rename-05` | 参照先消滅→lint error | TODO | |

---

## SC-55: Refactor Preview

| テストID | 説明 | 状態 | メモ |
| --- | --- | --- | --- |
| `p3-refactor-01` | Preview パネル表示 | TODO | |
| `p3-refactor-02` | 「適用」でファイル更新 | TODO | |
| `p3-refactor-03` | 「キャンセル」で変更なし | TODO | |

---

## SC-56: Problems 集約

| テストID | 説明 | 状態 | メモ |
| --- | --- | --- | --- |
| `p3-lint-01` | 複数エラー一覧表示 | TODO | |
| `p3-lint-02` | Error/Warning 区分 | TODO | |
| `p3-lint-03` | 循環参照の両ファイル表示 | TODO | |
| `p3-lint-04` | 修正後エントリ消去 | TODO | |
| `p3-lint-05` | ファイルを閉じたら消去 | TODO | |

---

## SC-57: マルチルート

| テストID | 説明 | 状態 | メモ |
| --- | --- | --- | --- |
| `p3-multi-01` | 警告通知表示 | TODO | |
| `p3-multi-02` | 詳細リンク動作 | TODO | |

---

## SC-58: formatOnSave

| テストID | 説明 | 状態 | メモ |
| --- | --- | --- | --- |
| `p3-format-01` | デフォルトON → 整形される | TODO | |
| `p3-format-02` | OFF → 整形されない | TODO | |
| `p3-format-03` | ONに戻す → 整形される | TODO | |
| `p3-format-04` | 正規形ファイル → 変更なし | TODO | |

---

## 凡例

| 状態 | 意味 |
| --- | --- |
| `TODO` | 未実装 |
| `PASS` | 合格 |
| `FAIL` | 不合格（メモに原因記録） |
| `SKIP` | スキップ |
| `WONTFIX` | 対応しない |
