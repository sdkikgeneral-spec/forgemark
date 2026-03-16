# Phase 1 — テストシナリオ

**対象期間**: D1–D2
**スコープ**: Markdownパーサー / UI AST変換 / include正規化 / 依存グラフ / 循環検出

---

## ギャップ分析（test_spec.md との差分）

test_spec.md §1–§4 / §11b / §13 で定義済みの項目に加え、以下が未カバー。

| ギャップID | 未カバー領域 | 対応シナリオ |
| --- | --- | --- |
| G1-01 | 糖衣→正規変換の正確な出力文字列 | SC-11 |
| G1-02 | 3階層以上のinclude深度 | SC-12 |
| G1-03 | パス正規化（`../`・`./././`） | SC-13 |
| G1-04 | UTF-8ファイル名のパス解決 | SC-14 |
| G1-05 | 空ファイルのパース | SC-15 |
| G1-06 | 属性値のエスケープ（クォート内シングルクォート） | SC-16 |
| G1-07 | Treeノードのパーサーテスト | SC-21 |
| G1-08 | Panesノードのパーサーテスト | SC-22 |
| G1-09 | Badge / Select / Toggle のパーサーテスト | SC-23 |
| G1-10 | include展開後のid衝突解消詳細 | SC-31 |
| G1-11 | ダイヤモンド依存での重複展開回避 | SC-32（graph-04拡張） |
| G1-12 | フォールバックコンテンツが複数ノードの場合 | SC-33 |

---

## シナリオ一覧

### グループ1: 基本パーサー（既存 §1 の補完）

#### SC-01 〜 SC-10（test_spec.md §1.1–§1.9 参照）

test_spec.md §1 に定義済み。本フェーズの回帰テストとして実行する。

---

### グループ2: 新プリミティブ パーサー（既存 §11b / §13 の補完）

#### SC-21: Tree / TreeItem パーサー

| シナリオID | 入力 | 期待結果 |
| --- | --- | --- |
| `p1-tree-01` | `## ファイルツリー {.tree}` | Tree ノード: `{ class: ["tree"], items: [] }` |
| `p1-tree-02` | Tree直下 `- src {icon:"folder"}` | TreeItem: `{ label: "src", icon: "folder" }` |
| `p1-tree-03` | TreeItemのネスト2階層 | children に TreeItem を持つ |
| `p1-tree-04` | `- main.md {selected collapsed}` | TreeItem: `{ selected: true, collapsed: true }` |
| `p1-tree-05` | `- node {disabled}` | TreeItem: `{ disabled: true }` |
| `p1-tree-06` | `.tree` 外のリストにicon属性 | 通常リストアイテム（Treeに昇格しない） |

#### SC-22: Panes / Pane パーサー

| シナリオID | 入力 | 期待結果 |
| --- | --- | --- |
| `p1-panes-01` | `## 画面 {.panes horizontal}` | Panes: `{ direction: "horizontal" }` |
| `p1-panes-02` | `## 画面 {.panes vertical}` | Panes: `{ direction: "vertical" }` |
| `p1-panes-03` | `## 画面 {.panes}` （方向省略） | Panes: `{ direction: "horizontal" }` (既定) |
| `p1-panes-04` | Panes直下 `### 左 {.pane w:240}` | Pane: `{ w: 240 }` |
| `p1-panes-05` | Pane `{flex:1}` | Pane: `{ flex: 1 }` |
| `p1-panes-06` | Pane `{flex:1 w:240}` 同時指定 | lint 警告（flex と w 競合） |
| `p1-panes-07` | Pane `{collapsed}` | Pane: `{ collapsed: true }` |

#### SC-23: Badge / Select / Toggle パーサー

| シナリオID | 入力 | 期待結果 |
| --- | --- | --- |
| `p1-badge-01` | `[通知]{.badge}` | Button の badge バリアント: `{ class: ["badge"] }` |
| `p1-badge-02` | `[3]{.badge .error}` | Badge: `{ class: ["badge", "error"] }` |
| `p1-badge-03` | `[badge]{.badge on:click="x()"}` | lint 警告（Badge はインタラクティブ不可） |
| `p1-select-01` | `[____]{type:select}` | Input: `{ inputType: "select" }` |
| `p1-select-02` | Select直後のリストが3項目 | options: 3件 |
| `p1-select-03` | `- 選択肢1 {value:"v1" selected}` | option: `{ selected: true }` |
| `p1-toggle-01` | `[____]{type:toggle}` | Input: `{ inputType: "toggle", checked: false }` |
| `p1-toggle-02` | `[____]{type:toggle checked}` | Input: `{ checked: true }` |

---

### グループ3: include / グラフ（既存 §2–§3 の補完）

#### SC-11: 糖衣→正規変換の出力検証

| シナリオID | 入力（糖衣） | 期待出力（正規形） |
| --- | --- | --- |
| `p1-sugar-01` | `` ```include path="./foo.md"``` `` | `` ```include\npath: ./foo.md\nas: block\ndir: auto\n``` `` |
| `p1-sugar-02` | `` ```include path="./foo.md" as="inline"``` `` | `as: inline` が含まれる正規形 |
| `p1-sugar-03` | `` ```include path="./foo.md" dir="rtl"``` `` | `dir: rtl` が含まれる正規形 |
| `p1-sugar-04` | 保存時に複数の糖衣が混在 | 全てが正規形に変換される |

#### SC-12: 3階層以上のinclude深度

| シナリオID | シナリオ | 期待結果 |
| --- | --- | --- |
| `p1-deep-01` | A→B→C→D（4階層） | 全展開成功、依存グラフに4ノード |
| `p1-deep-02` | A→B→C→A（4階層循環） | lint error（全ファイルに報告） |
| `p1-deep-03` | A→B→C、かつA→C（短絡あり） | Cが重複展開されない |

#### SC-13: パス正規化

| シナリオID | 入力パス | 期待解決パス |
| --- | --- | --- |
| `p1-path-01` | `./components/../components/Btn.md` | `./components/Btn.md` |
| `p1-path-02` | `././././Btn.md` | `./Btn.md` |
| `p1-path-03` | `../../outOfWorkspace.md` | lint error（ワークスペース外パス） |
| `p1-path-04` | パスに日本語ディレクトリ `./コンポーネント/Btn.md` | 正常解決 |

#### SC-14: UTF-8ファイル名

| シナリオID | シナリオ | 期待結果 |
| --- | --- | --- |
| `p1-utf8-01` | ファイル名に全角文字 `ログイン.md` | 正常パース、依存グラフに追加される |
| `p1-utf8-02` | ファイル名にスペース `my component.md` | URL エンコード不要でパス解決される |
| `p1-utf8-03` | ファイル名にアラビア文字 `تسجيل.md` | 正常解決 |

#### SC-15: 空ファイル・エッジケース

| シナリオID | シナリオ | 期待結果 |
| --- | --- | --- |
| `p1-empty-01` | 完全に空のファイル | ASTは空配列、エラーなし |
| `p1-empty-02` | コメントのみのファイル | ASTは空配列 |
| `p1-empty-03` | H1のみ（本文なし） | Screen ノード1件のみ |
| `p1-empty-04` | H2のみ（本文なし） | Card ノード1件（子なし） |

#### SC-16: 属性エスケープ

| シナリオID | 入力 | 期待結果 |
| --- | --- | --- |
| `p1-esc-01` | `{placeholder:"it's a test"}` | placeholder: `it's a test` |
| `p1-esc-02` | `{on:click="dlg.close('ok')"}` | events: `{ "on:click": "dlg.close('ok')" }` |
| `p1-esc-03` | `{placeholder:"line1\nline2"}` | placeholder: `line1\nline2`（改行リテラル） |
| `p1-esc-04` | `{class:"w-[320px]"}` | class に `w-[320px]` を含む |

#### SC-31: include展開後のid衝突解消

| シナリオID | シナリオ | 期待結果 |
| --- | --- | --- |
| `p1-id-01` | main.md の button-0 + included.md の button-0 | included側が `button-0-1` に変更 |
| `p1-id-02` | 同じファイルを2回include | 2回目のノードIDに `-2` サフィックス |
| `p1-id-03` | 3ファイル間で衝突 | サフィックス `-1`, `-2` と順序通りに付与 |

#### SC-32: ダイヤモンド依存の重複展開回避

| シナリオID | シナリオ | 期待結果 |
| --- | --- | --- |
| `p1-diamond-01` | A→B、A→C、B→D、C→D | Dは1回のみ解析される（依存グラフ上で重複エッジなし） |
| `p1-diamond-02` | 上記でDを変更 | A/B/C全てが再レンダリング対象としてマークされる |

#### SC-33: フォールバックが複数ノードの場合

| シナリオID | 入力 | 期待結果 |
| --- | --- | --- |
| `p1-fb-01` | `---` 以降にCard+Button | fallback: `[Card, Button]`（2ノード） |
| `p1-fb-02` | `---` 以降にinclude（ネストfallback） | fallback内のincludeもパースされる |

---

## カバレッジ対応表

| test_spec.md セクション | 本シナリオでの対応 |
| --- | --- |
| §1 基本パーサー | SC-01〜SC-10（回帰） |
| §2 includeパーサー | 回帰 + SC-11, SC-15, SC-16 |
| §3 依存グラフ | 回帰 + SC-12, SC-13, SC-32 |
| §4 リントルール | 回帰 + SC-13(G1-03), SC-22(G1-08) |
| §11b 新UIコントローラー | 回帰 + SC-21, SC-22, SC-23 |
| §13 追加コンポーネント | 回帰（Textarea/Range/Combobox 等） |

---

## テスト実装方針

- **フレームワーク**: Vitest
- **ファイル配置**: `tests/unit/parser/`, `tests/unit/include/`, `tests/unit/graph/`
- **フィクスチャ**: `tests/fixtures/valid/`, `tests/fixtures/invalid/`
- **実行コマンド**: `npx vitest run --reporter=verbose tests/unit/`
