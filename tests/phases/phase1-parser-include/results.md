# Phase 1 — テスト結果

**フェーズ**: D1–D2 パーサー / include / 依存グラフ
**最終更新**: —
**実行環境**: Node 20 / Vitest

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

## 基本パーサー（§1 回帰）

| テストID | 説明 | 状態 | メモ |
| --- | --- | --- | --- |
| `parser-screen-01` | Screen: route + class | TODO | |
| `parser-screen-02` | Screen: dir:rtl | TODO | |
| `parser-screen-03` | H1 が2つ | TODO | |
| `parser-screen-04` | H1 なし | TODO | |
| `parser-card-01` | Card: class | TODO | |
| `parser-card-02` | Card: .dialog | TODO | |
| `parser-card-03` | Card: クラスなし | TODO | |
| `parser-row-01` | Row: 3列 + class | TODO | |
| `parser-row-02` | Row: クラスなし | TODO | |
| `parser-row-03` | Row: 1列 | TODO | |
| `parser-row-04` | Row: 空列 | TODO | |
| `parser-input-01` | Input: type:email required | TODO | |
| `parser-input-02` | Input: placeholder | TODO | |
| `parser-input-03` | Input: disabled | TODO | |
| `parser-input-04` | Input: 不正type | TODO | |
| `parser-btn-01` | Button: label + class | TODO | |
| `parser-btn-02` | Button: on:click | TODO | |
| `parser-btn-03` | Button: on:submit | TODO | |
| `parser-btn-04` | Button: 未サポートイベント | TODO | |
| `parser-text-01` | Text: 基本 | TODO | |
| `parser-text-02` | Text: class | TODO | |
| `parser-text-03` | Text: RTL文字 | TODO | |
| `parser-escape-01` | エスケープ: `\[` | TODO | |
| `parser-escape-02` | エスケープ: `\{` | TODO | |
| `parser-escape-03` | エスケープ: `\|` | TODO | |
| `parser-menu-01` 〜 `parser-menu-11` | MenuBar/Menu/MenuItem | TODO | |
| `parser-id-01` 〜 `parser-id-03` | id採番 | TODO | |

---

## 新プリミティブ パーサー（§11b / §13 / SC-21〜23 回帰）

| テストID | 説明 | 状態 | メモ |
| --- | --- | --- | --- |
| `p1-tree-01` | Tree: 基本ノード | TODO | |
| `p1-tree-02` | TreeItem: icon | TODO | |
| `p1-tree-03` | TreeItem: ネスト2階層 | TODO | |
| `p1-tree-04` | TreeItem: selected + collapsed | TODO | |
| `p1-tree-05` | TreeItem: disabled | TODO | |
| `p1-tree-06` | Tree外のリストにicon属性 | TODO | |
| `p1-panes-01` | Panes: horizontal | TODO | |
| `p1-panes-02` | Panes: vertical | TODO | |
| `p1-panes-03` | Panes: 方向省略（既定） | TODO | |
| `p1-panes-04` | Pane: w:240 | TODO | |
| `p1-panes-05` | Pane: flex:1 | TODO | |
| `p1-panes-06` | Pane: flex+w 競合 | TODO | |
| `p1-panes-07` | Pane: collapsed | TODO | |
| `p1-badge-01` | Badge: 基本 | TODO | |
| `p1-badge-02` | Badge: class | TODO | |
| `p1-badge-03` | Badge: on:click 警告 | TODO | |
| `p1-select-01` | Select: 基本 | TODO | |
| `p1-select-02` | Select: options 3件 | TODO | |
| `p1-select-03` | Select: selected option | TODO | |
| `p1-toggle-01` | Toggle: 基本 | TODO | |
| `p1-toggle-02` | Toggle: checked | TODO | |
| `parser-cb-01` 〜 `parser-cb-03` | Checkbox | TODO | |
| `parser-rg-01` 〜 `parser-rg-03` | RadioGroup | TODO | |
| `parser-dd-01` 〜 `parser-dd-04` | Dropdown | TODO | |
| `parser-lb-01` 〜 `parser-lb-04` | Listbox | TODO | |
| `parser-tb-01` 〜 `parser-tb-05` | Toolbar | TODO | |
| `parser-sb-01` 〜 `parser-sb-04` | StatusBar | TODO | |
| `parser-tabs-01` 〜 `parser-tabs-04` | Tabs | TODO | |
| `parser-acc-01` 〜 `parser-acc-03` | Accordion | TODO | |
| `parser-ta-01` 〜 `parser-ta-04` | Textarea | TODO | |
| `parser-rng-01` 〜 `parser-rng-03` | Range | TODO | |
| `parser-cmb-01` 〜 `parser-cmb-04` | Combobox | TODO | |
| `parser-prog-01` 〜 `parser-prog-04` | Progress | TODO | |
| `parser-spin-01` 〜 `parser-spin-03` | Spinner | TODO | |
| `parser-alt-01` 〜 `parser-alt-04` | Alert | TODO | |
| `parser-div-01` 〜 `parser-div-05` | Divider | TODO | |
| `parser-img-01` 〜 `parser-img-04` | Image | TODO | |
| `parser-av-01` 〜 `parser-av-03` | Avatar | TODO | |
| `parser-grid-01` 〜 `parser-grid-04` | Grid | TODO | |
| `parser-tbl-01` 〜 `parser-tbl-04` | Table | TODO | |
| `parser-sk-01` 〜 `parser-sk-03` | Skeleton | TODO | |

---

## include / 依存グラフ（SC-11〜SC-33）

| テストID | 説明 | 状態 | メモ |
| --- | --- | --- | --- |
| `include-canon-01` 〜 `include-canon-08` | 正規形パース | TODO | |
| `include-sugar-01` 〜 `include-sugar-04` | 糖衣パース | TODO | |
| `include-fallback-01` 〜 `include-fallback-03` | フォールバック動作 | TODO | |
| `p1-sugar-01` | 糖衣→正規: path のみ | TODO | |
| `p1-sugar-02` | 糖衣→正規: as:inline | TODO | |
| `p1-sugar-03` | 糖衣→正規: dir:rtl | TODO | |
| `p1-sugar-04` | 複数糖衣の一括変換 | TODO | |
| `p1-deep-01` | 4階層include展開 | TODO | |
| `p1-deep-02` | 4階層循環検出 | TODO | |
| `p1-deep-03` | 短絡あり深度 | TODO | |
| `p1-path-01` | パス正規化: `../` | TODO | |
| `p1-path-02` | パス正規化: `./././` | TODO | |
| `p1-path-03` | ワークスペース外パス | TODO | |
| `p1-path-04` | 日本語ディレクトリ | TODO | |
| `p1-utf8-01` | 全角ファイル名 | TODO | |
| `p1-utf8-02` | スペース含むファイル名 | TODO | |
| `p1-utf8-03` | アラビア文字ファイル名 | TODO | |
| `p1-empty-01` | 空ファイル | TODO | |
| `p1-empty-02` | コメントのみ | TODO | |
| `p1-empty-03` | H1のみ | TODO | |
| `p1-empty-04` | H2のみ | TODO | |
| `p1-esc-01` | 属性値内シングルクォート | TODO | |
| `p1-esc-02` | on:click内クォート | TODO | |
| `p1-esc-03` | 改行リテラル | TODO | |
| `p1-esc-04` | Tailwindブラケット記法 | TODO | |
| `p1-id-01` | id衝突: 2ファイル | TODO | |
| `p1-id-02` | id衝突: 同ファイル2回include | TODO | |
| `p1-id-03` | id衝突: 3ファイル | TODO | |
| `p1-diamond-01` | ダイヤモンド依存 | TODO | |
| `p1-diamond-02` | ダイヤモンド依存後のD変更 | TODO | |
| `p1-fb-01` | フォールバック複数ノード | TODO | |
| `p1-fb-02` | フォールバック内include | TODO | |
| `graph-01` 〜 `graph-topo-01` | 依存グラフ全般 | TODO | |
| `lint-01` 〜 `lint-10` | リントルール | TODO | |

---

## 凡例

| 状態 | 意味 |
| --- | --- |
| `TODO` | 未実装（テストコードなし） |
| `PASS` | 合格 |
| `FAIL` | 不合格（Fail時はメモ欄に原因を記録） |
| `SKIP` | スキップ（理由をメモ欄に記録） |
| `WONTFIX` | 対応しない（理由をメモ欄に記録） |
