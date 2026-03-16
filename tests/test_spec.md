# ForgeMark — テスト仕様書

最終更新: 2026-03-16 (JST)

---

## 0. 概要

### テスト戦略

```text
E2E テスト（少数・重要フロー）
      ↑
統合テスト（モジュール間境界）
      ↑
ユニットテスト（関数・クラス単位）← 主力
```

- **ユニットテスト**：パーサ・AST変換・コード生成の各関数を単体で検証する。
- **統合テスト**：パーサ→レンダラ、include解析→依存グラフ など複数モジュールをまたぐ動作を検証する。
- **E2Eテスト**：VS Code Extension Test Runner を用いて実拡張の起動・プレビュー・コード生成を検証する。

### カバレッジ目標

| 対象 | ライン カバレッジ |
| --- | --- |
| パーサ（`src/parser/`） | 90% 以上 |
| コード生成（`src/codegen/`） | 85% 以上 |
| IDE機能（`src/extension/`） | 70% 以上（E2E で補完） |

### テストフレームワーク

| 用途 | ツール |
| --- | --- |
| ユニット・統合 | [Vitest](https://vitest.dev) |
| VS Code E2E | [@vscode/test-electron](https://github.com/microsoft/vscode-test) |
| スナップショット | Vitest 組み込み |

### ファイル構成

```text
tests/
├─ test_spec.md          # 本ファイル（テスト仕様）
├─ unit/
│   ├─ parser/           # パーサ単体テスト
│   ├─ ast/              # AST変換テスト
│   ├─ codegen/          # コード生成テスト
│   └─ lint/             # リントルールテスト
├─ integration/
│   ├─ include/          # include解析・依存グラフ統合テスト
│   └─ render/           # パーサ→レンダラ統合テスト
├─ e2e/                  # VS Code E2Eテスト
└─ fixtures/             # テスト用mdファイル・期待値スナップショット
    ├─ valid/
    ├─ invalid/
    └─ snapshots/
```

---

## 1. ユニットテスト：パーサ

### 1.1 Screen 構文

| テストID | 入力 | 期待結果 |
| --- | --- | --- |
| `parser-screen-01` | `# /login {.screen .desktop}` | Screen ノード: `{ route: "/login", class: ["screen", "desktop"] }` |
| `parser-screen-02` | `# / {.screen dir:rtl}` | Screen ノード: `{ route: "/", dir: "rtl" }` |
| `parser-screen-03` | H1 が2つあるファイル | 先頭のみ Screen、2つ目は警告 `Only one H1 per file is allowed` |
| `parser-screen-04` | H1 なしのファイル | Screen ノードなし、警告なし（include先として有効） |

### 1.2 Card 構文

| テストID | 入力 | 期待結果 |
| --- | --- | --- |
| `parser-card-01` | `## ログイン {.card .w-400}` | Card ノード: `{ class: ["card", "w-400"] }` |
| `parser-card-02` | `## ダイアログ {.dialog}` | Card ノード: `{ class: ["dialog"] }` |
| `parser-card-03` | `## テキストのみ` | Card ノード: `{ class: [] }` |

### 1.3 Row 構文

| テストID | 入力 | 期待結果 |
| --- | --- | --- |
| `parser-row-01` | `[[ A \| B \| C ]]{.row}` | Row ノード: `{ columns: [Text("A"), Text("B"), Text("C")], class: ["row"] }` |
| `parser-row-02` | `[[ A \| B ]]` | Row ノード: クラスなし |
| `parser-row-03` | `[[ A ]]` | Row ノード: 列1つ |
| `parser-row-04` | `[[ \| ]]` | Row ノード: 空列2つ |

### 1.4 Input 構文

| テストID | 入力 | 期待結果 |
| --- | --- | --- |
| `parser-input-01` | `[________________]{type:email required}` | Input: `{ inputType: "email", required: true }` |
| `parser-input-02` | `[____]{type:password placeholder:"パスワード"}` | Input: `{ inputType: "password", placeholder: "パスワード" }` |
| `parser-input-03` | `[____]{disabled}` | Input: `{ disabled: true }` |
| `parser-input-04` | `[____]{type:unknown}` | Input: 警告 `Invalid value 'unknown' for key 'type'` |

### 1.5 Button 構文

| テストID | 入力 | 期待結果 |
| --- | --- | --- |
| `parser-btn-01` | `[サインイン]{.btn .primary}` | Button: `{ label: "サインイン", class: ["btn", "primary"] }` |
| `parser-btn-02` | `[OK]{.btn on:click="dlg.close('ok')"}` | Button: `{ events: { "on:click": "dlg.close('ok')" } }` |
| `parser-btn-03` | `[送信]{.btn on:submit="form.submit()"}` | Button: events に `on:submit` |
| `parser-btn-04` | `[X]{.btn on:hover="foo()"}` | Button + 警告 `Unsupported event 'on:hover'` |

### 1.6 Text 構文

| テストID | 入力 | 期待結果 |
| --- | --- | --- |
| `parser-text-01` | `本文テキストです。` | Text: `{ content: "本文テキストです。", class: [] }` |
| `parser-text-02` | `説明文{.text-sm .muted}` | Text: `{ class: ["text-sm", "muted"] }` |
| `parser-text-03` | RTL文字列 `مرحبا` | Text: `{ content: "مرحبا" }`（dir は親から継承） |

### 1.7 エスケープ

| テストID | 入力 | 期待結果 |
| --- | --- | --- |
| `parser-escape-01` | `\[テキスト\]` | Text: `{ content: "[テキスト]" }` |
| `parser-escape-02` | `\{.class\}` | Text: `{ content: "{.class}" }` |
| `parser-escape-03` | `[[ A \\\| B ]]` | Row 列: `["A |", "B"]` （`\|` はリテラルパイプ） |

### 1.8 MenuBar / Menu / MenuItem 構文

| テストID | 入力 | 期待結果 |
| --- | --- | --- |
| `parser-menu-01` | `## メニュー {.menubar}` | MenuBar ノード: `{ class: ["menubar"], menus: [] }` |
| `parser-menu-02` | `### &File` （MenuBar 直下） | Menu ノード: `{ label: "File", accelerator: "F" }` |
| `parser-menu-03` | `### &Help` | Menu ノード: `{ label: "Help", accelerator: "H" }` |
| `parser-menu-04` | `### メニュー`（`&` なし） | Menu ノード: `{ label: "メニュー", accelerator: undefined }` |
| `parser-menu-05` | `- [新規作成]{on:click="file.new()" shortcut:"Ctrl+N"}` | MenuItem: `{ label: "新規作成", shortcut: "Ctrl+N", events: { "on:click": "file.new()" } }` |
| `parser-menu-06` | `- [終了]{disabled}` | MenuItem: `{ label: "終了", disabled: true }` |
| `parser-menu-07` | `---` （Menu 直下・リスト間） | MenuSeparator ノード |
| `parser-menu-08` | `---` （MenuBar 外） | 通常の thematic break（MenuSeparator にしない） |
| `parser-menu-09` | `###` が MenuBar 外にある | 警告 `H3 is only valid inside a MenuBar` |
| `parser-menu-10` | MenuItem に `{type:email}` など不正属性 | 警告 `Invalid attribute 'type' for MenuItem` |
| `parser-menu-11` | `## 通常カード`（`.menubar` なし） | 通常の Card ノード（Menu に昇格しない） |

### 1.9 id 採番

| テストID | シナリオ | 期待結果 |
| --- | --- | --- |
| `parser-id-01` | Button 3つ含むファイル | id: `button-0`, `button-1`, `button-2` |
| `parser-id-02` | Screen + Card + Text | id: `screen-0`, `card-0`, `text-0` |
| `parser-id-03` | include 展開後に id 衝突 | 後出しノードの id に `-1` サフィックスを付与 |

---

## 2. ユニットテスト：include パーサ

### 2.1 正規形の解析

| テストID | 入力 | 期待結果 |
| --- | --- | --- |
| `include-canon-01` | `path: ./foo.md` のみ | Include: `{ path: "./foo.md", as: "block", dir: "auto" }` |
| `include-canon-02` | `path: ./foo.md`, `as: inline` | Include: `{ as: "inline" }` |
| `include-canon-03` | `path: ./foo.md`, `dir: rtl` | Include: `{ dir: "rtl" }` |
| `include-canon-04` | `path: ./foo.md`, `class: .right` | Include: `{ class: ["right"] }` |
| `include-canon-05` | `path: ./foo.md`, `unknown: val` | Include + 警告 `Unknown key 'unknown'` |
| `include-canon-06` | path なし | lint エラー `path is required` |
| `include-canon-07` | `---` 以降にフォールバック記述あり | Include: `{ fallback: [Text(...)] }` |
| `include-canon-08` | `---` なし | Include: `{ fallback: undefined }` |

### 2.2 糖衣構文の解析

| テストID | 入力 | 期待結果 |
| --- | --- | --- |
| `include-sugar-01` | `` ```include path="./foo.md"``` `` | Include: `{ path: "./foo.md" }` |
| `include-sugar-02` | `` ```include path="./foo.md" as="inline"``` `` | Include: `{ as: "inline" }` |
| `include-sugar-03` | `` ```include path="./foo.md" dir="rtl"``` `` | Include: `{ dir: "rtl" }` |
| `include-sugar-04` | 保存操作トリガー | 糖衣が正規形に変換されること |

### 2.3 フォールバック動作

| テストID | シナリオ | 期待結果 |
| --- | --- | --- |
| `include-fallback-01` | path が存在しない、フォールバックあり | フォールバックコンテンツがレンダリングされる |
| `include-fallback-02` | path が存在しない、フォールバックなし | `[missing: ./path]` プレースホルダ + lint error |
| `include-fallback-03` | path が存在する | フォールバック無視、正常展開 |

---

## 3. ユニットテスト：依存グラフ・循環検出

| テストID | シナリオ | 期待結果 |
| --- | --- | --- |
| `graph-01` | A → B → C（非循環） | グラフ構築成功、循環エラーなし |
| `graph-02` | A → B → A（直接循環） | lint error: `Circular include detected: A → B → A` |
| `graph-03` | A → B → C → A（間接循環） | lint error: 3ファイルすべてのパスを報告 |
| `graph-04` | A → B, A → C（ダイヤモンド） | 循環なし、両方のパスを展開 |
| `graph-05` | ファイル変更後の再構築 | 変更分のみグラフ更新、既存エッジ保持 |
| `graph-06` | ファイル削除後の再構築 | 削除ファイルのエッジを除去、参照元に lint error |
| `graph-topo-01` | A → B → C の依存グラフ | トポロジカルソート結果: `[C, B, A]` |

---

## 4. ユニットテスト：リントルール

| テストID | ルール | 入力 | 期待 Severity |
| --- | --- | --- | --- |
| `lint-01` | 未知キー | include に `foo: bar` | Warning |
| `lint-02` | 不正値（as） | `as: column` | Error |
| `lint-03` | 不正値（dir） | `dir: top` | Error |
| `lint-04` | 不在パス | `path: ./missing.md` | Error |
| `lint-05` | 循環参照 | A→B→A | Error |
| `lint-06` | 未サポートイベント | `on:hover` | Warning |
| `lint-07` | 複数 Screen | ファイルに H1 が2つ | Warning |
| `lint-08` | block in Row | Row 内に `as: block` include | Warning |
| `lint-09` | MenuBar 外の H3 | `.menubar` なし Card 内に `###` | Warning |
| `lint-10` | MenuItem の不正属性 | MenuItem に `type:email` | Warning |

---

## 5. ユニットテスト：コード生成（next-shadcn）

### 5.1 基本マッピング

| テストID | AST ノード | 期待出力（概要） |
| --- | --- | --- |
| `gen-next-screen-01` | Screen `{ route: "/login" }` | `app/login/page.tsx` を生成 |
| `gen-next-card-01` | Card `{ class: ["card"] }` | `<Card>` コンポーネント |
| `gen-next-input-01` | Input `{ inputType: "email" }` | `<Input type="email" />` |
| `gen-next-input-02` | Input `{ required: true }` | `<Input required />` |
| `gen-next-btn-01` | Button `{ label: "OK", events: { "on:click": "dlg.close('ok')" } }` | `<Button onClick={() => handlers["dlg.close"]?.("ok")}>OK</Button>` |
| `gen-next-row-01` | Row 3列 | `<div className="flex ...">` 3列 |
| `gen-next-text-01` | Text `{ content: "説明" }` | `<p>説明</p>` |

### 5.2 スナップショットテスト

| テストID | 入力フィクスチャ | スナップショット |
| --- | --- | --- |
| `gen-next-snap-01` | `fixtures/valid/login.md` | `fixtures/snapshots/next-shadcn/login.tsx` |
| `gen-next-snap-02` | `fixtures/valid/dialog.md` | `fixtures/snapshots/next-shadcn/dialog.tsx` |
| `gen-next-snap-03` | `fixtures/valid/list.md` | `fixtures/snapshots/next-shadcn/list.tsx` |

### 5.3 MenuBar マッピング（next-shadcn）

| テストID | AST ノード | 期待出力（概要） |
| --- | --- | --- |
| `gen-next-menu-01` | MenuBar + Menu `{ label: "File" }` | `<Menubar><MenubarMenu><MenubarTrigger>File</MenubarTrigger>...` |
| `gen-next-menu-02` | MenuItem `{ shortcut: "Ctrl+N" }` | `<MenubarItem>...<MenubarShortcut>Ctrl+N</MenubarShortcut></MenubarItem>` |
| `gen-next-menu-03` | MenuItem `{ disabled: true }` | `<MenubarItem disabled>` |
| `gen-next-menu-04` | MenuSeparator | `<MenubarSeparator />` |
| `gen-next-menu-05` | MenuItem `{ accelerator: "F" }` | `MenubarTrigger` に `accessKey="f"` を付与 |

### 5.4 Unknown ノードの扱い

| テストID | シナリオ | 期待結果 |
| --- | --- | --- |
| `gen-next-unknown-01` | AST に Unknown ノード含む | `<!-- unknown node: {raw} -->` コメントを出力、生成を完遂 |

---

## 5b. ユニットテスト：コード生成 Menu（tailwind-plain / sveltekit）

| テストID | AST ノード | 期待出力（概要） |
| --- | --- | --- |
| `gen-tw-menu-01` | MenuBar + Menu + MenuItem | `<nav><ul><li>` 構造で出力 |
| `gen-tw-menu-02` | MenuItem `{ shortcut: "Ctrl+N" }` | `<kbd>Ctrl+N</kbd>` を含む |
| `gen-tw-menu-03` | MenuSeparator | `<li role="separator" />` |
| `gen-svelte-menu-01` | MenuBar + Menu | `<nav>` + `<ul>` の Svelte テンプレート |

---

## 6. ユニットテスト：コード生成（tailwind-plain）

| テストID | AST ノード | 期待出力（概要） |
| --- | --- | --- |
| `gen-tw-btn-01` | Button with `on:click` | `<button class="...">/* TODO: on:click */</button>` |
| `gen-tw-input-01` | Input email | `<input type="email" class="..." />` |
| `gen-tw-snap-01` | `fixtures/valid/login.md` | スナップショット比較 |

---

## 7. ユニットテスト：コード生成（sveltekit）

| テストID | AST ノード | 期待出力（概要） |
| --- | --- | --- |
| `gen-svelte-screen-01` | Screen `{ route: "/login" }` | `src/routes/login/+page.svelte` |
| `gen-svelte-props-01` | handlers を使う Button | `let { handlers } = $props()` を含む |
| `gen-svelte-snap-01` | `fixtures/valid/login.md` | スナップショット比較 |

---

## 8. 統合テスト：include 解析→依存グラフ

| テストID | シナリオ | 検証内容 |
| --- | --- | --- |
| `int-include-01` | 3ファイル構成（main→dialog→btn） | 依存グラフが正しく構築される |
| `int-include-02` | main→dialog→btn、btn を変更 | btn のみ再解析、main/dialog はキャッシュ利用 |
| `int-include-03` | 循環ありの構成 | 全循環ファイルに lint error が出る |
| `int-include-04` | ダイヤモンド依存（A→B, A→C, B→D, C→D） | D が2回展開されず1回のみ処理される |
| `int-include-05` | `as: inline` を含む Row の展開 | Row 内の列が正しく展開される |

---

## 9. 統合テスト：パーサ→レンダラ

| テストID | シナリオ | 検証内容 |
| --- | --- | --- |
| `int-render-01` | 有効な md を渡す | React コンポーネントがエラーなく生成される |
| `int-render-02` | Unknown ノードを含む md | 赤枠プレースホルダが生成される |
| `int-render-03` | RTL (`dir:rtl`) を含む md | DOM 属性 `dir="rtl"` が付与される |
| `int-render-04` | `sketch` / `clean` テーマ切替 | テーマクラスが正しく切り替わる |
| `int-render-perf-01` | ファイル50・各500行の構成 | 再レンダリング時間が 100ms 以内 |

---

## 10. E2Eテスト：VS Code拡張

> VS Code Extension Test Runner（`@vscode/test-electron`）を使用。
> テスト実行には `tests/e2e/` 配下のワークスペースフィクスチャを使用する。

### 10.1 ライブプレビュー

| テストID | 操作 | 期待結果 |
| --- | --- | --- |
| `e2e-preview-01` | `.md` ファイルを開く | WebviewPanel が自動で右カラムに開く |
| `e2e-preview-02` | md を編集する（300ms待機） | プレビューが更新される |
| `e2e-preview-03` | テーマを `clean` に切替 | プレビューのスタイルが切り替わる |
| `e2e-preview-04` | カーソルを Button 行に移動 | プレビュー側の対応要素がハイライトされる |

### 10.2 スニペット・補完

| テストID | 操作 | 期待結果 |
| --- | --- | --- |
| `e2e-snippet-01` | `inc` とタイプして補完を起動 | include 正規形テンプレが展開される |
| `e2e-complete-01` | `path:` の値を入力途中 | ワークスペース内 `.md` ファイルの候補が表示される |
| `e2e-complete-02` | `as:` の値を入力途中 | `block`, `inline` の候補が表示される |

### 10.3 ジャンプ

| テストID | 操作 | 期待結果 |
| --- | --- | --- |
| `e2e-jump-01` | 有効な `path:` 上で F12 | 参照先ファイルが開く |
| `e2e-jump-02` | 存在しない `path:` 上で F12 | エラートーストが表示される |

### 10.4 リネーム追従

| テストID | 操作 | 期待結果 |
| --- | --- | --- |
| `e2e-rename-01` | `ok_btn.md` → `confirm_btn.md` にリネーム | 参照元の `path:` が自動更新される（要承認） |
| `e2e-rename-02` | `dialogs/` フォルダをリネーム | フォルダ配下すべての参照が更新される |

### 10.5 糖衣整形

| テストID | 操作 | 期待結果 |
| --- | --- | --- |
| `e2e-format-01` | 糖衣構文を含む md を保存 | 正規形に整形される |
| `e2e-format-02` | `forgemark.formatOnSave: false` 設定で保存 | 整形されない |

### 10.6 コード生成

| テストID | 操作 | 期待結果 |
| --- | --- | --- |
| `e2e-codegen-01` | 右クリック→「コードへ変換」→ next-shadcn | 差分エディタが開く、承認後ファイルが生成される |
| `e2e-codegen-02` | 既存ファイルあり状態でコード生成 | 上書き確認（差分エディタ）を表示してから書き込む |
| `e2e-codegen-03` | Unknown ノードを含む md でコード生成 | コメントプレースホルダを含むファイルが生成される |

### 10.7 リンティング

| テストID | 操作 | 期待結果 |
| --- | --- | --- |
| `e2e-lint-01` | 存在しない `path:` を含む md を開く | Problems パネルに Error が表示される |
| `e2e-lint-02` | 循環するファイル構成を開く | 循環ファイル全てに Error が表示される |
| `e2e-lint-03` | 未知キーを含む include | Problems パネルに Warning が表示される |

---

## 11. パフォーマンス基準

| 指標 | 条件 | 目標値 |
| --- | --- | --- |
| 差分レンダリング | ファイル50、各500行 | 100ms 以内 |
| グラフ再構築 | ファイル50 | 50ms 以内 |
| 初回パース（起動時） | ファイル50 | 500ms 以内 |
| コード生成 | Screen 10画面 | 1000ms 以内 |

---

## 11b. ユニットテスト：新UIコントローラー パーサ

### Checkbox

| テストID | 入力 | 期待結果 |
| --- | --- | --- |
| `parser-cb-01` | `[x] 同意する {name:"agree"}` | Checkbox: `{ checked: true, label: "同意する", name: "agree" }` |
| `parser-cb-02` | `[ ] ニュースレター {disabled}` | Checkbox: `{ checked: false, disabled: true }` |
| `parser-cb-03` | `[x] 必須項目 {required}` | Checkbox: `{ required: true }` |

### RadioGroup

| テストID | 入力 | 期待結果 |
| --- | --- | --- |
| `parser-rg-01` | `## プラン {.radio-group name:"plan"}` | RadioGroup: `{ name: "plan" }` |
| `parser-rg-02` | `- (•) 無料 {value:"free"}` （RadioGroup直下） | RadioItem: `{ label: "無料", value: "free", selected: true }` |
| `parser-rg-03` | `- ( ) 有料 {value:"paid" disabled}` | RadioItem: `{ selected: false, disabled: true }` |

### Dropdown

| テストID | 入力 | 期待結果 |
| --- | --- | --- |
| `parser-dd-01` | `## アクション▼ {.dropdown}` | Dropdown: `{ label: "アクション▼" }` |
| `parser-dd-02` | `- [編集]{on:click="item.edit()"}` （Dropdown直下） | DropdownItem: `{ events: { "on:click": "item.edit()" } }` |
| `parser-dd-03` | `---` （Dropdown直下・リスト間） | MenuSeparator（DropdownSeparator として共用） |
| `parser-dd-04` | `- [削除]{.danger}` | DropdownItem: `{ class: ["danger"] }` |

### Listbox

| テストID | 入力 | 期待結果 |
| --- | --- | --- |
| `parser-lb-01` | `## 一覧 {.listbox}` | Listbox: `{ multiple: false }` |
| `parser-lb-02` | `## 一覧 {.listbox multiple}` | Listbox: `{ multiple: true }` |
| `parser-lb-03` | `- document.md {selected}` | ListboxItem: `{ label: "document.md", selected: true }` |
| `parser-lb-04` | `- config.json {disabled}` | ListboxItem: `{ disabled: true }` |

### Toolbar

| テストID | 入力 | 期待結果 |
| --- | --- | --- |
| `parser-tb-01` | `## ツールバー {.toolbar}` | Toolbar ノード |
| `parser-tb-02` | `- [保存]{icon:"save" on:click="file.save()"}` | ToolbarItem: `{ icon: "save", events: {...} }` |
| `parser-tb-03` | `- [元に戻す]{disabled}` | ToolbarItem: `{ disabled: true }` |
| `parser-tb-04` | `- [太字]{checked}` | ToolbarItem: `{ checked: true }` |
| `parser-tb-05` | `---` （Toolbar直下） | ToolbarSeparator |

### StatusBar

| テストID | 入力 | 期待結果 |
| --- | --- | --- |
| `parser-sb-01` | `## ステータス {.statusbar}` | StatusBar ノード |
| `parser-sb-02` | `- 準備完了 {.left}` | StatusItem: `{ content: "準備完了", align: "left" }` |
| `parser-sb-03` | `- UTF-8 {.right on:click="encoding.change()"}` | StatusItem: `{ align: "right", events: {...} }` |
| `parser-sb-04` | `.left` と `.right` 混在 | items が align でグループ分けされる |

### Tabs / Accordion

| テストID | 入力 | 期待結果 |
| --- | --- | --- |
| `parser-tabs-01` | `## 設定 {.tabs}` | Tabs ノード |
| `parser-tabs-02` | `### 一般 {.tab selected}` | Tab: `{ selected: true }` |
| `parser-tabs-03` | `### 通知 {.tab disabled}` | Tab: `{ disabled: true }` |
| `parser-tabs-04` | `selected` が複数の Tab | 先頭のみ selected、lint 警告 |
| `parser-acc-01` | `## FAQ {.accordion}` | Accordion ノード |
| `parser-acc-02` | `### Q1 {.accordion-item}` | AccordionItem: `{ collapsed: false }` |
| `parser-acc-03` | `### Q2 {.accordion-item collapsed}` | AccordionItem: `{ collapsed: true }` |

---

## 13. 追加コンポーネントのパーサーテスト

### Textarea

| テストID | 入力 | 期待結果 |
| --- | --- | --- |
| `parser-ta-01` | `[____]{type:textarea}` | Textarea ノード: `{ rows: 3 }` (既定) |
| `parser-ta-02` | `[____]{type:textarea rows:6 placeholder:"メモ"}` | Textarea: `{ rows: 6, placeholder: "メモ" }` |
| `parser-ta-03` | `[____]{type:textarea required disabled}` | Textarea: `{ required: true, disabled: true }` |
| `parser-ta-04` | `[____]{type:textarea on:click="foo"}` | Textarea ノード + lint 警告（`on:click` 未サポート） |

### Range / Slider

| テストID | 入力 | 期待結果 |
| --- | --- | --- |
| `parser-rng-01` | `[____]{type:range}` | Range ノード: `{ min: 0, max: 100 }` (既定) |
| `parser-rng-02` | `[____]{type:range min:10 max:90 value:50 step:5}` | Range: `{ min: 10, max: 90, value: 50, step: 5 }` |
| `parser-rng-03` | `[____]{type:range disabled}` | Range: `{ disabled: true }` |

### Combobox

| テストID | 入力 | 期待結果 |
| --- | --- | --- |
| `parser-cmb-01` | `[____]{type:combobox}` | Combobox ノード: `{ options: [] }` |
| `parser-cmb-02` | Combobox + `- React {value:"react"}` | options に `{ label: "React", value: "react" }` |
| `parser-cmb-03` | options に `- Vue {selected}` | option に `{ selected: true }` |
| `parser-cmb-04` | Combobox の直後にリストなし | Combobox: `options: []` （lint 警告なし） |

### Progress

| テストID | 入力 | 期待結果 |
| --- | --- | --- |
| `parser-prog-01` | `[____]{type:progress value:75}` | Progress ノード: `{ value: 75, max: 100 }` |
| `parser-prog-02` | `[____]{type:progress}` | Progress: `{ value: undefined }` (indeterminate) |
| `parser-prog-03` | `[____]{type:progress value:50 max:200}` | Progress: `{ value: 50, max: 200 }` |
| `parser-prog-04` | `[____]{type:progress on:click="foo"}` | Progress ノード + lint 警告（非インタラクティブ） |

### Spinner

| テストID | 入力 | 期待結果 |
| --- | --- | --- |
| `parser-spin-01` | `[~]{.spinner}` | Spinner ノード: `{ size: 16 }` (既定) |
| `parser-spin-02` | `[~]{.spinner size:24}` | Spinner: `{ size: 24 }` |
| `parser-spin-03` | `[~]{.spinner on:click="foo"}` | Spinner ノード + lint 警告（非インタラクティブ） |

### Alert

| テストID | 入力 | 期待結果 |
| --- | --- | --- |
| `parser-alt-01` | `## 注意 {.alert .warning}` | Alert ノード: `{ variant: "warning", label: "注意" }` |
| `parser-alt-02` | `## {.alert}` | Alert: `{ variant: "info" }` (既定) |
| `parser-alt-03` | `## エラー {.alert .error}` | Alert: `{ variant: "error", label: "エラー" }` |
| `parser-alt-04` | `## {.alert .success .error}` | Alert: `{ variant: "success" }` + lint 警告（複数バリアント） |

### Divider

| テストID | 入力 | 期待結果 |
| --- | --- | --- |
| `parser-div-01` | `---`（Screen 直下） | Divider ノード |
| `parser-div-02` | `---`（Card 直下） | Divider ノード |
| `parser-div-03` | `---`（Menu 直下） | MenuSeparator ノード |
| `parser-div-04` | `---`（Toolbar 直下） | ToolbarSeparator ノード |
| `parser-div-05` | `---`（Dropdown 直下） | DropdownSeparator ノード |

### Image

| テストID | 入力 | 期待結果 |
| --- | --- | --- |
| `parser-img-01` | `![ロゴ](./logo.png){w:200 h:50}` | Image ノード: `{ src: "./logo.png", alt: "ロゴ", w: 200, h: 50 }` |
| `parser-img-02` | `![](./bg.jpg)` | Image ノード: `{ src: "./bg.jpg", alt: "" }` |
| `parser-img-03` | `![ロゴ](./logo.png)` (属性なし) | Image ノード: `{ w: undefined, h: undefined }` |
| `parser-img-04` | `![ロゴ](./notfound.png){w:100}` | Image ノード + lint 警告（パス未解決） |

### Avatar

| テストID | 入力 | 期待結果 |
| --- | --- | --- |
| `parser-av-01` | `![John](./john.jpg){.avatar size:40}` | Avatar ノード: `{ src: "./john.jpg", alt: "John", size: 40 }` |
| `parser-av-02` | `![J](./j.jpg){.avatar}` | Avatar: `{ size: 32 }` (既定) |
| `parser-av-03` | `![J](./j.jpg){.avatar size:40}` (srcなし) | Avatar ノード + フォールバック（`alt` 先頭文字） |

### Grid

| テストID | 入力 | 期待結果 |
| --- | --- | --- |
| `parser-grid-01` | `## ダッシュボード {.grid cols:3}` | Grid ノード: `{ cols: 3 }` |
| `parser-grid-02` | `## {.grid cols:2 gap:16}` | Grid: `{ cols: 2, gap: 16 }` |
| `parser-grid-03` | `## {.grid}` (cols なし) | Grid: `{ cols: 1 }` + lint 警告 |
| `parser-grid-04` | Grid + `### セル1 {.cell span:2}` | GridCell: `{ span: 2 }` |

### Table

| テストID | 入力 | 期待結果 |
| --- | --- | --- |
| `parser-tbl-01` | `## {.table}` + Markdown テーブル | Table ノード: columns + rows 配列 |
| `parser-tbl-02` | Table に `striped hoverable` | `{ striped: true, hoverable: true }` |
| `parser-tbl-03` | `## {.table}` の直後にテーブルなし | lint エラー |
| `parser-tbl-04` | 3列テーブル、2行データ | columns.length=3, rows.length=2 |

### Skeleton

| テストID | 入力 | 期待結果 |
| --- | --- | --- |
| `parser-sk-01` | `[____]{type:text .skeleton}` | Input ノード: `class` に `"skeleton"` 含む |
| `parser-sk-02` | `[ラベル]{.btn .skeleton}` | Button ノード: `class` に `"skeleton"` 含む |
| `parser-sk-03` | `## カード {.card .skeleton}` | Card ノード: `class` に `"skeleton"` 含む |

---

## 14. 追加コンポーネントのコード生成テスト（スナップショット）

### next-shadcn 出力確認

| テストID | 入力 | 期待出力ポイント |
| --- | --- | --- |
| `codegen-ns-ta-01` | `Textarea rows:4` | `<Textarea rows={4} />` |
| `codegen-ns-rng-01` | `Range min:0 max:100 value:50` | `<Slider defaultValue={[50]} min={0} max={100} />` |
| `codegen-ns-cmb-01` | `Combobox` + 3オプション | `<Combobox>` + `<CommandItem>` × 3 |
| `codegen-ns-prog-01` | `Progress value:75` | `<Progress value={75} />` |
| `codegen-ns-spin-01` | `[~]{.spinner size:24}` | `<Loader2 className="animate-spin" size={24} />` |
| `codegen-ns-alt-01` | `## {.alert .error}` | `<Alert variant="destructive">` |
| `codegen-ns-div-01` | `---`（トップレベル） | `<Separator />` |
| `codegen-ns-img-01` | `![ロゴ](./logo.png){w:200 h:50}` | `<Image src="..." width={200} height={50} />` |
| `codegen-ns-av-01` | `![J](./j.jpg){.avatar size:40}` | `<Avatar>` + `<AvatarImage>` + `<AvatarFallback>` |
| `codegen-ns-grid-01` | `## {.grid cols:3}` | `<div class="grid grid-cols-3">` |
| `codegen-ns-tbl-01` | `## {.table}` + テーブル | `<Table>` + `<TableHeader>` + `<TableBody>` |
| `codegen-ns-sk-01` | Button + `.skeleton` | `<Skeleton className="..." />` で置換 |

---

## 12. テストフィクスチャ構成

```text
tests/fixtures/
├─ valid/
│   ├─ login.md          # Screen + Card + Input + Button
│   ├─ dialog.md         # Card + Row + include inline
│   ├─ list.md           # Screen + Card + Row（一覧画面）
│   ├─ rtl.md            # dir:rtl を含む画面
│   ├─ menubar.md        # MenuBar + Menu + MenuItem + MenuSeparator
│   ├─ textarea.md       # Textarea（rows / placeholder / required）
│   ├─ range.md          # Range（min / max / value / step）
│   ├─ combobox.md       # Combobox + options リスト
│   ├─ progress.md       # Progress（value / indeterminate）
│   ├─ spinner.md        # Spinner（size 指定あり・なし）
│   ├─ alert.md          # Alert（全バリアント）
│   ├─ divider.md        # Divider + MenuSeparator + ToolbarSeparator の混在
│   ├─ image.md          # Image（w / h / alt）
│   ├─ avatar.md         # Avatar（size / fallback）
│   ├─ grid.md           # Grid（cols / gap / セルスパン）
│   ├─ table.md          # Table（striped / hoverable）
│   └─ skeleton.md       # Skeleton（Button / Input / Card）
├─ invalid/
│   ├─ circular_a.md     # circular_b.md を include
│   ├─ circular_b.md     # circular_a.md を include
│   ├─ missing_path.md   # 存在しないパスを include
│   ├─ unknown_key.md    # include に未知キーあり
│   ├─ multi_screen.md   # H1 が2つある
│   ├─ menu_outside_menubar.md  # MenuBar 外に ### がある
│   ├─ table_no_data.md  # .table の直後にテーブルなし
│   ├─ grid_no_cols.md   # .grid に cols なし
│   ├─ alert_multi_variant.md  # Alert にバリアント複数
│   └─ spinner_event.md  # Spinner に on:click あり
└─ snapshots/
    ├─ next-shadcn/
    │   ├─ login.tsx
    │   ├─ dialog.tsx
    │   ├─ list.tsx
    │   ├─ menubar.tsx
    │   ├─ textarea.tsx
    │   ├─ range.tsx
    │   ├─ combobox.tsx
    │   ├─ progress.tsx
    │   ├─ spinner.tsx
    │   ├─ alert.tsx
    │   ├─ divider.tsx
    │   ├─ image.tsx
    │   ├─ avatar.tsx
    │   ├─ grid.tsx
    │   ├─ table.tsx
    │   └─ skeleton.tsx
    ├─ tailwind-plain/
    │   ├─ login.html
    │   ├─ menubar.html
    │   ├─ textarea.html
    │   ├─ table.html
    │   └─ grid.html
    └─ sveltekit/
        ├─ login.svelte
        ├─ menubar.svelte
        ├─ textarea.svelte
        └─ table.svelte
```
