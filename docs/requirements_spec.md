# Markdown-Driven UI IDE — 要求仕様書（MVP）

最終更新: 2026-03-16 (JST)

---

## 0. 目的

- Markdown（以下 **md**）だけでUI/UXの**スケルトン**を記述し、IDE（VS Code拡張）で**ライブプレビュー**しつつ、実装コードへ安全に**ハンドオフ（コード出力）**できる開発体験を提供する。
- **多言語**（日本語を含む任意の自然言語）で画面テキストを記述可能。構造は記号・属性で言語非依存化する。
- 小さなmdを**分割**し、`include` で組み立てる。例：

```text
ui/
├─ main.md
├─ dialogs/
│   ├─ MessageDlg.md
│   ├─ ok_btn.md
│   └─ cancel_btn.md
└─ components/
    ├─ AppHeader.md
    └─ FormLogin.md
```

---

## 1. シンタックス仕様（正規）

### 1.1 共通原則

- **記号主義（punctuation-first）**：`#`, `[]`, `[[...|...]]`, `{.class key:value}` により構造を表現。
- **属性キーは英語固定**（例: `type`, `required`, `dir`, `class`, `on:click`）。**表示テキストは任意言語**（UTF-8）。
- **Bidi対応**：`dir: auto|ltr|rtl` を任意ブロック/要素に付与可能。既定は `auto`。
- **エスケープ**：`\[`, `\{`, `\|` でそれぞれリテラルの `[`, `{`, `|` を表現する。バックスラッシュ自体は `\\` で表現する。
- **プリミティブ非定義要素**：スクロールバー・トースト通知・ツールチップ・スプラッシュ画面はプリミティブとして定義しない。スクロール制御は `overflow-y-auto` 等の Tailwind クラスを対象ノードに付与して表現する。詳細は [syntax_spec.md §1.5](./syntax_spec.md) を参照。

### 1.2 全プリミティブ仕様

#### Screen（画面）

- Markdown の H1 見出し（`#`）が Screen ノードにマップされる。
- ルーティングパスを見出しテキストとして記述する（例: `/`, `/login`）。
- クラス属性を後置で付与できる。

```markdown
# /login {.screen .desktop}
# / {.screen .mobile dir:rtl}
```

- H1 が複数ある場合は**ファイルごとに先頭の H1 のみ** Screen として扱い、2つ目以降は警告を出す。

#### Card（カード）

- Markdown の H2 見出し（`##`）が Card ノードにマップされる。
- クラス属性を後置で付与できる。

```markdown
## ログインフォーム {.card .w-400 .shadow}
## メッセージダイアログ {.dialog .w-420}
```

#### Row（行レイアウト）

- `[[` と `]]` で囲み、`|` で列を区切る水平レイアウト。
- 全体へのクラス/属性は `]]` の直後に `{...}` を後置する。

```markdown
[[ A | B | C ]]{.row .right .gap-12}
```

#### Text（テキスト）

- H1/H2 見出し以外の段落テキストが Text ノードにマップされる。
- インライン属性（`{...}`）を末尾に付与できる。

```markdown
本文テキストをここに表示します。{.text-sm .muted}
```

- クラスなしの段落もすべて Text ノードとして AST に取り込む。

#### Input（入力フィールド）

- アンダースコア列（2文字以上）を `[...]` で囲み、属性を後置する。
- `type`, `required`, `placeholder`, `disabled` をサポートする属性キーとする。

```markdown
[________________]{type:email required placeholder:"メールアドレス"}
[________________]{type:password required}
```

#### Button（ボタン）

- 表示ラベルを `[...]` で囲み、属性を後置する。
- インライン属性の中にはクラスとイベントハンドラを混在させてよい。

```markdown
[サインイン]{.btn .primary on:click="dlg.close('ok')"}
[キャンセル]{.btn on:click="dlg.close('cancel')"}
```

#### MenuBar・Menu・MenuItem（メニューバー）

- `##` 見出しに `.menubar` クラスを付与すると **MenuBar** ノードに昇格する。
- MenuBar 配下の `###` 見出しが **Menu**（トップレベルエントリ）になる。
- `&` プレフィックスはアクセラレータキーを示す（例: `&File` → Alt+F でフォーカス、表示ラベルは `File`）。
- `###` 以下の Markdown リスト（`-`）が **MenuItem** にマップされる。
- リストグループ間の `---`（thematic break）が **MenuSeparator** にマップされる。

```markdown
## メニュー {.menubar}

### &File

- [新規作成]{on:click="file.new()" shortcut:"Ctrl+N"}
- [開く]{on:click="file.open()" shortcut:"Ctrl+O"}

---

- [終了]{on:click="app.quit()"}

### &Help

- [ドキュメント]{on:click="help.docs()"}
- [About]{on:click="help.about()"}
```

##### MenuItem 専用の属性キー

| キー | 型 | 説明 |
| --- | --- | --- |
| `on:click` | string | クリック時のスタブ識別子（既存ルールと同じ） |
| `shortcut` | string | ショートカット表示文字列（例: `"Ctrl+N"`）。実際のキーバインドは生成先フレームワーク側で設定する |
| `disabled` | boolean | 値なしで記述可能 |

##### 解析ルール

- `.menubar` クラスを持たない `##` は通常の Card として扱う。
- `###` は MenuBar の直下にある場合のみ Menu として扱う。それ以外の `###` は現在の仕様では未定義（lint 警告）。
- `---` は Menu の直下（リストグループ間）にある場合のみ MenuSeparator として扱う。他の位置の `---` は通常の thematic break。

#### Dialog（モーダルダイアログ）

- `##` 見出しに `.dialog` クラスを付与すると **Dialog** ノードに昇格する。
- 背景のインタラクションをブロックする（モーダル動作）。
- `closable` 属性（省略時 `true`）でクローズボタンの表示を制御する。
- `open` 属性（省略時 `false`）で初期表示状態を指定する。

```markdown
## 確認ダイアログ {.dialog .w-420 closable}

本当に削除しますか？

[[ [削除]{.btn .destructive on:click="dlg.close('ok')"} | [キャンセル]{.btn on:click="dlg.close('cancel')"} ]]{.row .right .gap-8}
```

- `on:click="dlg.close('...')"` のスタブ識別子は Dialog の閉じ操作として扱われる。
- H2 の表示テキストが DialogTitle としてレンダリングされる。

#### Modeless（モードレスダイアログ）

- `##` 見出しに `.modeless` クラスを付与すると **Modeless** ノードに昇格する。
- 背景のインタラクションをブロックしない（非モーダル動作）。
- ドラッグ可能なフローティングパネルとしてレンダリングされる。
- `resizable` 属性（省略時 `false`）でリサイズ操作の可否を制御する。
- `closable` 属性（省略時 `true`）でクローズボタンの表示を制御する。

```markdown
## 検索パネル {.modeless .w-320 resizable}

[________________]{type:text placeholder:"検索ワードを入力"}

[[ [前へ]{.btn on:click="search.prev()"} | [次へ]{.btn .primary on:click="search.next()"} | [閉じる]{.btn on:click="modeless.close()"} ]]{.row .right .gap-8}
```

- Dialog と異なり、背後の画面を操作しながら利用できる。
- `modeless.close()` のスタブ識別子は Modeless の閉じ操作として扱われる。

#### イベントハンドラ属性（`on:*`）

- キーは `on:` プレフィックスに続くイベント名（例: `on:click`, `on:change`, `on:submit`）。
- 値はダブルクォートで囲んだ**スタブ識別子**（例: `"dlg.close('ok')"`）。スタブ識別子はコード生成時に `handlers["dlg.close"]?.("ok")` のように展開される。
- MVPでサポートするイベント：`on:click`, `on:change`, `on:submit`。それ以外は警告。

#### クラス/属性の構文規則

- `.className` 形式がクラス、`key:value` 形式が属性。同一 `{...}` 内に混在可能。
- `required` のようなブーリアン属性は値なしで記述できる（存在 = `true`）。
- 属性キーに大文字・スペースは使用不可。値にスペースを含む場合はダブルクォートで囲む。

### 1.3 include（正規シンタックス）

#### 正規形（フェンスド）

````markdown
```include
path: ./relative/path/to.md
as: block         # block | inline（省略時: block）
dir: auto         # auto | ltr | rtl（省略時: auto）
class: .right .gap-12
---
# フォールバック：path が存在しない場合にここを表示
[コンポーネントを読み込めませんでした]{.text-error}
```
````

- **サポートキー**：`path`（必須）、`as`、`dir`、`class`。それ以外のキーは警告を出す。
- **`---` 区切り**：フェンス内で `---` 以降の行がフォールバックコンテンツ（Markdown）として扱われる。`---` が存在しない場合はフォールバックなしとみなす。
- **フォールバック動作**：
  - `path` が存在しない場合：フォールバックコンテンツがあればレンダリング。なければ `[missing: ./path/to.md]` というエラープレースホルダをレンダリングし、lint エラー（severity: **error**）を出す。
  - `path` が存在するが読み込み失敗の場合：同様にフォールバックまたはプレースホルダ、lint エラー（severity: **error**）。

#### 糖衣構文（1行）

````markdown
```include path="./dialogs/ok_btn.md"```
````

- キーの区切りは**属性形式（`key="value"`）**で統一する（正規形の YAML 風 `key: value` との違いに注意）。
- 保存時に**正規形へ自動整形**（既定 ON）。整形後は `path:` キー形式に変換される。
- 複数キーを糖衣で指定する場合：`path="..." as="inline" dir="rtl"` のようにスペース区切りで並べる。

#### インライン展開

- `as: inline` を指定した include は `[[ ... | (include) | ... ]]` の列として埋め込める。
- `as: block` の include を Row の列に埋め込んだ場合は警告を出す。

---

## 1.4 リモートコンポーネント参照（検討仕様）

> **ステータス**: 検討中 — MVP 後のフェーズで実装予定

### 概要

`path` に HTTPS URL を指定することで、外部ホストの `.md` ファイルをコンポーネントとして参照できる。ファイルをローカルにコピー・配布しないため、コンポーネントの管理権限がホスト側に留まる。

### URL 規則

- バージョンセグメント（`v{N}` 形式）を URL パスに含めることを**必須**とする。
- `latest` などのエイリアスは**禁止**（lint エラー）。

```markdown
```include
path: https://forgemark.example/components/v1/FormLogin.md
as: block
```
```

### lintルール

| 条件 | 診断レベル |
| --- | --- |
| HTTPS URL にバージョンセグメント（`/v{N}/`）がない | error |
| HTTP（非TLS）での参照 | warning |
| プレビュー時に URL へ到達不能 | warning |

### 設計方針

- ローカルパス（`./` 相対 or 絶対）と HTTPS URL は `path` キーで共存する。パーサは `https://` プレフィックスの有無で分岐する。
- リモートコンテンツはプレビュー時にフェッチし、ローカルキャッシュ（ワークスペース `.forgemark/cache/`）に保存する。
- 依存グラフのノードはリモート URL をそのまま識別子として使用する。
- コード生成時はキャッシュ済みコンテンツを使用し、ネットワーク不要とする。

---

## 2. パーサ／レンダラ仕様（MVP）

### 2.1 パース

- `remark`/Unified で md → Markdown AST → **UI AST** へ変換。
- `include` 検出：フェンス名 `include`（および糖衣構文）を解析する。未知キーは lint 警告。
- **エラー回復**：パースエラーが発生した場合、該当ノードを `Unknown` ノードとしてスキップし、残りのファイルの解析を継続する。Unknown ノードは lint エラー（severity: **warning**）として報告する。

#### 依存グラフと循環検出

- include の依存関係を**有向グラフ**として管理する。ノードはファイルパス（ワークスペースルートからの相対パス）。
- グラフ更新は**ファイル保存時**と**ファイル変更時（デバウンス 300ms）**に実行する。
- 循環検出アルゴリズム：**深さ優先探索（DFS）+ 訪問済みセット**。循環を検出した場合は lint エラー（severity: **error**）を出し、循環に含まれるすべてのパスを報告する。

#### 差分レンダリング

- **ノード単位**で差分を取る。変更があったファイルが影響するサブツリーのみ再レンダリングする。
- 目標レイテンシ：**100ms 以内**（ファイル数 50・1ファイル最大 500行 の条件下）。
- 依存グラフをトポロジカルソートして再描画順序を決定する。

### 2.2 UI AST（最小）

#### ノード型

| ノード型 | Markdown 対応 | 主なプロパティ |
| --- | --- | --- |
| `Screen` | H1（`#`） | `route`, `id`, `class[]`, `dir` |
| `Card` | H2（`##`） | `id`, `class[]`, `dir` |
| `Row` | `[[ ... ]]` | `id`, `class[]`, `dir`, `columns: ASTNode[][]` |
| `Input` | `[___]{...}` | `id`, `class[]`, `dir`, `inputType`, `required`, `placeholder`, `disabled` |
| `Button` | `[label]{...}` | `id`, `class[]`, `dir`, `label`, `events: Record<string, string>` |
| `Text` | 段落 | `id`, `class[]`, `dir`, `content` |
| `Include` | ` ```include ``` ` | `id`, `path`, `as`, `dir`, `class[]`, `fallback?: ASTNode[]` |
| `MenuBar` | `## {.menubar}` | `id`, `class[]`, `menus: Menu[]` |
| `Menu` | `### &Label` | `id`, `label`, `accelerator`, `items: (MenuItem \| MenuSeparator)[]` |
| `MenuItem` | `- [label]{...}` （Menu直下） | `id`, `label`, `shortcut?`, `disabled?`, `events: Record<string, string>` |
| `MenuSeparator` | `---` （Menu直下） | `id` |
| `Dialog` | `## label {.dialog}` | `id`, `class[]`, `dir`, `title`, `open?`, `closable?`, `children: ASTNode[]` |
| `Modeless` | `## label {.modeless}` | `id`, `class[]`, `dir`, `title`, `closable?`, `resizable?`, `children: ASTNode[]` |
| `Tree` | `## {.tree}` | `id`, `class[]`, `items: TreeItem[]` |
| `TreeItem` | `- label{...}` （Tree直下・ネスト可） | `id`, `label`, `icon?`, `selected?`, `collapsed?`, `disabled?`, `events`, `children: TreeItem[]` |
| `Panes` | `## {.panes}` | `id`, `direction: "horizontal"\|"vertical"`, `panes: Pane[]` |
| `Pane` | `### label {.pane}` （Panes直下） | `id`, `label`, `w?`, `h?`, `flex?`, `collapsed?`, `children: ASTNode[]` |
| `Checkbox` | `[x] label{...}` / `[ ] label{...}` | `id`, `label`, `checked`, `name?`, `required?`, `disabled?` |
| `RadioGroup` | `## {.radio-group}` | `id`, `name?`, `items: RadioItem[]` |
| `RadioItem` | `- (•) label{...}` / `- ( ) label{...}` | `id`, `label`, `value?`, `selected?`, `disabled?` |
| `Tabs` | `## {.tabs}` | `id`, `class[]`, `tabs: Tab[]` |
| `Tab` | `### label {.tab}` （Tabs直下） | `id`, `label`, `selected?`, `disabled?`, `children: ASTNode[]` |
| `Accordion` | `## {.accordion}` | `id`, `class[]`, `items: AccordionItem[]` |
| `AccordionItem` | `### label {.accordion-item}` | `id`, `label`, `collapsed?`, `disabled?`, `children: ASTNode[]` |
| `Breadcrumb` | `## {.breadcrumb}` | `id`, `items: BreadcrumbItem[]` |
| `BreadcrumbItem` | `- [label]{...}` （Breadcrumb直下） | `id`, `label`, `events?` |
| `Dropdown` | `## {.dropdown}` | `id`, `label`, `items: (DropdownItem \| MenuSeparator)[]` |
| `DropdownItem` | `- [label]{...}` （Dropdown直下） | `id`, `label`, `icon?`, `shortcut?`, `disabled?`, `events` |
| `Listbox` | `## {.listbox}` | `id`, `multiple?`, `items: ListboxItem[]` |
| `ListboxItem` | `- label{...}` （Listbox直下） | `id`, `label`, `selected?`, `disabled?`, `icon?`, `events?` |
| `Toolbar` | `## {.toolbar}` | `id`, `groups: (ToolbarItem \| ToolbarSeparator)[][]` |
| `ToolbarItem` | `- [label]{...}` （Toolbar直下） | `id`, `label`, `icon?`, `shortcut?`, `checked?`, `disabled?`, `events` |
| `ToolbarSeparator` | `---` （Toolbar直下） | `id` |
| `StatusBar` | `## {.statusbar}` | `id`, `items: StatusItem[]` |
| `StatusItem` | `- text{...}` （StatusBar直下） | `id`, `content`, `align: "left"\|"right"`, `disabled?`, `events?` |
| `Textarea` | `[___]{type:textarea}` | `id`, `class[]`, `dir`, `rows`, `placeholder?`, `required?`, `disabled?`, `readonly?`, `name?` |
| `Range` | `[___]{type:range}` | `id`, `class[]`, `dir`, `min`, `max`, `value?`, `step?`, `disabled?`, `name?` |
| `Combobox` | `[___]{type:combobox}` | `id`, `class[]`, `dir`, `placeholder?`, `disabled?`, `name?`, `options: ComboboxOption[]` |
| `Progress` | `[___]{type:progress}` | `id`, `class[]`, `value?`, `max` |
| `Spinner` | `[~]{.spinner}` | `id`, `class[]`, `size?` |
| `Alert` | `## label {.alert .variant}` | `id`, `class[]`, `dir`, `variant: "info"\|"success"\|"warning"\|"error"`, `label`, `children: ASTNode[]` |
| `Divider` | `---`（Container 外） | `id` |
| `Image` | `![alt](src){...}` | `id`, `class[]`, `dir`, `src`, `alt`, `w?`, `h?` |
| `Avatar` | `![alt](src){.avatar}` | `id`, `class[]`, `src`, `alt`, `size?` |
| `Grid` | `## label {.grid}` | `id`, `class[]`, `dir`, `cols`, `gap?`, `cells: GridCell[]` |
| `GridCell` | `### label {.cell}` （Grid直下） | `id`, `class[]`, `span?`, `rowSpan?`, `children: ASTNode[]` |
| `Table` | `## label {.table}` | `id`, `class[]`, `dir`, `striped?`, `bordered?`, `hoverable?`, `compact?`, `columns: string[]`, `rows: string[][]` |
| `Skeleton` | 任意ノードの `.skeleton` クラス | （独立ノードなし。既存ノードの `class[]` に `skeleton` が含まれる） |
| `Unknown` | パース失敗箇所 | `id`, `raw` |

#### `id` 付与ルール

- `id` はパース時に**自動採番**する。形式は `{nodeType}-{index}`（例: `screen-0`, `button-3`）。
- インデックスはファイル内の出現順（0始まり）。include で展開されたノードは展開後の順序でカウントする。
- 同一ファイル内で `id` の重複は発生しない。include 合成後に重複が生じた場合は後出しの `id` に `-{suffix}` を付与して解消する。
- 将来拡張：ユーザーが `{id:my-dialog}` で明示的に `id` を指定できるようにする（MVP 対象外）。

`dir` は `auto` 既定。`class` は Tailwind/shadcn に渡せる文字列配列。

### 2.3 レンダリング（プレビュー）

- React + Tailwind で**ワイヤーフレームテーマ**（`sketch`, `clean`）を提供。
- `dir` は DOM 属性（`dir="rtl"` など）に反映。RTL は `:dir(rtl)` もしくは論理プロパティで表現。
- `Unknown` ノードは赤枠のプレースホルダとして表示する。

---

## 3. IDE（VS Code拡張）要件（MVP）

### 3.1 動作環境

- **VS Code エンジン**：`^1.85.0` 以上（2024年1月リリース、`vscode` API v1.85 準拠）。
- **Node.js**：20 LTS 以上（拡張ホスト内ランタイム）。
- **Webview**：`WebviewPanel`（エディタカラム内）を使用する。`WebviewView`（サイドバー）は MVP 対象外。
- **マルチルートワークスペース**：単一ルートのみ MVP サポート。マルチルートで開いた場合は警告通知を出す。

### 3.2 ライブプレビュー

- 左にエディタ（md）、右に Webview パネル（UIプレビュー）を並べて表示する。
- **スクロール同期**：エディタのカーソル行に対応するUIノードをプレビュー側でハイライトする（MVP）。逆方向（プレビュー→エディタ）の同期は MVP 対象外。
- **テーマ切替**：プレビューパネルのツールバーから `sketch` / `clean` を切り替えられる。
- **更新デバウンス**：エディタ変更から 300ms 後に再パース・再レンダリングを実行する。

### 3.3 スニペット

- `include` 正規形テンプレを展開するスニペットを提供する（トリガーワード: `inc`）。
- `path` の補完候補はワークスペース内の `.md` ファイル一覧から生成する。
- `as` の候補: `block`, `inline`。`dir` の候補: `auto`, `ltr`, `rtl`。

### 3.4 ジャンプ

- `path:` の値（相対パス）上で `Ctrl/Cmd+Click` またはF12 → 参照先ファイルを開く。
- 対象ファイルが存在しない場合はエラートーストを表示する。

### 3.5 リネーム追従

- VS Code の `onDidRenameFiles` イベントを購読する。
- リネームされたファイルを `path:` で参照しているすべての md ファイルを `WorkspaceEdit` で一括更新する。
- フォルダごとの移動（フォルダリネーム）も追従対象とする。
- 更新前に差分プレビュー（VS Code 標準の Refactor Preview）を表示し、ユーザーの承認を得てから適用する。

### 3.6 糖衣⇄正規

- 保存時（`onWillSaveTextDocument`）に糖衣を正規形へ自動整形する（既定 ON）。
- ワークスペース設定 `forgemark.formatOnSave: false` で無効化できる。

### 3.7 リンティング（Problems 集約）

| カテゴリ | メッセージ | Severity |
| --- | --- | --- |
| 未知キー | `Unknown key '{key}' in include block` | Warning |
| 不正値 | `Invalid value '{value}' for key '{key}'. Expected: {expected}` | Error |
| 存在しないパス | `File not found: {path}` | Error |
| 循環参照 | `Circular include detected: {path} → ... → {path}` | Error |
| 未サポートイベント | `Unsupported event '{event}'. Supported: on:click, on:change, on:submit` | Warning |
| 複数 Screen | `Only one H1 per file is allowed as Screen` | Warning |
| `as:block` in Row | `Inline include required inside Row (use as: inline)` | Warning |
| MenuBar 外の `###` | `H3 is only valid inside a MenuBar/Tabs/Accordion/Panes (## {.menubar/.tabs/...})` | Warning |
| MenuItem 不正属性 | `Invalid attribute '{key}' for MenuItem` | Warning |
| DropdownItem 不正属性 | `Invalid attribute '{key}' for DropdownItem` | Warning |
| ToolbarItem 不正属性 | `Invalid attribute '{key}' for ToolbarItem` | Warning |
| Pane 外の `{.pane}` | `{.pane} requires a parent ## {.panes}` | Warning |
| Tabs selected 複数 | `Multiple selected tabs found; only the first will be active` | Warning |
| Listbox/Panes サイズ競合 | `Cannot specify both 'flex' and 'w'/'h' on the same Pane/ListboxItem` | Warning |
| Textarea に `on:click` | `Textarea does not support event '{event}'` | Warning |
| Progress に イベント | `Progress is non-interactive; event '{event}' is ignored` | Warning |
| Spinner に イベント | `Spinner is non-interactive; event '{event}' is ignored` | Warning |
| Alert バリアント複数 | `Multiple variant classes on Alert; only the first is used` | Warning |
| `.table` の直後にテーブルなし | `## {.table} must be followed by a Markdown table` | Error |
| `.grid` に `cols` なし | `Grid requires 'cols' attribute (e.g. {.grid cols:3})` | Warning |
| Image パス未解決 | `Image source not found: {src}` | Warning |
| Avatar `.avatar` なし | `Avatar requires '.avatar' class` | Error |
| Divider に属性 | `Divider does not accept attributes` | Warning |
| Dialog に `.modeless` 併用 | `Cannot use both '.dialog' and '.modeless' on the same element` | Error |
| Dialog/Modeless に未知属性 | `Invalid attribute '{key}' for Dialog/Modeless` | Warning |
| Modeless の `on:click="dlg.close(...)"` | `Use 'modeless.close()' instead of 'dlg.close()' inside Modeless` | Warning |

---

## 4. コード出力（ハンドオフ）ターゲットと優先度

### 4.1 優先順位（結論）

1. **Next.js（App Router）＋ React 19／Server Components ＋ Tailwind CSS v4 ＋ shadcn/ui**（最優先）
   - 2026年の主流 React フルスタック。採用実績・求人・情報量が厚く、AI補完とも親和性が高い。
2. **Tailwind CSS v4 "素出力"**（次点）
   - フレームワーク非依存の出口。Tailwind は利用率首位で v4 の高速化も追い風。
3. **SvelteKit**（拡張）
   - 小さなバンドルと高速体感を重視する層向け。Svelte 5 / SvelteKit の成熟が進展。

> 備考：Vue/Nuxt（Nuxt 4等）も堅調だが、初期は React/Next に集中し、その後の追加を検討。

### 4.2 生成ポリシー

#### ターゲット1（next-shadcn）

- ルーティング：`app/(segments)/page.tsx`（RSC前提）。Screen の `route` プロパティをパスセグメントに使用する。
- UI：**shadcn/ui**（Radix ベースの Button/Input/Dialog 等へマップ）。統合 `@radix-ui` パッケージに準拠。
- スタイル：**Tailwind v4**。
- イベント：`handlers["dlg.close"]?.("ok")` などスタブ呼び出し。ファイル先頭で `handlers` プロップを受け取る型定義を生成する。
- TypeScript：strict モード（`"strict": true`）を前提とする。
- **MenuBar マッピング**：shadcn/ui の `Menubar` / `MenubarMenu` / `MenubarItem` / `MenubarSeparator`（`@radix-ui/react-menubar` ベース）を使用する。`shortcut` は `<MenubarShortcut>` で出力する。
- **Dialog マッピング**：shadcn/ui の `<Dialog>` / `<DialogContent>` / `<DialogHeader>` / `<DialogTitle>` / `<DialogFooter>` を使用する。`closable` が `false` の場合は `<DialogClose>` を省略し、`onPointerDownOutside={e => e.preventDefault()}` を付与する。`open` 属性は `defaultOpen` プロップとして出力する。
- **Modeless マッピング**：`<div class="fixed …" role="dialog" aria-modal="false">` として出力する。ドラッグはスタブコメント（`{/* TODO: drag handle */}`）を生成する。`resizable` が `true` の場合は `resize-both overflow-auto` クラスを付与する。

#### ターゲット2（tailwind-plain）

- HTML/JSX 最小出力＋ Tailwind クラス。フレームワークレスに配慮。
- イベントハンドラはコメントスタブ（`/* TODO: on:click */`）として出力する。
- **MenuBar マッピング**：`<nav>` + `<ul>` / `<li>` の意味論的 HTML で出力する。`shortcut` は `<kbd>` 要素で出力する。

#### ターゲット3（sveltekit）

- Svelte **5**（runes 構文：`$props()`, `$state()` 使用）を前提とする。
- `+page.svelte` / `+page.server.js` に分配。Tailwind クラスは流用。
- **MenuBar マッピング**：tailwind-plain と同じ `<nav>` + `<ul>` 構造を Svelte テンプレートで出力する。

#### 追加コンポーネントのマッピング方針

| ノード | next-shadcn | tailwind-plain | sveltekit |
| --- | --- | --- | --- |
| `Dialog` | `<Dialog>` + `<DialogContent>` + `<DialogHeader>` + `<DialogTitle>` (shadcn) | `<dialog>` HTML5要素（`open` 属性制御） | `<dialog>` 要素 |
| `Modeless` | `<div class="fixed …">` + drag handle stub | `<div class="fixed …" role="dialog" aria-modal="false">` | `<div class="fixed …" role="dialog" aria-modal="false">` |
| `Textarea` | `<Textarea />` (shadcn) | `<textarea>` | `<textarea>` |
| `Range` | `<Slider />` (shadcn) | `<input type="range">` | `<input type="range">` |
| `Combobox` | `<Combobox>` + `<Command>` (shadcn) | `<input list>` + `<datalist>` | `<input list>` + `<datalist>` |
| `Progress` | `<Progress />` (shadcn) | `<progress>` | `<progress>` |
| `Spinner` | `<Loader2 className="animate-spin">` (lucide) | `<div role="status" class="animate-spin">` | `<div role="status" class="animate-spin">` |
| `Alert` | `<Alert>` + `<AlertTitle>` (shadcn) | `<div role="alert">` | `<div role="alert">` |
| `Divider` | `<Separator />` (shadcn) | `<hr>` | `<hr>` |
| `Image` | `<Image>` (next/image) | `<img>` | `<img>` |
| `Avatar` | `<Avatar>` + `<AvatarImage>` (shadcn) | `<img class="rounded-full">` | `<img class="rounded-full">` |
| `Grid` | `<div class="grid grid-cols-{n}">` | `<div class="grid grid-cols-{n}">` | `<div class="grid grid-cols-{n}">` |
| `Table` | `<Table>` + `<TableHeader>` (shadcn) | `<table>` + `<thead>` + `<tbody>` | `<table>` + `<thead>` + `<tbody>` |
| `Skeleton` | `<Skeleton />` (shadcn) でノードを置換 | `animate-pulse bg-muted rounded` クラスを付与 | `animate-pulse bg-muted rounded` クラスを付与 |

#### 未対応 AST ノードの扱い

- `Unknown` ノードが含まれる場合：生成をブロックせず、HTML コメント `<!-- unknown node: {raw} -->` としてプレースホルダ出力し、コンソールに警告を出す。
- 生成ターゲットがサポートしない AST ノードも同様にコメントプレースホルダで出力する。

#### 出力先・上書きポリシー

- **出力ディレクトリ**：ワークスペース設定 `forgemark.outputDir`（既定: `./generated`）。
- **上書き確認**：既存ファイルがある場合は VS Code の差分エディタで変更内容を表示し、ユーザーが「適用」を押すまで実際のファイル書き込みは行わない。
- **バックアップ**：MVP では提供しない（git 管理を前提とする）。

---

## 5. 多言語対応

- 表示テキストは**任意言語**（UTF-8）。
- 右→左言語は `dir:rtl` 明示、既定は `dir:auto`。`dir:auto` は HTML の `dir="auto"` をそのまま使用する（Unicode Bidi アルゴリズムをブラウザに委ねる）。
- 将来要件（MVP 対象外）：`{i18n:key="dialog.ok"}` のような**辞書キー**をオプションで付与し、`t('key')` へ差し替える出力モードを用意。

---

## 6. サンプル（要求仕様に準拠）

### 6.1 main.md

````markdown
# / {.screen desktop}

## Header

[[ ロゴ | スペース | [サインイン]{.btn .primary} ]]{.row .align-center .p-16}

## メインエリア {.grid-2 .gap-24 .p-24}

```include
path: ./components/AppHeader.md
```

### ログイン

```include
path: ./components/FormLogin.md
```

## ダイアログ

```include
path: ./dialogs/MessageDlg.md
```
````

### 6.2 dialogs/MessageDlg.md

````markdown
## メッセージダイアログ {.dialog .w-420}

本文テキストをここに表示します。

[[
```include
path: ./ok_btn.md
as: inline
class: .mr-8
```
|
```include
path: ./cancel_btn.md
as: inline
```
]]{.row .right .gap-12}
````

### 6.3 ok_btn.md / cancel_btn.md

```markdown
[OK]{.btn .primary on:click="dlg.close('ok')"}
```

```markdown
[キャンセル]{.btn on:click="dlg.close('cancel')"}
```

---

## 7. IDE外部仕様（UX）

### MVP 対象

- 新規作成ウィザード：テンプレ（Login / List+Detail / MessageDialog）をワンクリック生成。
- 右クリック→「**コードへ変換**（ターゲット選択: `next-shadcn` / `tailwind-plain` / `sveltekit`）」。

### MVP 対象外（将来拡張）

- 生成先の**差分プレビュー**（md↔生成物の対応をハイライト）：ロードマップ D13-14 以降に検討。

---

## 8. 根拠・トレンド（要旨）

- **Next.js（App Router, RSC/Server Actions）**は2026年も**最有力の実務選択**で、ドキュメント/ベストプラクティスが充実。
- **Tailwind CSS**は調査でも**利用率首位**。v4で高速ビルド＆DX向上。
- **shadcn/ui**は"コード所有"とRadixのアクセシビリティで人気が加速。統合 `@radix-ui` パッケージへの移行も進む。
- **SvelteKit**はSvelte 5/Kitの機能強化で**高性能志向**の選択肢に。

---

## 9. ロードマップ（2週間MVP）

- **D1–2**：`include` 正規化/パース（循環検出・依存グラフ）
- **D3–4**：差分レンダリング（影響範囲のみ再描画）
- **D5–7**：VS Code拡張（スニペット/補完/ジャンプ/糖衣⇄正規）
- **D8–10**：コード出力：**next-shadcn**（RSC/Server Actions最小）
- **D11–12**：**tailwind-plain** 追加
- **D13–14**：サンプル3画面／README／デモ

---

## 付録A：参考リンク

- Next.js 公式ドキュメント：<https://nextjs.org/docs/app>
- Tailwind CSS v4 ドキュメント：<https://tailwindcss.com/docs>
- shadcn/ui：<https://ui.shadcn.com>
- SvelteKit：<https://kit.svelte.dev>
- Svelte 5 runes：<https://svelte.dev/docs/svelte/what-are-runes>
- remark/Unified：<https://unifiedjs.com>
