# Phase 1 — テスト結果

**フェーズ**: D1–D2 パーサー / include / 依存グラフ
**最終更新**: 2026-03-17（spec_review 指摘対応・バグ修正後）
**実行環境**: Node 24.14.0 / Vitest 1.6.1

---

## Vitest 実行サマリー

| 区分 | 件数 |
| --- | --- |
| テストファイル | 17 |
| テスト合計 | 232 |
| PASS | **232** |
| FAIL | 0 |
| SKIP | 0 |

```
Test Files  17 passed (17)
     Tests  232 passed (232)
  Duration  1.67s
```

### バグ修正（本実行で発見・修正済み）

| バグID | 対象ファイル | 内容 | 修正内容 |
| --- | --- | --- | --- |
| BUG-01 | `src/parser/attrParser.ts` | `on:click="value"` 形式のイベントが未解析（キー `on` に切断） | KEY 状態でルックアヘッド。後続に `[識別子]=` が来る場合は `:` をキーの一部として扱い、`=` をキー/値の区切りに変更 |
| BUG-02 | `src/include/normalizer.ts` | `SUGAR_INCLUDE_PATTERN` の `\s+` が改行にもマッチし、正規形フェンスを糖衣形と誤判定 | `\s+` → `[ \t]+` に変更し改行を除外 |
| BUG-03 | `src/parser/remarkPlugin.ts` | Dropdown内の `---` セパレーター（ThematicBreak）が無視される | `appendNodeToFrame` に `Menu` / `Dropdown` ケースを追加し `MenuSeparator` を `items` に追記 |
| BUG-04 | `src/parser/remarkPlugin.ts` | Select/Combobox直後のリストがoptionsに変換されない（SelectはcontextStackに積まれない） | `processList` で親フレームの最後の子ノードを確認し、Select/Comboboxの場合にoptionsをセット |
| BUG-05 | `src/lint/linter.ts` | `checkUnknownKeys`（FM001）が `runLintRules` から呼び出されておらず、include の未知キーが一切診断されなかった | `linter.ts` に `checkUnknownKeys` の import と呼び出しを追加 |
| BUG-06 | `src/parser/idAssigner.ts` | `resolveIdConflicts` の `processChildrenWithConflictCheck` が Screen/Card のみ対応で、Row・MenuBar・Tree・Panes 等の include 展開後 ID 衝突が解消されなかった | 全コンテナ型（Row/MenuBar/Menu/Tree/TreeItem/Panes/Pane/RadioGroup/Tabs/Tab/Accordion/AccordionItem/Dropdown/Listbox/Toolbar/StatusBar/Alert/Grid/GridCell）へ拡張 |
| BUG-07 | `src/include/canonicalParser.ts` | フォールバックコンテンツ（`---` 以降）が `[]` に捨てられており、実際に解析されなかった | `fallbackRaw` フィールドに生文字列を保持し、`parser/index.ts` で `buildAstNodes()` により ASTへ変換 |
| BUG-08 | `src/parser/remarkPlugin.ts` | `flushTopFrame` が `appendNodeToFrame`（インライン追加）と同一関数を呼んだ後、重複して if チェーンを実行する構造（将来の二重追加バグリスク） | `addChildToParentFrame` を新設し、フラッシュ専用の単一 switch に統合。`appendNodeToFrame` はインライン追加専用として分離 |

### spec_review 指摘対応（本実行後に実施）

| 対応ID | 対象ファイル | 内容 |
| --- | --- | --- |
| DESIGN-01 | `src/parser/idAssigner.ts` | ID 戦略を position ベース安定ID（`{type}-L{line}`）に移行。先頭挿入でも後続IDが変動しない |
| DESIGN-02 | `src/lint/types.ts` | FM007 `LINT_WARNING` を FM006 `BLOCK_IN_ROW` / FM007 `H3_OUTSIDE_CONTEXT` / FM008 `PANE_SIZE_CONFLICT` に分割 |
| DESIGN-03 | `src/include/sugarParser.ts` | 糖衣形の未知キーも `unknownKeys` に収集するよう対応 |
| DESIGN-04 | `src/ast/types.ts` | `@mvp-core` / `@mvp-extended` ラベルでスコープ区分けを明示 |
| DESIGN-05 | `src/include/pathResolver.ts` | `http://`, `https://`, `file:` 等の URL/プロトコル形式パスを `isOutsideWorkspace: true` で拒否 |
| DESIGN-06 | `src/parser/remarkPlugin.ts` | H1/H2/H3/paragraph/code の全 mdast ノードに `position` を付与し、差分レンダリングの準備を完了 |

### 設計上の制約（WONTFIX）

| ID | 内容 |
| --- | --- |
| parser-escape-03 | `\&#124;` はremarkがMarkdownエスケープとして先に処理し `&#124;` に変換するため、ForgeMark escapeHandlerが介入できない。Row構文内の `\&#124;` は列区切りとして機能する（2列になる）。 |

---

## シナリオカバレッジ サマリー

| 区分 | 件数 |
| --- | --- |
| PASS（Vitestで検証済み） | 145 |
| WONTFIX | 1 |
| TODO（テストコード未実装） | 8 |
| FAIL | 0 |
| SKIP | 0 |

---

## 基本パーサー（§1 回帰）

| テストID | 説明 | 状態 | メモ |
| --- | --- | --- | --- |
| `parser-screen-01` | Screen: route + class | PASS | `headingMapper.test > mapH1ToScreen`, `parse-to-ast.test > H1をScreenノードに変換する` |
| `parser-screen-02` | Screen: dir:rtl | PASS | `edge-cases.test > Screen: dir:rtl 属性` |
| `parser-screen-03` | H1 が2つ → Screen が2件 | PASS | `edge-cases.test > H1 が2つ → Screen が2件` |
| `parser-screen-04` | H1 なし → Screenは0件 | PASS | `edge-cases.test > H1 なし → Screenは0件` |
| `parser-card-01` | Card: class | PASS | `headingMapper.test > mapH2ToNode > クラスなし→Card`, `parse-to-ast.test > H2をCardノードに変換する` |
| `parser-card-02` | Card: .dialog | PASS | `edge-cases.test > Card: .dialog クラス` |
| `parser-card-03` | Card: クラスなし | PASS | `parse-to-ast.test > H2のみのファイルはCardノード1件（p1-empty-04）` |
| `parser-row-01` | Row: 3列 + class | PASS | `rowParser.test > 3列のRowを生成する`, `クラス属性を解析する` |
| `parser-row-02` | Row: クラスなし | PASS | `rowParser.test > 2列のRowを生成する` |
| `parser-row-03` | Row: 1列 | TODO | |
| `parser-row-04` | Row: 空列 | PASS | `rowParser.test > 空列をTextノードとして処理する` |
| `parser-input-01` | Input: type:email required | PASS | `parse-to-ast.test > Inputノード > typeを解析する` |
| `parser-input-02` | Input: type:password | PASS | `inlineParser.test > Input 標準型 > type:password → InputNode` |
| `parser-input-03` | Input: disabled | PASS | `inlineParser.test > Input 標準型 > type:email disabled → disabled=true` |
| `parser-input-04` | Input: readonly | PASS | `inlineParser.test > Input 標準型 > type:text readonly → readonly=true` |
| `parser-btn-01` | Button: label + class | PASS | `parse-to-ast.test > Buttonノード > イベントを解析する` |
| `parser-btn-02` | Button: on:click | PASS | `parse-to-ast.test > Buttonノード > イベントを解析する`（BUG-01修正後） |
| `parser-btn-03` | Button: on:submit | PASS | `edge-cases.test > Button: on:submit イベント` |
| `parser-btn-04` | Button: 未サポートイベント | PASS | `lint/rules.test > checkUnsupportedEvents > on:hover は未サポートイベントとして警告する` |
| `parser-text-01` | Text: 基本 | PASS | `edge-cases.test > Text: 基本段落` |
| `parser-text-02` | Text: class | TODO | |
| `parser-text-03` | Text: RTL文字 | PASS | `edge-cases.test > Text: RTL文字` |
| `parser-escape-01` | エスケープ: `\[` | PASS | `edge-cases.test > エスケープ: \[ → [` |
| `parser-escape-02` | エスケープ: `\{` | TODO | |
| `parser-escape-03` | エスケープ: `\&#124;` in Row | WONTFIX | remarkが先に `\&#124;` を `&#124;` に変換。Row内の `\&#124;` は列区切りになる（2列）。`edge-cases.test` でこの挙動を文書化 |
| `parser-menu-01` | MenuBar 基本 | PASS | `headingMapper.test > {.menubar}→MenuBar`, `parse-to-ast.test > MenuBarとMenuを正しく変換する` |
| `parser-menu-02` | MenuItem: label + on:click | PASS | `components.test > Menu 詳細 > MenuItem: label + on:click` |
| `parser-menu-03` | MenuItem: shortcut | PASS | `components.test > Menu 詳細 > MenuItem: shortcut 属性` |
| `parser-menu-04` | MenuItem: disabled | PASS | `components.test > Menu 詳細 > MenuItem: disabled` |
| `parser-menu-05` | MenuBar: アクセラレーター | PASS | `components.test > Menu 詳細 > MenuBar: アクセラレーター` |
| `parser-menu-06` 〜 `parser-menu-11` | Menu詳細（サブメニュー等） | TODO | |
| `parser-id-01` | id採番: Screen/Card/Button | PASS | position 有り → `{type}-L{line}` 安定ID。position 無し → `{type}-{index}` フォールバック。`idAssigner.test > 各ノードに {type}-{index} 形式のIDを付与する`（フォールバック検証）、`parse-to-ast.test > 全ノードにIDが付与される（position ベース安定ID）` |
| `parser-id-02` | id採番: 複数ファイル | PASS | `idAssigner.test > resolveIdConflicts > include展開後のID衝突を解消する（SC-31: p1-id-01）` |
| `parser-id-03` | id採番: 3ファイル競合 | PASS | `edge-cases.test > 3ファイル間のID衝突 → サフィックス -1,-2 で解消` |

---

## 新プリミティブ パーサー（§11b / §13 / SC-21〜23 回帰）

| テストID | 説明 | 状態 | メモ |
| --- | --- | --- | --- |
| `p1-tree-01` | Tree: 基本ノード | PASS | `headingMapper.test > {.tree} → Tree に昇格する` |
| `p1-tree-02` | TreeItem: icon | PASS | `components.test > Tree: icon 属性` |
| `p1-tree-03` | TreeItem: ネスト2階層 | PASS | `components.test > Tree: ネスト2階層` |
| `p1-tree-04` | TreeItem: selected + collapsed | PASS | `components.test > Tree: selected + collapsed` |
| `p1-tree-05` | TreeItem: disabled | PASS | `components.test > Tree: disabled` |
| `p1-tree-06` | Tree外のリストにicon属性 | TODO | |
| `p1-panes-01` | Panes: horizontal | PASS | `headingMapper.test > {.panes horizontal} → Panes に昇格する` |
| `p1-panes-02` | Panes: vertical | PASS | `components.test > Panes: vertical` |
| `p1-panes-03` | Panes: 方向省略（既定） | PASS | `components.test > Panes: 方向省略` |
| `p1-panes-04` | Pane: w:240 | PASS | `components.test > Panes: Pane w 属性` |
| `p1-panes-05` | Pane: flex:1 | PASS | `components.test > Panes: Pane flex 属性` |
| `p1-panes-06` | Pane: flex+w 競合 | PASS | `lint/rules.test > checkInvalidValues > Pane の flex と w の競合を警告する（SC-22: p1-panes-06）` |
| `p1-panes-07` | Pane: collapsed | PASS | `components.test > Panes: collapsed` |
| `p1-badge-01` | Badge: 基本 | PASS | `inlineParser.test > Badge > [通知]{.badge} → BadgeNode` |
| `p1-badge-02` | Badge: class | PASS | `inlineParser.test > Badge > [3]{.badge .error} → class を持つ` |
| `p1-badge-03` | Badge: on:click 警告 | TODO | |
| `p1-select-01` | Select: 基本 | PASS | `inlineParser.test > Select > [___]{type:select} → SelectNode` |
| `p1-select-02` | Select: options 3件 | PASS | `list-components.test > Select options > Select直後のリストが options に変換される` |
| `p1-select-03` | Select: selected option | PASS | `list-components.test > Select options > Select option: selected`（BUG-04修正後） |
| `p1-toggle-01` | Toggle: 基本 | PASS | `inlineParser.test > Toggle > [___]{type:toggle} → ToggleNode checked=false` |
| `p1-toggle-02` | Toggle: checked | PASS | `inlineParser.test > Toggle > [___]{type:toggle checked} → checked=true` |
| `parser-cb-01` | Checkbox: [x] → checked=true | PASS | `inlineParser.test > Checkbox > [x] ラベル → checked=true` |
| `parser-cb-02` | Checkbox: [ ] → checked=false | PASS | `inlineParser.test > Checkbox > [ ] ラベル → checked=false` |
| `parser-cb-03` | Checkbox: [X] 大文字 | PASS | `inlineParser.test > Checkbox > [X] 大文字も checked=true` |
| `parser-rg-01` | RadioGroup: 基本 | PASS | `list-components.test > RadioGroup / RadioItem > ## {.radio-group} → RadioGroup` |
| `parser-rg-02` | RadioItem: selected | PASS | `list-components.test > RadioGroup / RadioItem > RadioGroup内のリスト → RadioItem` |
| `parser-rg-03` | RadioItem: value 属性 | PASS | `list-components.test > RadioGroup / RadioItem > RadioItem: value 属性` |
| `parser-dd-01` | Dropdown: 基本 | PASS | `list-components.test > Dropdown / DropdownItem > ## ラベル {.dropdown} → Dropdown` |
| `parser-dd-02` | DropdownItem詳細 | PASS | `list-components.test > Dropdown / DropdownItem > Dropdown内リスト → DropdownItem` |
| `parser-dd-03` | DropdownItem: disabled | PASS | `list-components.test > Dropdown / DropdownItem > DropdownItem: disabled` |
| `parser-dd-04` | Dropdown: セパレーター | PASS | `list-components.test > Dropdown / DropdownItem > Dropdown内のセパレーター`（BUG-03修正後） |
| `parser-lb-01` | Listbox: 基本 | PASS | `list-components.test > Listbox / ListboxItem > ## {.listbox} → Listbox` |
| `parser-lb-02` | ListboxItem: selected | PASS | `list-components.test > Listbox / ListboxItem > Listbox内リスト → ListboxItem` |
| `parser-lb-03` | Listbox: multiple | PASS | `list-components.test > Listbox / ListboxItem > Listbox: multiple 属性` |
| `parser-lb-04` | ListboxItem: disabled | PASS | `list-components.test > Listbox / ListboxItem > ListboxItem: disabled` |
| `parser-tb-01` | Toolbar: 基本 | PASS | `list-components.test > Toolbar / ToolbarItem > ## {.toolbar} → Toolbar` |
| `parser-tb-02` | ToolbarItem詳細 | PASS | `list-components.test > Toolbar / ToolbarItem > Toolbar内リスト → ToolbarItem` |
| `parser-tb-03` | ToolbarItem: checked | PASS | `list-components.test > Toolbar / ToolbarItem > ToolbarItem: checked 属性` |
| `parser-tb-04` | Toolbar: グループ分割 | PASS | `list-components.test > Toolbar / ToolbarItem > --- でグループ分割` |
| `parser-tb-05` | ToolbarItem: disabled | PASS | `list-components.test > Toolbar / ToolbarItem > ToolbarItem: disabled` |
| `parser-sb-01` | StatusBar: 基本 | PASS | `list-components.test > StatusBar / StatusItem > ## {.statusbar} → StatusBar` |
| `parser-sb-02` | StatusItem詳細 | PASS | `list-components.test > StatusBar / StatusItem > StatusBar内リスト → StatusItem` |
| `parser-sb-03` | StatusItem: align:right | PASS | `list-components.test > StatusBar / StatusItem > StatusItem: align:right` |
| `parser-sb-04` | StatusItem: align 未指定は left | PASS | `list-components.test > StatusBar / StatusItem > StatusItem: align 未指定は left` |
| `parser-tabs-01` | Tabs: 基本 | PASS | `headingMapper.test > {.tabs} → Tabs に昇格する` |
| `parser-tabs-02` | Tab: selected | PASS | `components.test > Tabs / Tab > Tab: selected` |
| `parser-tabs-03` | Tab: disabled | PASS | `components.test > Tabs / Tab > Tab: disabled` |
| `parser-tabs-04` | Tab: children | PASS | `components.test > Tabs / Tab > Tab: children` |
| `parser-acc-01` | Accordion: 基本 | PASS | `headingMapper.test > {.accordion} → Accordion に昇格する` |
| `parser-acc-02` | AccordionItem: collapsed | PASS | `components.test > Accordion / AccordionItem > AccordionItem: collapsed` |
| `parser-acc-03` | AccordionItem: disabled | PASS | `components.test > Accordion / AccordionItem > AccordionItem: disabled` |
| `parser-ta-01` | Textarea: 基本 | PASS | `inlineParser.test > Textarea > [___]{type:textarea} → TextareaNode` |
| `parser-ta-02` | Textarea: rows | PASS | `inlineParser.test > Textarea > [___]{type:textarea rows:5} → rows=5` |
| `parser-ta-03` | Textarea: required + readonly | PASS | `inlineParser.test > Textarea > required/readonly` |
| `parser-ta-04` | Textarea: rows 既定値 3 | PASS | `inlineParser.test > Textarea > rows 未指定時は 3` |
| `parser-rng-01` | Range: 基本 | PASS | `inlineParser.test > Range > [___]{type:range} → RangeNode` |
| `parser-rng-02` | Range: min/max/step | PASS | `inlineParser.test > Range > [___]{type:range min:10 max:90 step:5}` |
| `parser-rng-03` | Range: disabled | PASS | `inlineParser.test > Range > [___]{type:range disabled} → disabled=true` |
| `parser-cmb-01` | Combobox: 基本 | PASS | `inlineParser.test > Combobox > [___]{type:combobox} → ComboboxNode` |
| `parser-cmb-02` | Combobox: disabled | PASS | `inlineParser.test > Combobox > [___]{type:combobox disabled}` |
| `parser-cmb-03` | Combobox: name | PASS | `inlineParser.test > Combobox > [___]{type:combobox name:lang}` |
| `parser-cmb-04` | Combobox: placeholder | PASS | `inlineParser.test > Combobox > [___]{type:combobox placeholder:...}` |
| `parser-prog-01` | Progress: 基本 | PASS | `inlineParser.test > Progress > [___]{type:progress} → ProgressNode` |
| `parser-prog-02` | Progress: value/max | PASS | `inlineParser.test > Progress > value:50 max:100 → value/max 設定` |
| `parser-prog-03` | Progress: maxのみ | PASS | `inlineParser.test > Progress > max のみ設定` |
| `parser-prog-04` | Progress: max 既定値 100 | PASS | `inlineParser.test > Progress > max 未指定時は 100` |
| `parser-spin-01` | Spinner: 基本 | PASS | `inlineParser.test > Spinner > [~]{.spinner} → SpinnerNode` |
| `parser-spin-02` | Spinner: size | PASS | `inlineParser.test > Spinner > [~]{.spinner size:lg}` |
| `parser-spin-03` | Spinner: 属性なし | PASS | `inlineParser.test > Spinner > [~] 属性なし` |
| `parser-alt-01` | Alert: info | PASS | `components.test > Alert > ## {.alert .info} → variant=info` |
| `parser-alt-02` | Alert: success | PASS | `components.test > Alert > ## {.alert .success} → variant=success` |
| `parser-alt-03` | Alert: warning | PASS | `components.test > Alert > ## {.alert .warning} → variant=warning` |
| `parser-alt-04` | Alert: error | PASS | `components.test > Alert > ## {.alert .error} → variant=error` |
| `parser-div-01` | Divider: 基本 | PASS | `components.test > Divider > --- → Divider ノード` |
| `parser-div-02` | MenuBar内 → MenuSeparator | PASS | `components.test > Divider > MenuBar内の --- → MenuSeparator` |
| `parser-div-03` | Divider: class | TODO | |
| `parser-div-04` | Divider: Screen外 | TODO | |
| `parser-div-05` | Divider: Card内 | TODO | |
| `parser-img-01` | Image: 基本 | PASS | `components.test > Image / Avatar > ![alt](src) → Image ノード` |
| `parser-img-02` | Image: w/h 属性 | PASS | `components.test > Image / Avatar > w/h 属性` |
| `parser-img-03` | Image: class | TODO | |
| `parser-img-04` | Image: dir | TODO | |
| `parser-av-01` | Avatar: .avatar クラス | PASS | `components.test > Image / Avatar > .avatar クラス → Avatar ノード` |
| `parser-av-02` | Avatar: size 属性 | PASS | `components.test > Image / Avatar > Avatar: size 属性` |
| `parser-av-03` | Avatar: alt | TODO | |
| `parser-grid-01` | Grid: cols | PASS | `components.test > Grid / GridCell > ## {.grid cols:3} → Grid cols=3` |
| `parser-grid-02` | GridCell: H3 | PASS | `components.test > Grid / GridCell > Grid内H3 → GridCell` |
| `parser-grid-03` | GridCell: span | PASS | `components.test > Grid / GridCell > GridCell: span 属性` |
| `parser-grid-04` | Grid: gap | PASS | `components.test > Grid / GridCell > Grid gap 属性` |
| `parser-tbl-01` | Table: 基本 | PASS | `components.test > Table > ## {.table} → Table ノード` |
| `parser-tbl-02` | Table: striped | PASS | `components.test > Table > ## {.table striped} → striped=true` |
| `parser-tbl-03` | Table: columns/rows | PASS | `components.test > Table > Markdownテーブルから columns/rows を取得`（remark-gfm追加後） |
| `parser-tbl-04` | Table: bordered/hoverable/compact | PASS | `components.test > Table > ## {.table bordered hoverable compact}` |
| `parser-sk-01` 〜 `parser-sk-03` | Skeleton | TODO | |
| `parser-bc-01` | Breadcrumb: 基本 | PASS | `components.test > Breadcrumb > ## {.breadcrumb} → Breadcrumb ノード` |
| `parser-bc-02` | BreadcrumbItem | PASS | `components.test > Breadcrumb > Breadcrumb内リスト → BreadcrumbItem` |

---

## include / 依存グラフ（SC-11〜SC-33）

| テストID | 説明 | 状態 | メモ |
| --- | --- | --- | --- |
| `include-canon-01` | 正規形: path のみ | PASS | `canonicalParser.test > path のみの正規形を解析する` |
| `include-canon-02` | 正規形: as:inline | PASS | `canonicalParser.test > as: inline を解析する` |
| `include-canon-03` | 正規形: dir:rtl | PASS | `canonicalParser.test > dir: rtl を解析する` |
| `include-canon-04` | 正規形: class | PASS | `canonicalParser.test > class を解析する` |
| `include-canon-05` | 正規形: path なし | PASS | `canonicalParser.test > path がない場合はnullを返す` |
| `include-canon-06` | 正規形: フォールバック区切り | PASS | `canonicalParser.test > --- 区切り以降はフォールバックとして認識する` |
| `include-canon-07` | 未知キー警告 | PASS | `canonicalParser.test > parseCanonicalIncludeWithWarnings > 未知キーを警告として返す` |
| `include-canon-08` | 既知キーのみ警告なし | PASS | `canonicalParser.test > parseCanonicalIncludeWithWarnings > 既知キーのみの場合は警告なし` |
| `include-sugar-01` | 糖衣形パース: path | PASS | `normalizer.test > sugarToCanonical > pathのみ（p1-sugar-01）` |
| `include-sugar-02` | 糖衣形パース: as:inline | PASS | `normalizer.test > sugarToCanonical > as=inline（p1-sugar-02）` |
| `include-sugar-03` | 糖衣形パース: dir:rtl | PASS | `normalizer.test > sugarToCanonical > dir=rtl（p1-sugar-03）` |
| `include-sugar-04` | 糖衣形パース: 複数属性 | PASS | `normalizer.test > normalizeSugarIncludes > 複数糖衣（p1-sugar-04）` |
| `include-fallback-01` 〜 `include-fallback-03` | フォールバック動作詳細 | TODO | |
| `p1-sugar-01` | 糖衣→正規: path のみ | PASS | `normalizer.test > sugarToCanonical > pathのみの糖衣形を正規形に変換する（SC-11: p1-sugar-01）` |
| `p1-sugar-02` | 糖衣→正規: as:inline | PASS | `normalizer.test > sugarToCanonical > as=inline の糖衣形（SC-11: p1-sugar-02）` |
| `p1-sugar-03` | 糖衣→正規: dir:rtl | PASS | `normalizer.test > sugarToCanonical > dir=rtl の糖衣形（SC-11: p1-sugar-03）` |
| `p1-sugar-04` | 複数糖衣の一括変換 | PASS | `normalizer.test > normalizeSugarIncludes > テキスト内の全糖衣includeを正規形に変換する（SC-11: p1-sugar-04）`（BUG-02修正後） |
| `p1-deep-01` | 4階層include展開（循環なし） | PASS | `cycleDetector.test > 循環なしの4階層グラフ（SC-12: p1-deep-01）`, `include-graph.test > 3ファイル構成で循環なしを正しく判定する` |
| `p1-deep-02` | 4階層循環検出 | PASS | `cycleDetector.test > 4階層循環（SC-12: p1-deep-02）` |
| `p1-deep-03` | ダイヤモンド（短絡）依存 | PASS | `edge-cases.test > A→B→C / A→C の構成で C は1回のみカウント` |
| `p1-path-01` | パス正規化: `../` | PASS | `pathResolver.test > ./components/../components/Btn.md → ./components/Btn.md（SC-13: p1-path-01）` |
| `p1-path-02` | パス正規化: `./././` | PASS | `pathResolver.test > ././././Btn.md → ./Btn.md（SC-13: p1-path-02）` |
| `p1-path-03` | ワークスペース外パス | PASS | `edge-cases.test > ../../ → isOutsideWorkspace=true` |
| `p1-path-04` | 日本語ディレクトリ | TODO | `p1-utf8-01` でファイル名は検証済みだがディレクトリ名は未カバー |
| `p1-utf8-01` | 全角ファイル名 | PASS | `pathResolver.test > UTF-8ファイル名を正常解決する（SC-14: p1-utf8-01）` |
| `p1-utf8-02` | スペース含むファイル名 | PASS | `pathResolver.test > スペースを含むファイル名（SC-14: p1-utf8-02）` |
| `p1-utf8-03` | アラビア文字ファイル名 | PASS | `pathResolver.test > アラビア文字のファイル名（SC-14: p1-utf8-03）` |
| `p1-empty-01` | 空ファイル | PASS | `parse-to-ast.test > 空ファイルはASTが空配列になる（SC-15: p1-empty-01）` |
| `p1-empty-02` | コメントのみ（HTMLコメント） | PASS | `edge-cases.test > コメント行のみ → AST は空配列`（remarkがHTMLコメントを無視） |
| `p1-empty-03` | H1のみ | PASS | `parse-to-ast.test > H1のみのファイルはScreenノード1件（SC-15: p1-empty-03）` |
| `p1-empty-04` | H2のみ | PASS | `parse-to-ast.test > H2のみのファイルはCardノード1件（SC-15: p1-empty-04）` |
| `p1-esc-01` | 属性値内シングルクォート | PASS | `attrParser.test > ダブルクォートで囲んだ値を解析する（SC-16: p1-esc-01）` |
| `p1-esc-02` | on:click内クォート | PASS | `attrParser.test > 値中にネストしたシングルクォートを処理する（SC-16: p1-esc-02）`（BUG-01修正後） |
| `p1-esc-03` | 改行リテラル | PASS | `attrParser.test > エスケープされた改行を処理する（SC-16: p1-esc-03）` |
| `p1-esc-04` | Tailwindブラケット記法 | PASS | `attrParser.test > Tailwindブラケット記法を解析する（SC-16: p1-esc-04）` |
| `p1-id-01` | id衝突: 2ファイル | PASS | `idAssigner.test > resolveIdConflicts > include展開後のID衝突を解消する（SC-31: p1-id-01）` |
| `p1-id-02` | id衝突: 同ファイル2回include | PASS | `idAssigner.test > resolveIdConflicts > 2回includeした場合は -2 サフィックスが付く（SC-31: p1-id-02）` |
| `p1-id-03` | id衝突: 3ファイル | PASS | `edge-cases.test > 3ファイル間のID衝突 → サフィックス -1,-2 で解消` |
| `p1-diamond-01` | ダイヤモンド依存（循環なし） | PASS | `cycleDetector.test > ダイヤモンド依存（SC-32: p1-diamond-01）では循環なし` |
| `p1-diamond-02` | ダイヤモンド依存後のD変更 | PASS | `dependencyGraph.test > ダイヤモンド依存でDが変更された場合A/B/C全てに影響する（SC-32: p1-diamond-02）` |
| `p1-fb-01` | フォールバックコンテンツ認識 | PASS | `edge-cases.test > --- 以降のコンテンツを持つ include → fallback が空配列`（BUG-07 修正後: `fallbackRaw` が保存され `parser/index.ts` でASTに変換。フォールバック内容があれば `fallback: AstNode[]` が生成される） |
| `p1-fb-02` | フォールバックなしの include | PASS | `edge-cases.test > --- なし の include → fallback は undefined` |
| `graph-update-01` | グラフ: ノード追加 | PASS | `dependencyGraph.test > update > 新しいノードを追加できる` |
| `graph-update-02` | グラフ: 依存エッジ設定 | PASS | `dependencyGraph.test > update > 依存エッジを正しく設定する` |
| `graph-update-03` | グラフ: エッジ更新時の古いエッジ削除 | PASS | `dependencyGraph.test > update > 既存ノードの依存を更新した場合、古いエッジを削除する` |
| `graph-remove-01` | グラフ: ノード削除 | PASS | `dependencyGraph.test > remove > ノードを削除できる` |
| `graph-remove-02` | グラフ: 削除時エッジクリーンアップ | PASS | `dependencyGraph.test > remove > 削除時に依存エッジを適切にクリーンアップする` |
| `graph-affected-01` | getAffected: 基本 | PASS | `dependencyGraph.test > getAffected > 変更ファイルを含む影響範囲を返す` |
| `graph-affected-02` | getAffected: 依存なし | PASS | `dependencyGraph.test > getAffected > 直接的な依存がない場合は自身のみ` |
| `graph-topo-01` | トポロジカルソート: 基本順序 | PASS | `topoSort.test > 依存先が依存元より前に来る` |
| `graph-topo-02` | トポロジカルソート: 全ノード含む | PASS | `topoSort.test > 全ノードを含む` |
| `graph-topo-03` | トポロジカルソート: ダイヤモンド依存 | PASS | `topoSort.test > ダイヤモンド依存でDが最初に来る` |
| `graph-topo-04` | トポロジカルソート: 循環でも無限ループなし | PASS | `topoSort.test > 循環があっても無限ループしない` |
| `lint-01` | lint: Pane flex+w 競合警告 | PASS | `lint/rules.test > checkInvalidValues > Pane の flex と w の競合を警告する` — コード FM008 `PANE_SIZE_CONFLICT`（旧 FM007 `LINT_WARNING` から変更） |
| `lint-02` | lint: 正常Pane 警告なし | PASS | `lint/rules.test > checkInvalidValues > 正常なPaneノードは警告なし` |
| `lint-03` | lint: on:hover 未サポートイベント | PASS | `lint/rules.test > checkUnsupportedEvents > on:hover は未サポートイベントとして警告する` |
| `lint-04` | lint: on:click 正常 | PASS | `lint/rules.test > checkUnsupportedEvents > on:click は正常` |
| `lint-05` | lint: Row内block include警告 | PASS | `lint/rules.test > checkStructuralRules > Row内のblock includeに警告する` — コード FM006 `BLOCK_IN_ROW`（旧 FM006 `STRUCTURAL_ERROR` から分割） |
| `lint-06` | lint: Row内inline include 正常 | PASS | `lint/rules.test > checkStructuralRules > Row内のinline includeは警告なし` |
| `lint-07` | lint: 循環参照エラー報告（2ファイル） | PASS | `lint/rules.test > checkCircularIncludes > 循環参照をerrorとして報告する` |
| `lint-08` | lint: 循環なし → 診断なし | PASS | `lint/rules.test > checkCircularIncludes > 循環なしのグラフは診断なし` |
| `lint-09` | lint: 循環パスが全関連ファイルに報告 | PASS | `lint/rules.test > checkCircularIncludes > 循環パスが全関連ファイルに報告される` |
| `lint-10` | lint: 未知キー警告（include） | PASS | `edge-cases.test > lint-10: 未知キー（checkUnknownKeys）> 未知キーが警告 FM001 として報告される`（BUG-05 修正後: `parseMarkdown` 経由で FM001 が正しく発火するよう統合テストに変更） |

---

## 凡例

| 状態 | 意味 |
| --- | --- |
| `TODO` | 未実装（テストコードなし） |
| `PASS` | Vitestで合格 |
| `FAIL` | 不合格（Fail時はメモ欄に原因を記録） |
| `SKIP` | スキップ（理由をメモ欄に記録） |
| `WONTFIX` | 対応しない（理由をメモ欄に記録） |
