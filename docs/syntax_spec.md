# ForgeMark — 構文仕様書

バージョン: 0.1.0
最終更新: 2026-03-16 (JST)

> **本文書の位置づけ**
> ForgeMark 構文の完全なリファレンスです。実装上の根拠・設計背景は [requirements_spec.md](./requirements_spec.md) を参照してください。

---

## クイックリファレンス

| プリミティブ | 構文 | Markdown 対応 |
| --- | --- | --- |
| Screen | `# /path {.class}` | H1 |
| Card | `## ラベル {.class}` | H2 |
| MenuBar | `## ラベル {.menubar}` | H2 + `.menubar` |
| Menu | `### &Label` | H3（MenuBar直下） |
| MenuItem | `- [ラベル]{...}` | リスト項目（Menu直下） |
| MenuSeparator | `---` | thematic break（Menu直下） |
| Row | `[[ A \| B \| C ]]{.class}` | カスタム記法 |
| Text | `段落テキスト{.class}` | 段落 |
| Input | `[____]{type:xxx}` | カスタム記法 |
| Button | `[ラベル]{.class on:click="..."}` | カスタム記法 |
| Tree | `## ラベル {.tree}` | H2 + `.tree` |
| TreeItem | `- ラベル {icon:"folder"}` | ネストリスト（Tree直下） |
| Panes | `## ラベル {.panes horizontal}` | H2 + `.panes` |
| Pane | `### ラベル {.pane w:240}` | H3（Panes直下） |
| Checkbox | `[x] ラベル {name:"..."}` | カスタム記法 |
| RadioGroup | `## ラベル {.radio-group}` | H2 + `.radio-group` |
| RadioItem | `- (•) ラベル {value:"..."}` | リスト項目（RadioGroup直下） |
| Select | `[____]{type:select}` | Input `type` 拡張 |
| Toggle | `[____]{type:toggle checked}` | Input `type` 拡張 |
| Badge | `[ラベル]{.badge}` | Button の非インタラクティブ変形 |
| Tabs | `## ラベル {.tabs}` | H2 + `.tabs` |
| Tab | `### ラベル {.tab selected}` | H3（Tabs直下） |
| Accordion | `## ラベル {.accordion}` | H2 + `.accordion` |
| AccordionItem | `### ラベル {.accordion-item}` | H3（Accordion直下） |
| Breadcrumb | `## ラベル {.breadcrumb}` | H2 + `.breadcrumb` |
| BreadcrumbItem | `- [ラベル]{on:click="..."}` | リスト項目（Breadcrumb直下） |
| Dropdown | `## ラベル▼ {.dropdown}` | H2 + `.dropdown` |
| DropdownItem | `- [ラベル]{on:click="..."}` | リスト項目（Dropdown直下） |
| Listbox | `## ラベル {.listbox}` | H2 + `.listbox` |
| ListboxItem | `- ラベル {selected}` | リスト項目（Listbox直下） |
| Toolbar | `## ラベル {.toolbar}` | H2 + `.toolbar` |
| ToolbarItem | `- [ラベル]{icon:"..." on:click="..."}` | リスト項目（Toolbar直下） |
| StatusBar | `## ラベル {.statusbar}` | H2 + `.statusbar` |
| StatusItem | `- テキスト {.left}` | リスト項目（StatusBar直下） |
| Textarea | `[____]{type:textarea rows:4}` | Input `type` 拡張 |
| Range / Slider | `[____]{type:range min:0 max:100 value:50}` | Input `type` 拡張 |
| Combobox | `[____]{type:combobox}` | Input `type` 拡張 |
| Progress | `[____]{type:progress value:75}` | Input `type` 拡張 |
| Spinner | `[~]{.spinner}` | Button の非インタラクティブ変形 |
| Alert | `## ラベル {.alert .warning}` | Card `.alert` バリアント |
| Divider | `---`（Menu/Toolbar/Dropdown 外） | thematic break → Divider ノード |
| Image | `![ラベル]{w:320 h:240}` | Markdown image 記法拡張 |
| Avatar | `![ラベル]{.avatar size:40}` | Image `.avatar` バリアント |
| Grid | `## ラベル {.grid cols:3}` | H2 + `.grid` |
| include（正規） | ` ```include\npath: ./foo.md\n``` ` | コードフェンス |
| include（糖衣） | ` ```include path="./foo.md"``` ` | 1行コードフェンス |

---

## 1. 共通原則

### 1.1 記号主義

ForgeMark は Markdown の記号を拡張してUIを表現する。
テキストは任意言語（UTF-8）で記述でき、構造は記号・英語キーで定義する。

```
# /login {.screen}         ← Screen（H1 + 属性）
## カード {.card}           ← Card（H2 + 属性）
[[ A | B ]]{.row}          ← Row（独自記法）
[ラベル]{.btn}              ← Button（独自記法）
[____]{type:email}         ← Input（独自記法）
段落テキスト{.text-sm}      ← Text（段落 + 属性）
```

### 1.2 属性ブロック `{...}`

ほぼすべてのプリミティブに後置で付与できる。

```
{.クラス名}                 ← クラス指定（先頭ドット）
{key:value}                ← 属性指定
{required}                 ← ブーリアン属性（値なし = true）
{.btn .primary type:submit} ← 複数指定（スペース区切り）
{placeholder:"入力してください"} ← 値にスペースを含む場合はダブルクォート
```

**制約**

- 属性キーは英語のみ・小文字推奨・スペース不可。
- クラス名は `.` プレフィックス必須。
- `{...}` は省略可能。省略時はクラスなし・属性なしとして扱う。

### 1.3 方向制御（Bidi）

任意のプリミティブに `dir` 属性を付与できる。

| 値 | 意味 |
| --- | --- |
| `auto`（既定） | Unicode Bidi アルゴリズムに委ねる（`dir="auto"`） |
| `ltr` | 左から右 |
| `rtl` | 右から左 |

```markdown
# /ar {.screen dir:rtl}
[________________]{type:email dir:ltr}
```

### 1.4 エスケープ

| 書き方 | 出力 | 用途 |
| --- | --- | --- |
| `\[` | `[` | Button/Input 記法をリテラルにする |
| `\]` | `]` | 同上 |
| `\{` | `{` | 属性ブロックをリテラルにする |
| `\}` | `}` | 同上 |
| `\|` | `\|` | Row の列区切りをリテラルにする |
| `\\` | `\` | バックスラッシュ自体 |

### 1.5 プリミティブとして定義しない要素

以下はUIコンポーネントとして独立定義せず、**クラス属性または既存プリミティブの組み合わせ**で表現する。

| 要素 | 理由 | 推奨表現 |
| --- | --- | --- |
| スクロールバー | ブラウザ/OS が overflow 状態に応じて自動表示するもの。コンポーネントとして配置する性質ではない | `overflow-y-auto`・`overflow-y-scroll` などの Tailwind クラスを対象ノードに付与する |
| スプラッシュ画面 | 起動時の一時表示であり UI スケルトンの構造要素ではない | Screen ノード + `.splash` クラスで表現する |
| トースト通知 | 命令的に表示するため宣言的なスケルトン記述と相性が悪い | Button の `on:click` スタブで呼び出し側を示す |
| ツールチップ | ホバー状態依存の動的表示。スケルトンで定義する必要性が低い | `title:"説明文"` 属性を Button/Input に付与することで生成時に `title` 属性として出力する（将来拡張） |

---

## 2. プリミティブ詳細

### 2.1 Screen

**構文**

```
# <route> {<attrs>}
```

**ルール**

- Markdown H1（`#`）が Screen にマップされる。
- `<route>` はルーティングパス（例: `/`, `/login`, `/users/:id`）。
- ファイル内に H1 が複数ある場合は先頭のみ Screen とし、2つ目以降は lint 警告。

**例**

```markdown
# / {.screen .desktop}
# /login {.screen .mobile dir:rtl}
```

**生成されるルーティング（next-shadcn）**

| route | 出力ファイル |
| --- | --- |
| `/` | `app/page.tsx` |
| `/login` | `app/login/page.tsx` |
| `/users/:id` | `app/users/[id]/page.tsx` |

---

### 2.2 Card

**構文**

```
## <ラベル> {<attrs>}
```

**ルール**

- Markdown H2（`##`）が Card にマップされる。ただし `.menubar` クラスがある場合は MenuBar に昇格する（→ §2.5）。
- ラベルはプレビュー上の見出しとして表示される。

**例**

```markdown
## ログインフォーム {.card .w-400 .shadow}
## エラーダイアログ {.dialog .w-360}
## 説明なしのセクション
```

---

### 2.3 Row

**構文**

```
[[ <列1> | <列2> | ... ]]{<attrs>}
```

**ルール**

- `[[` と `]]` で範囲を囲む。`|` で列を区切る。
- 列の中には Text・Button・Input・include（`as: inline`）を配置できる。
- 属性は `]]` の直後に付与する。

**例**

```markdown
[[ ロゴ | スペース | [ログイン]{.btn .primary} ]]{.row .align-center .p-16}
[[ [____]{type:email} | [送信]{.btn} ]]{.row .gap-8}
```

**列に include を使う場合**

````markdown
[[
```include
path: ./ok_btn.md
as: inline
```
|
```include
path: ./cancel_btn.md
as: inline
```
]]{.row .right .gap-8}
````

> `as: block` の include を Row 列に配置した場合は lint 警告。

---

### 2.4 Text

**構文**

```
<テキスト>{<attrs>}
```

**ルール**

- H1・H2・H3 以外の段落すべてが Text にマップされる。
- 属性なしの段落も Text ノードとして AST に取り込む。
- 属性ブロックは段落末尾に直接続けて記述する（スペース不可）。

**例**

```markdown
ようこそ。メールアドレスとパスワードを入力してください。{.text-sm .muted}

利用規約に同意の上、続行してください。
```

---

### 2.5 Input

**構文**

```
[<アンダースコア列>]{<attrs>}
```

**ルール**

- `[...]` 内がアンダースコア 2文字以上の場合に Input として認識する。
- アンダースコアの本数はプレビュー上の幅のヒントになる（実装依存）。

**サポート属性キー**

| キー | 型 | 説明 |
| --- | --- | --- |
| `type` | string | `text`（既定）/ `email` / `password` / `number` / `search` / `tel` / `url` |
| `required` | boolean | 必須フィールド |
| `placeholder` | string | プレースホルダテキスト |
| `disabled` | boolean | 無効状態 |
| `dir` | string | `auto` / `ltr` / `rtl` |

**例**

```markdown
[________________]{type:email required placeholder:"メールアドレス"}
[________________]{type:password required placeholder:"パスワード"}
[____]{type:search placeholder:"検索" dir:ltr}
[____]{type:number disabled}
```

---

### 2.6 Button

**構文**

```
[<ラベル>]{<attrs>}
```

**ルール**

- `[...]` 内がアンダースコア列**でない**文字列の場合に Button として認識する。
- クラス・属性・イベントハンドラを混在して付与できる。

**サポート属性キー**

| キー | 型 | 説明 |
| --- | --- | --- |
| `.className` | — | クラス指定 |
| `on:click` | string | クリックイベントのスタブ識別子 |
| `on:change` | string | 変更イベントのスタブ識別子 |
| `on:submit` | string | 送信イベントのスタブ識別子 |
| `disabled` | boolean | 無効状態 |
| `dir` | string | `auto` / `ltr` / `rtl` |

**例**

```markdown
[送信]{.btn .primary on:click="form.submit()"}
[キャンセル]{.btn .ghost on:click="dlg.close('cancel')"}
[削除]{.btn .danger disabled}
```

**イベントスタブの展開ルール**

`on:click="dlg.close('ok')"` は各ターゲットで次のように展開される：

| ターゲット | 展開形 |
| --- | --- |
| next-shadcn | `onClick={() => handlers["dlg.close"]?.("ok")}` |
| tailwind-plain | `/* TODO: on:click="dlg.close('ok')" */` |
| sveltekit | `onclick={() => handlers["dlg.close"]?.("ok")}` |

---

### 2.7 MenuBar / Menu / MenuItem / MenuSeparator

**全体構文**

```markdown
## <ラベル> {.menubar}

### &<MenuLabel>

- [<ItemLabel>]{on:click="<stub>" shortcut:"<key>"}
- [<ItemLabel>]{disabled}

---

- [<ItemLabel>]{on:click="<stub>"}

### &<MenuLabel2>

- [<ItemLabel>]{on:click="<stub>"}
```

#### MenuBar

- H2（`##`）に `.menubar` クラスを付与すると MenuBar ノードに昇格する。
- `.menubar` を持たない H2 は通常の Card として扱う。

#### Menu

- MenuBar 直下の H3（`###`）が Menu になる。
- `&` プレフィックスでアクセラレータキーを指定する。`&File` → ラベル `File`・アクセラレータ `F`（Alt+F）。
- `&` なしのラベルも有効（アクセラレータなし）。
- MenuBar 外の H3 は lint 警告（`H3 is only valid inside a MenuBar`）。

#### MenuItem

- Menu 直下のリスト項目（`-`）が MenuItem になる。
- `[ラベル]{...}` 形式で記述する。属性なしの場合は `- ラベル` と書ける。

**MenuItem 専用の属性キー**

| キー | 型 | 説明 |
| --- | --- | --- |
| `on:click` | string | クリック時のスタブ識別子 |
| `shortcut` | string | ショートカット表示文字列（例: `"Ctrl+N"`）。UI 上の表示のみで実際のキーバインドは生成先が担う |
| `disabled` | boolean | 値なしで記述可能 |

#### MenuSeparator

- Menu 直下のリストグループ間に `---`（thematic break）を置くと MenuSeparator になる。
- Menu 以外の場所にある `---` は通常の水平線として扱う。

**例**

```markdown
## メニュー {.menubar}

### &File

- [新規作成]{on:click="file.new()" shortcut:"Ctrl+N"}
- [開く]{on:click="file.open()" shortcut:"Ctrl+O"}

---

- [名前を付けて保存]{on:click="file.saveAs()"}

---

- [終了]{on:click="app.quit()"}

### &Edit

- [元に戻す]{on:click="edit.undo()" shortcut:"Ctrl+Z"}
- [やり直し]{on:click="edit.redo()" shortcut:"Ctrl+Y" disabled}

---

- [切り取り]{on:click="edit.cut()" shortcut:"Ctrl+X"}
- [コピー]{on:click="edit.copy()" shortcut:"Ctrl+C"}
- [貼り付け]{on:click="edit.paste()" shortcut:"Ctrl+V"}

### &Help

- [ドキュメント]{on:click="help.docs()"}
- [About]{on:click="help.about()"}
```

**コード生成マッピング**

| ターゲット | MenuBar | Menu | MenuItem | MenuSeparator |
| --- | --- | --- | --- | --- |
| next-shadcn | `<Menubar>` | `<MenubarMenu>` + `<MenubarTrigger>` | `<MenubarItem>` + `<MenubarShortcut>` | `<MenubarSeparator />` |
| tailwind-plain | `<nav>` | `<ul>` | `<li>` + `<kbd>` | `<li role="separator" />` |
| sveltekit | `<nav>` | `<ul>` | `<li>` + `<kbd>` | `<li role="separator" />` |

---

### 2.8 Tree / TreeItem

#### 全体構文

```markdown
## <ラベル> {.tree}

- <ルート項目>
  - <子項目> {<attrs>}
    - <孫項目>
  - <子項目> {disabled}
```

#### ルール

- H2（`##`）に `.tree` クラスを付与すると **Tree** ノードに昇格する（`.menubar` と同じ方式）。
- Tree 配下のネストしたリスト（`-`）が **TreeItem** にマップされる。
- インデント（2スペースまたはタブ）で階層を表す。深さに上限はない。
- 属性なしの項目は `- ラベル` と書ける。属性を付ける場合は `- [ラベル]{...}` または `- ラベル{...}` を使う。

#### TreeItem サポート属性キー

| キー | 型 | 説明 |
| --- | --- | --- |
| `on:click` | string | クリック時のスタブ識別子 |
| `selected` | boolean | 選択状態（値なしで記述可能） |
| `collapsed` | boolean | 折りたたみ状態（値なしで記述可能） |
| `disabled` | boolean | 無効状態 |
| `icon` | string | アイコン識別子（例: `"folder"`, `"file"`） |

#### 例

```markdown
## ファイルツリー {.tree}

- src/ {icon:"folder"}
  - components/ {icon:"folder" collapsed}
    - Button.tsx {icon:"file" on:click="file.open('Button.tsx')"}
    - Input.tsx {icon:"file" on:click="file.open('Input.tsx')"}
  - pages/ {icon:"folder"}
    - [index.tsx]{icon:"file" selected on:click="file.open('index.tsx')"}
    - login.tsx {icon:"file" on:click="file.open('login.tsx')"}
- package.json {icon:"file" disabled}
```

#### コード生成マッピング

| ターゲット | Tree | TreeItem（子あり） | TreeItem（葉） |
| --- | --- | --- | --- |
| next-shadcn | `<ul>` + Tailwind（shadcn 未収録） | `<li>` + `<details>` | `<li>` |
| tailwind-plain | `<ul role="tree">` | `<li role="treeitem">` + `<ul>` | `<li role="treeitem">` |
| sveltekit | `<ul role="tree">` | `<li role="treeitem">` + `<ul>` | `<li role="treeitem">` |

> next-shadcn は shadcn/ui に Tree が存在しないため `<ul>` + Tailwind で出力する。
> shadcn に Tree が追加された時点で置き換える。

---

### 2.9 Panes / Pane

#### 全体構文

```markdown
## <ラベル> {.panes <direction>}

### <ペイン名> {.pane <size>}

（ペイン内コンテンツ）

### <ペイン名> {.pane <size>}

（ペイン内コンテンツ）
```

#### ルール

- H2（`##`）に `.panes` クラスを付与すると **Panes** ノードに昇格する。
- Panes 直下の H3（`###`）が **Pane** になる。
- `.panes` 外の H3 `{.pane}` は lint 警告。
- Pane 内にさらに `.panes` を持つ H2 を include で埋め込むことで、ネストレイアウトを表現できる。

#### Panes 属性キー

| キー | 値 | 説明 |
| --- | --- | --- |
| `horizontal`（既定） | — | ペインを左右に並べる |
| `vertical` | — | ペインを上下に並べる |

`horizontal` / `vertical` はクラス形式（`.horizontal` ではなく `horizontal` と書く）で指定する。

```markdown
## 左右分割 {.panes horizontal}
## 上下分割 {.panes vertical}
## 左右分割（省略）{.panes}
```

#### Pane 属性キー

| キー | 型 | 説明 |
| --- | --- | --- |
| `w` | number（px） | 固定幅。`horizontal` レイアウトで有効 |
| `h` | number（px） | 固定高。`vertical` レイアウトで有効 |
| `flex` | number | フレックス係数（既定: `1`）。残りスペースを比率で分配 |
| `collapsed` | boolean | 初期状態を折りたたみにする |

- `w` / `h` と `flex` は排他。両方指定した場合は lint 警告。
- サイズ指定なしの場合は `flex:1` として扱う。

#### 例：3ペインレイアウト

```markdown
## ワークスペース {.panes horizontal}

### サイドバー {.pane w:240}

#### ファイルツリー {.tree}

- src/ {icon:"folder"}
  - components/ {icon:"folder"}
  - pages/ {icon:"folder"}

### メインエリア {.pane flex:1}

```include
path: ./components/Editor.md
```

### ヘルプパネル {.pane w:320 collapsed}

```include
path: ./components/HelpPanel.md
```
```

#### 例：ネストペイン

```markdown
## レイアウト {.panes horizontal}

### 左 {.pane w:240}

```include
path: ./components/FileTree.md
```

### 右 {.pane flex:1}

```include
path: ./layout/RightPane.md
```
```

```markdown
## 右ペイン内 {.panes vertical}

### エディタ {.pane flex:1}

```include
path: ./components/Editor.md
```

### ターミナル {.pane h:200}

```include
path: ./components/Terminal.md
```
```

#### コード生成マッピング

| ターゲット | Panes コンテナ | Pane（固定） | Pane（flex） |
| --- | --- | --- | --- |
| next-shadcn | `<ResizablePanelGroup>` | `<ResizablePanel defaultSize={n}>` | `<ResizablePanel>` |
| tailwind-plain | `<div class="flex">` | `<div style="width:Npx">` | `<div class="flex-1">` |
| sveltekit | `<div class="flex">` | `<div style="width:Npx">` | `<div class="flex-1">` |

- `vertical` の場合は `flex-col` を付与し `w` → `h` に読み替える。
- next-shadcn はペイン間に `<ResizableHandle />` を自動挿入する（`react-resizable-panels` ベース）。

---

### 2.10 Checkbox

**構文**

```markdown
[x] ラベル {name:"agree" required}
[ ] ラベル {name:"newsletter" disabled}
```

- `[x]` が checked、`[ ]` が unchecked 状態を表す。
- GFM タスクリスト風の記法で、Button／Input と区別できる。
- 属性は `{...}` で後置する。

**サポート属性キー**

| キー | 型 | 説明 |
| --- | --- | --- |
| `name` | string | フォームフィールド名 |
| `required` | boolean | 必須 |
| `disabled` | boolean | 無効状態 |

**例**

```markdown
[x] 利用規約に同意する {name:"agree" required}
[ ] メールマガジンを受け取る {name:"newsletter"}
[ ] 広告のパーソナライズを許可 {name:"ads" disabled}
```

**コード生成マッピング**

| ターゲット | 出力 |
| --- | --- |
| next-shadcn | `<Checkbox id="..." name="..." />` + `<Label>` |
| tailwind-plain | `<input type="checkbox" name="..." />` + `<label>` |
| sveltekit | `<input type="checkbox" name="..." />` + `<label>` |

---

### 2.11 RadioGroup

**構文**

```markdown
## グループラベル {.radio-group name:"plan"}

- (•) 選択肢A {value:"a"}
- ( ) 選択肢B {value:"b"}
- ( ) 選択肢C {value:"c" disabled}
```

- H2 に `.radio-group` クラスを付与すると RadioGroup ノードに昇格する。
- `name` 属性でフォームグループ名を指定する。
- リスト項目の `(•)` が selected、`( )` が unselected 状態を表す。

**RadioItem 属性キー**

| キー | 型 | 説明 |
| --- | --- | --- |
| `value` | string | 送信値 |
| `disabled` | boolean | 個別に無効化 |

**例**

```markdown
## 料金プラン {.radio-group name:"plan"}

- (•) 無料 {value:"free"}
- ( ) スタンダード（¥980/月）{value:"standard"}
- ( ) プレミアム（¥1,980/月）{value:"premium"}
- ( ) エンタープライズ {value:"enterprise" disabled}
```

**コード生成マッピング**

| ターゲット | 出力 |
| --- | --- |
| next-shadcn | `<RadioGroup>` + `<RadioGroupItem value="...">` |
| tailwind-plain | `<fieldset>` + `<input type="radio" name="...">` |
| sveltekit | `<fieldset>` + `<input type="radio" name="...">` |

---

### 2.12 Select / Toggle（Input type 拡張）

既存の Input 構文（§2.5）の `type` 属性を拡張して対応する。

#### Select（ドロップダウン選択）

```markdown
[________________]{type:select name:"country" placeholder:"国を選択..."}
```

- ワイヤーフレーム用途のため、選択肢の列挙は MVP 対象外（プレースホルダ表示のみ）。
- next-shadcn: `<Select>` + `<SelectTrigger>` / `<SelectContent>`
- tailwind-plain / sveltekit: `<select>` 要素

#### Toggle / Switch（ON・OFF 切替）

```markdown
[________________]{type:toggle checked label:"ダークモード"}
[________________]{type:switch name:"notifications"}
```

- `toggle` と `switch` は同義（どちらでも可）。
- `checked` でデフォルト ON 状態を示す。
- next-shadcn: `<Switch>` + `<Label>`
- tailwind-plain / sveltekit: `<input type="checkbox" role="switch">`

**Input type 一覧（完全版）**

| type | 説明 |
| --- | --- |
| `text`（既定） | 一般テキスト入力 |
| `email` | メールアドレス |
| `password` | パスワード（マスク） |
| `number` | 数値 |
| `search` | 検索フィールド |
| `tel` | 電話番号 |
| `url` | URL |
| `date` | 日付ピッカー（ネイティブ） |
| `select` | ドロップダウン選択 |
| `toggle` / `switch` | ON/OFF トグル |

---

### 2.13 Badge

Button 構文（§2.6）の非インタラクティブ変形。`.badge` クラスを付与する。

```markdown
ステータス: [公開中]{.badge .success} [要確認]{.badge .warning}

タグ: [React]{.badge} [Tailwind]{.badge} [MVP]{.badge .blue}
```

- `on:*` イベントは付与しない（付与した場合は lint 警告）。
- コード生成マッピング：shadcn `<Badge variant="...">` / plain `<span>` + Tailwind

---

### 2.14 Tabs

**構文**

```markdown
## タブグループ名 {.tabs top}

### タブ1 {.tab selected}

タブ1のコンテンツ

### タブ2 {.tab}

タブ2のコンテンツ

### 無効タブ {.tab disabled}
```

- H2 に `.tabs` を付与すると Tabs ノードに昇格する。
- Tabs 直下の H3 が Tab になる。
- `selected` で初期表示タブを指定する（複数指定した場合は先頭が優先、lint 警告）。

**Tabs の位置指定**

`.tabs` の後にキーワードでタブバーの位置を指定する（Panes の `horizontal`/`vertical` と同じ方式）。

| キーワード | タブバー位置 | 主な用途 |
| --- | --- | --- |
| `top`（既定・省略可） | 上 | 一般的な水平タブ |
| `bottom` | 下 | モバイルボトムナビ |
| `left` | 左 | VS Code 風サイドバータブ |
| `right` | 右 | 右サイドバータブ |

```markdown
## 設定 {.tabs}            ← top 省略形
## 設定 {.tabs top}        ← 明示
## ナビ {.tabs bottom}     ← モバイル風
## サイドバー {.tabs left} ← VS Code 風
```

**Tab 属性キー**

| キー | 型 | 説明 |
| --- | --- | --- |
| `selected` | boolean | 初期表示タブ |
| `disabled` | boolean | 無効状態 |

**例：上タブ（設定画面）**

```markdown
## 設定 {.tabs top}

### 一般 {.tab selected}

[________________]{type:text placeholder:"ユーザー名"}
[________________]{type:email placeholder:"メールアドレス"}

### セキュリティ {.tab}

[________________]{type:password placeholder:"現在のパスワード"}
[________________]{type:password placeholder:"新しいパスワード"}

### 通知 {.tab}

[x] メール通知 {name:"email-notify"}
[x] プッシュ通知 {name:"push-notify"}
```

**例：下タブ（モバイルナビ）**

````markdown
## ナビゲーション {.tabs bottom}

### ホーム {.tab selected}

```include
path: ./screens/Home.md
```

### 検索 {.tab}

```include
path: ./screens/Search.md
```

### プロフィール {.tab}

```include
path: ./screens/Profile.md
```
````

**コード生成マッピング**

| ターゲット | top / bottom | left / right |
| --- | --- | --- |
| next-shadcn | `<Tabs>` + `orientation="horizontal"` | `<Tabs>` + `orientation="vertical"` + `className="flex"` |
| tailwind-plain | `flex-col`（top）/ `flex-col-reverse`（bottom） | `flex-row`（left）/ `flex-row-reverse`（right） |
| sveltekit | `flex-col`（top）/ `flex-col-reverse`（bottom） | `flex-row`（left）/ `flex-row-reverse`（right） |

---

### 2.15 Accordion

**構文**

```markdown
## セクション名 {.accordion}

### 項目タイトル {.accordion-item}

項目の内容

### 折りたたみ項目 {.accordion-item collapsed}

折りたたまれた状態の内容

### 無効項目 {.accordion-item disabled}

表示されない内容
```

- H2 に `.accordion` を付与すると Accordion ノードに昇格する。
- Accordion 直下の H3 が AccordionItem になる。
- `collapsed` で初期状態を閉じた状態にする（既定は開いた状態）。

**AccordionItem 属性キー**

| キー | 型 | 説明 |
| --- | --- | --- |
| `collapsed` | boolean | 初期状態を折りたたむ |
| `disabled` | boolean | 無効状態（展開不可） |

**例**

```markdown
## よくある質問 {.accordion}

### ForgeMark とは何ですか？ {.accordion-item}

Markdown でUIスケルトンを記述し、VS Code でライブプレビューしながら
実装コードへハンドオフできるツールです。

### どのフレームワークに対応していますか？ {.accordion-item collapsed}

Next.js（App Router）、SvelteKit、Tailwind CSS 素出力に対応しています。

### 価格はいくらですか？ {.accordion-item collapsed}

オープンソースで無料です。
```

**コード生成マッピング**

| ターゲット | 出力 |
| --- | --- |
| next-shadcn | `<Accordion>` + `<AccordionItem>` + `<AccordionTrigger>` + `<AccordionContent>` |
| tailwind-plain | `<details>` + `<summary>` |
| sveltekit | `<details>` + `<summary>` |

---

### 2.16 Breadcrumb

**構文**

```markdown
## ナビゲーションパス {.breadcrumb}

- [ホーム]{on:click="nav.push('/')"}
- [ドキュメント]{on:click="nav.push('/docs')"}
- [コンポーネント]{on:click="nav.push('/docs/components')"}
- 現在のページ
```

- H2 に `.breadcrumb` を付与すると Breadcrumb ノードに昇格する。
- リスト項目が BreadcrumbItem になる。
- `on:click` なしの項目は現在地（リンクなし）として扱う。
- セパレータ（`/` や `›`）はコード生成時に自動挿入する。

**BreadcrumbItem 属性キー**

| キー | 型 | 説明 |
| --- | --- | --- |
| `on:click` | string | クリック時のスタブ識別子 |
| `disabled` | boolean | 無効（クリック不可） |

**例**

```markdown
## パンくず {.breadcrumb}

- [ホーム]{on:click="nav.home()"}
- [設定]{on:click="nav.settings()"}
- アカウント設定
```

**コード生成マッピング**

| ターゲット | 出力 |
| --- | --- |
| next-shadcn | `<Breadcrumb>` + `<BreadcrumbList>` + `<BreadcrumbItem>` + `<BreadcrumbSeparator>` |
| tailwind-plain | `<nav aria-label="breadcrumb">` + `<ol>` + `<li>` + `<span aria-current="page">` |
| sveltekit | `<nav aria-label="breadcrumb">` + `<ol>` + `<li>` |

---

### 2.17 Dropdown

H2 のラベルがトリガーボタンになり、クリックで浮遊リストを表示する。
MenuBar の Menu 単体版。セパレータ・disabled・icon 属性はそのまま流用できる。

```markdown
## アクション▼ {.dropdown}

- [編集]{on:click="item.edit()"}
- [複製]{on:click="item.copy()"}

---

- [削除]{on:click="item.delete()" .danger}
```

**DropdownItem 属性キー**（MenuItem と同じ）

| キー | 型 | 説明 |
| --- | --- | --- |
| `on:click` | string | クリック時のスタブ識別子 |
| `shortcut` | string | ショートカット表示文字列 |
| `icon` | string | アイコン識別子 |
| `disabled` | boolean | 無効状態 |

**コード生成マッピング**

| ターゲット | トリガー | コンテナ | アイテム | セパレータ |
| --- | --- | --- | --- | --- |
| next-shadcn | `<DropdownMenuTrigger>` | `<DropdownMenuContent>` | `<DropdownMenuItem>` | `<DropdownMenuSeparator />` |
| tailwind-plain | `<button>` | `<ul role="menu">` | `<li role="menuitem">` | `<li role="separator" />` |
| sveltekit | `<button>` | `<ul role="menu">` | `<li role="menuitem">` | `<li role="separator" />` |

---

### 2.18 Listbox

選択可能な項目リスト。`multiple` 属性で複数選択に切り替える。

```markdown
## ファイル一覧 {.listbox multiple}

- document.md {selected}
- readme.txt {on:click="list.select('readme')"}
- config.json {disabled}
```

**Listbox 属性キー**

| キー | 型 | 説明 |
| --- | --- | --- |
| `multiple` | boolean | 複数選択を有効にする |

**ListboxItem 属性キー**

| キー | 型 | 説明 |
| --- | --- | --- |
| `selected` | boolean | 選択状態 |
| `on:click` | string | クリック時のスタブ識別子 |
| `disabled` | boolean | 無効状態 |
| `icon` | string | アイコン識別子 |

**コード生成マッピング**

| ターゲット | 出力 |
| --- | --- |
| next-shadcn | shadcn 未収録のため `<ul role="listbox">` + `<li role="option" aria-selected>` |
| tailwind-plain | `<ul role="listbox">` + `<li role="option">` |
| sveltekit | `<ul role="listbox">` + `<li role="option">` |

---

### 2.19 Toolbar

ボタン・ツール群を水平に並べたバー。`---` でグループを区切る。

```markdown
## ツールバー {.toolbar}

- [新規]{icon:"new" on:click="file.new()" shortcut:"Ctrl+N"}
- [開く]{icon:"open" on:click="file.open()"}
- [保存]{icon:"save" on:click="file.save()" shortcut:"Ctrl+S"}

---

- [元に戻す]{icon:"undo" on:click="edit.undo()" disabled}
- [やり直し]{icon:"redo" on:click="edit.redo()" disabled}

---

- [切り取り]{icon:"cut" on:click="edit.cut()"}
- [コピー]{icon:"copy" on:click="edit.copy()"}
- [貼り付け]{icon:"paste" on:click="edit.paste()"}
```

**ToolbarItem 属性キー**

| キー | 型 | 説明 |
| --- | --- | --- |
| `icon` | string | アイコン識別子 |
| `on:click` | string | クリック時のスタブ識別子 |
| `shortcut` | string | ショートカット表示文字列（ツールチップに表示） |
| `disabled` | boolean | 無効状態 |
| `checked` | boolean | トグルボタンの押下状態 |

- `---` はグループセパレータ（`<Separator>` / `<div role="separator">`）として出力する。

**コード生成マッピング**

| ターゲット | 出力 |
| --- | --- |
| next-shadcn | `<ToggleGroup>` or `<div role="toolbar">` + shadcn `<Button size="icon">` |
| tailwind-plain | `<div role="toolbar">` + `<button>` |
| sveltekit | `<div role="toolbar">` + `<button>` |

---

### 2.20 StatusBar

画面下部に固定表示するステータス情報バー。`.left` / `.right` で配置を指定する。

```markdown
## ステータスバー {.statusbar}

- 準備完了 {.left}
- ブランチ: main {.left on:click="git.branch()"}
- エラー 0  警告 2 {.left on:click="problems.show()"}
- 行: 42, 列: 15 {.right on:click="cursor.jump()"}
- UTF-8 {.right on:click="encoding.change()"}
- LF {.right on:click="eol.change()"}
```

**StatusBar 属性キー**

| キー | 型 | 説明 |
| --- | --- | --- |
| `dir` | string | `ltr`（既定）/ `rtl` |

**StatusItem 属性キー**

| キー | 型 | 説明 |
| --- | --- | --- |
| `.left` | — | 左寄せ（既定） |
| `.right` | — | 右寄せ（flex-end 側に配置） |
| `on:click` | string | クリック時のスタブ識別子 |
| `disabled` | boolean | 非インタラクティブ（クリック不可） |

- `.left` と `.right` が混在する場合、左グループ・右グループに分離して出力する。

**コード生成マッピング**

| ターゲット | 出力 |
| --- | --- |
| next-shadcn | `<footer>` + `<div class="flex justify-between">` + `<div class="flex gap-2">` |
| tailwind-plain | `<footer role="status">` + `<div class="flex justify-between">` |
| sveltekit | `<footer role="status">` + `<div class="flex justify-between">` |

### 2.21 Textarea

複数行テキスト入力。`Input` の `type` 拡張。`rows` で表示行数を指定する。

#### 全体構文

```
[____]{type:textarea rows:4 placeholder:"メモを入力"}
```

#### 属性キー

| キー | 型 | 説明 |
| --- | --- | --- |
| `type` | `textarea` | （必須）Textarea を識別 |
| `rows` | number | 表示行数（既定 3） |
| `placeholder` | string | 空欄時のヒント文字列 |
| `required` | boolean | 入力必須 |
| `disabled` | boolean | 非活性 |
| `readonly` | boolean | 読み取り専用 |
| `name` | string | フォームフィールド名 |
| `id` | string | 識別子 |
| `class` | — | 追加クラス |
| `dir` | string | `auto`（既定）/ `ltr` / `rtl` |

#### ルール

- `type:textarea` を持つ `Input` ノードは AST で `Textarea` として扱う。
- `rows` 未指定時は既定値 3 を設定する。

#### コード生成マッピング

| ターゲット | 出力 |
| --- | --- |
| next-shadcn | `<Textarea rows={4} placeholder="..." />` （shadcn/ui） |
| tailwind-plain | `<textarea rows="4" class="..." />` |
| sveltekit | `<textarea rows={4} class="..." />` |

---

### 2.22 Range / Slider

数値範囲入力。`Input` の `type` 拡張。

#### 全体構文

```
[____]{type:range min:0 max:100 value:50 step:1}
```

#### 属性キー

| キー | 型 | 説明 |
| --- | --- | --- |
| `type` | `range` | （必須）Range を識別 |
| `min` | number | 最小値（既定 0） |
| `max` | number | 最大値（既定 100） |
| `value` | number | 初期値 |
| `step` | number | ステップ（既定 1） |
| `disabled` | boolean | 非活性 |
| `name` | string | フォームフィールド名 |
| `id` | string | 識別子 |
| `dir` | string | `auto`（既定）/ `ltr` / `rtl` |

#### コード生成マッピング

| ターゲット | 出力 |
| --- | --- |
| next-shadcn | `<Slider min={0} max={100} defaultValue={[50]} step={1} />` （shadcn/ui） |
| tailwind-plain | `<input type="range" min="0" max="100" value="50" />` |
| sveltekit | `<input type="range" min={0} max={100} bind:value />` |

---

### 2.23 Combobox

テキスト入力と候補一覧を組み合わせたコンボボックス。`Input` の `type` 拡張。

#### 全体構文

```
[____]{type:combobox placeholder:"フレームワーク選択" name:"framework"}

- React {value:"react"}
- Vue {value:"vue"}
- Svelte {value:"svelte"}
```

#### ルール

- `type:combobox` の直後に続くリストが候補 (option) として扱われる。
- リストが省略された場合、候補なし・空コンボボックスを生成する。

#### 属性キー（Input）

| キー | 型 | 説明 |
| --- | --- | --- |
| `type` | `combobox` | （必須）Combobox を識別 |
| `placeholder` | string | 空欄時のヒント |
| `name` | string | フォームフィールド名 |
| `disabled` | boolean | 非活性 |
| `id` | string | 識別子 |

#### 属性キー（オプション項目リスト）

| キー | 型 | 説明 |
| --- | --- | --- |
| `value` | string | 送信値 |
| `selected` | boolean | 初期選択 |
| `disabled` | boolean | 選択不可 |

#### コード生成マッピング

| ターゲット | 出力 |
| --- | --- |
| next-shadcn | `<Combobox>` + `<CommandInput>` + `<CommandItem>` （shadcn/ui） |
| tailwind-plain | `<input list="..."><datalist>` |
| sveltekit | `<input list="..."><datalist>` |

---

### 2.24 Progress

進捗表示バー。`Input` の `type` 拡張（非インタラクティブ）。

#### 全体構文

```
[____]{type:progress value:75 max:100}
```

#### 属性キー

| キー | 型 | 説明 |
| --- | --- | --- |
| `type` | `progress` | （必須）Progress を識別 |
| `value` | number | 現在値（0–max） |
| `max` | number | 最大値（既定 100） |
| `id` | string | 識別子 |
| `class` | — | 追加クラス |

#### ルール

- `value` 未指定または省略時は不定状態（indeterminate）とする。
- Progress は非インタラクティブ。`on:click` 等のイベント属性は無視する。

#### コード生成マッピング

| ターゲット | 出力 |
| --- | --- |
| next-shadcn | `<Progress value={75} />` （shadcn/ui） |
| tailwind-plain | `<progress value="75" max="100" class="..." />` |
| sveltekit | `<progress value={75} max={100} class="..." />` |

---

### 2.25 Spinner

処理中を示すローディングインジケータ。`Button` の非インタラクティブ変形。

#### 全体構文

```
[~]{.spinner}
[~]{.spinner size:24}
```

#### 属性キー

| キー | 型 | 説明 |
| --- | --- | --- |
| `size` | number | アイコンサイズ px（既定 16） |
| `class` | — | 追加クラス |

#### ルール

- `[~]` はSpinner専用の糖衣。`~` はプレースホルダ文字（ラベルなし）。
- `.spinner` クラスが付与された `Button` ノードは AST で `Spinner` として昇格する。
- `on:click` 等のイベント属性は lint 警告。

#### コード生成マッピング

| ターゲット | 出力 |
| --- | --- |
| next-shadcn | `<Loader2 className="animate-spin" size={16} />` （lucide-react） |
| tailwind-plain | `<div role="status" class="animate-spin ..."></div>` |
| sveltekit | `<div role="status" class="animate-spin ..."></div>` |

---

### 2.26 Alert

インラインアラートメッセージ。`Card` の `.alert` バリアント。

#### 全体構文

```
## ラベル {.alert .info}

メッセージテキスト。{.text-sm}
```

バリアントクラス: `.info`（既定）/ `.success` / `.warning` / `.error`

#### ルール

- `.alert` クラスが付与された H2 ノードは `Card` の `Alert` バリアントとして扱う。
- バリアントクラスは1つのみ指定可。複数指定時は先頭のみ有効、lint 警告。
- ラベルはアラートのタイトルとして出力する。ラベルが空の場合はバリアント名を既定タイトルとする。

#### コード生成マッピング

| ターゲット | 出力 |
| --- | --- |
| next-shadcn | `<Alert variant="destructive">` + `<AlertTitle>` + `<AlertDescription>` （shadcn/ui） |
| tailwind-plain | `<div role="alert" class="border rounded p-4 ...">` |
| sveltekit | `<div role="alert" class="border rounded p-4 ...">` |

---

### 2.27 Divider

コンテンツを区切る水平線。トップレベルまたは Card 直下に配置する。

#### 全体構文

```
---
```

#### ルール

- `---` は Markdown の thematic break と同じ記法。
- コンテキストによって異なるノードに変換される:

| コンテキスト（親） | 変換先 |
| --- | --- |
| Menu 直下 | MenuSeparator |
| Toolbar 直下 | ToolbarSeparator |
| Dropdown 直下 | DropdownSeparator |
| それ以外 | Divider |

- Divider に属性を付与する構文はない（`---{...}` は lint エラー）。

#### コード生成マッピング

| ターゲット | 出力 |
| --- | --- |
| next-shadcn | `<Separator />` （shadcn/ui） |
| tailwind-plain | `<hr class="border-border my-2" />` |
| sveltekit | `<hr class="border-border my-2" />` |

---

### 2.28 Image

画像埋め込み。Markdown image 記法を拡張し `{...}` 属性ブロックを付与する。

#### 全体構文

```
![alt テキスト](./path/to/image.png){w:320 h:240}
![ロゴ](./logo.svg){w:100 class:"mx-auto"}
```

- パスは相対パス（ワークスペースルートからの相対）または URL。

#### 属性キー

| キー | 型 | 説明 |
| --- | --- | --- |
| `w` | number / string | 幅（px または CSS 値） |
| `h` | number / string | 高さ（px または CSS 値） |
| `class` | — | 追加クラス |
| `alt` | string | alt テキスト（`![...]` 内容を上書き） |
| `id` | string | 識別子 |
| `dir` | string | `auto`（既定）/ `ltr` / `rtl` |

#### ルール

- 標準 Markdown image 記法（`![alt](src)`）に `{...}` を後置するだけで有効。
- `{...}` 省略時は通常の Markdown image として扱う（サイズ指定なし）。
- プレビューでは `<img>` タグとして出力し `style="width:320px;height:240px"` を付与する。

#### コード生成マッピング

| ターゲット | 出力 |
| --- | --- |
| next-shadcn | `<Image src="..." alt="..." width={320} height={240} />` （next/image） |
| tailwind-plain | `<img src="..." alt="..." class="w-[320px] h-[240px]" />` |
| sveltekit | `<img src="..." alt="..." class="w-[320px] h-[240px]" />` |

---

### 2.29 Avatar

ユーザーアイコン。`Image` の `.avatar` バリアント。

#### 全体構文

```
![ユーザー名](./avatar.png){.avatar size:40}
![John](./john.jpg){.avatar size:56 class:"ring-2 ring-primary"}
```

#### 属性キー

| キー | 型 | 説明 |
| --- | --- | --- |
| `.avatar` | — | Avatar であることを示すクラス（必須） |
| `size` | number | 直径 px（既定 32） |
| `class` | — | 追加クラス |
| `alt` | string | スクリーンリーダー用代替テキスト |
| `id` | string | 識別子 |

#### ルール

- `.avatar` クラスが付与された Image ノードは AST で `Avatar` として昇格する。
- `size` は `w` / `h` の両方に適用される（正円）。
- 画像 src が省略・未解決の場合、イニシャルフォールバックを出力する（`alt` 先頭1文字）。

#### コード生成マッピング

| ターゲット | 出力 |
| --- | --- |
| next-shadcn | `<Avatar>` + `<AvatarImage>` + `<AvatarFallback>` （shadcn/ui） |
| tailwind-plain | `<img class="rounded-full w-10 h-10 object-cover" />` |
| sveltekit | `<img class="rounded-full w-10 h-10 object-cover" />` |

---

### 2.30 Grid

CSS Grid ベースのレイアウトコンテナ。H2 + `.grid` で定義する。

#### 全体構文

```
## ダッシュボード {.grid cols:3 gap:16}

### カード1 {.card}

内容A

### カード2 {.card}

内容B

### カード3 {.card}

内容C
```

#### 属性キー

| キー | 型 | 説明 |
| --- | --- | --- |
| `cols` | number | 列数（既定 1） |
| `gap` | number | グリッドギャップ px（既定 0） |
| `class` | — | 追加クラス |
| `dir` | string | `auto`（既定）/ `ltr` / `rtl` |

#### Grid セル（H3）属性キー

| キー | 型 | 説明 |
| --- | --- | --- |
| `span` | number | 列スパン数（既定 1） |
| `row-span` | number | 行スパン数（既定 1） |
| `class` | — | 追加クラス |

#### ルール

- `.grid` クラスを持つ H2 ノードはコンテナとして扱い、直下の H3 が Grid セルになる。
- `cols` 省略時は `grid-cols-1` を出力する。

#### コード生成マッピング

| ターゲット | 出力 |
| --- | --- |
| next-shadcn | `<div class="grid grid-cols-3 gap-4">` |
| tailwind-plain | `<div class="grid grid-cols-3 gap-4">` |
| sveltekit | `<div class="grid grid-cols-3 gap-4">` |

---

### 2.31 Table

データテーブル。H2 + `.table` で定義し、直下に標準 Markdown テーブルを配置する。

#### 全体構文

```
## ユーザー一覧 {.table striped}

| 名前 | メール | 役割 |
| --- | --- | --- |
| 山田 | yamada@example.com | admin |
| 鈴木 | suzuki@example.com | user |
```

#### 属性キー

| キー | 型 | 説明 |
| --- | --- | --- |
| `striped` | boolean | 奇偶行の背景色交互（ゼブラ） |
| `bordered` | boolean | セル枠線 |
| `hoverable` | boolean | ホバー行ハイライト |
| `compact` | boolean | セルパディング縮小 |
| `class` | — | 追加クラス |
| `dir` | string | `auto`（既定）/ `ltr` / `rtl` |

#### ルール

- `.table` クラスを持つ H2 の直後に Markdown テーブル（`| ... |`）が続く場合に Table ノードを生成する。
- Markdown テーブルが続かない場合は lint 警告。
- ヘッダ行（最初の行）は `<thead>`、残りは `<tbody>` に出力する。

#### コード生成マッピング

| ターゲット | 出力 |
| --- | --- |
| next-shadcn | `<Table>` + `<TableHeader>` + `<TableRow>` + `<TableCell>` （shadcn/ui） |
| tailwind-plain | `<table class="...">` + `<thead>` + `<tbody>` |
| sveltekit | `<table class="...">` + `<thead>` + `<tbody>` |

---

### 2.32 Skeleton

ローディングプレースホルダ。任意のノードに `.skeleton` クラスを付与する。

#### 全体構文

```
[____]{type:text .skeleton}
[ラベル]{.btn .skeleton}
## カード {.card .skeleton}
![alt](./img.png){.avatar size:40 .skeleton}
```

#### ルール

- `.skeleton` は独立したノード型ではなく、既存ノードへのクラス修飾子として扱う。
- `.skeleton` が付与されたノードはプレビューで pulse アニメーションのグレーブロックとして表示される。
- 子コンテンツは出力しない（空シェルのみ）。
- コード生成では `<Skeleton />` ラッパーで包むか、クラスのみ付与する。

#### コード生成マッピング

| ターゲット | 出力 |
| --- | --- |
| next-shadcn | 対象ノードを `<Skeleton className="..." />` で置換（shadcn/ui） |
| tailwind-plain | 対象ノードに `class="animate-pulse bg-muted rounded"` を付与 |
| sveltekit | 対象ノードに `class="animate-pulse bg-muted rounded"` を付与 |

---

## 3. include

### 3.1 正規形（フェンスド）

````markdown
```include
path: ./relative/path/to.md
as: block
dir: auto
class: .right .gap-12
---
[コンポーネントを読み込めませんでした]{.text-error}
```
````

**サポートキー**

| キー | 必須 | 既定値 | 値 |
| --- | --- | --- | --- |
| `path` | ✅ | — | 相対パス（ワークスペースルートからの相対） |
| `as` | — | `block` | `block` / `inline` |
| `dir` | — | `auto` | `auto` / `ltr` / `rtl` |
| `class` | — | — | `.className` 形式のクラス文字列 |

- 未知キーは lint 警告。
- `---` 以降はフォールバックコンテンツ（Markdown）。`path` が見つからない場合にレンダリングされる。

**フォールバック動作**

| 状況 | フォールバックあり | フォールバックなし |
| --- | --- | --- |
| `path` が存在しない | フォールバックをレンダリング | `[missing: ./path]` プレースホルダ＋lint error |
| `path` の読み込み失敗 | フォールバックをレンダリング | `[missing: ./path]` プレースホルダ＋lint error |
| `path` が存在する | フォールバック無視・正常展開 | — |

### 3.2 糖衣形（1行）

````markdown
```include path="./dialogs/ok_btn.md"```
````

- キーは `key="value"` 形式（属性形式）。正規形の `key: value`（YAML形式）とは異なる。
- 複数キー：`path="..." as="inline" dir="rtl"` のようにスペース区切り。
- 保存時に正規形へ自動整形（既定 ON）。設定 `forgemark.formatOnSave: false` で無効化可能。

### 3.3 インライン展開

`as: inline` を指定すると Row の列内に埋め込める。

````markdown
[[
```include
path: ./ok_btn.md
as: inline
```
|
```include
path: ./cancel_btn.md
as: inline
```
]]{.row .right .gap-8}
````

- `as: block` の include を Row 列に配置すると lint 警告。

---

## 4. lint 警告・エラー一覧

| カテゴリ | メッセージ | Severity |
| --- | --- | --- |
| include 未知キー | `Unknown key '{key}' in include block` | Warning |
| include 不正値 | `Invalid value '{value}' for key '{key}'. Expected: {expected}` | Error |
| include 不在パス | `File not found: {path}` | Error |
| include 循環参照 | `Circular include detected: {path} → ... → {path}` | Error |
| include path 必須 | `'path' is required in include block` | Error |
| `as:block` in Row | `Inline include required inside Row (use as: inline)` | Warning |
| 未サポートイベント | `Unsupported event '{event}'. Supported: on:click, on:change, on:submit` | Warning |
| 複数 Screen | `Only one H1 per file is allowed as Screen` | Warning |
| MenuBar外の H3 | `H3 is only valid inside a MenuBar (## {.menubar})` | Warning |
| MenuItem 不正属性 | `Invalid attribute '{key}' for MenuItem. Allowed: on:click, shortcut, disabled` | Warning |
| パース失敗 | `Failed to parse node, treating as Unknown: {raw}` | Warning |

---

## 5. ファイル構成の慣例

ForgeMark ファイルは通常 `.md` 拡張子を使用する。
標準 Markdown リンターとの衝突（`MD032` など）は `.markdownlint.json` でプロジェクトルートに設定を置いて抑制する。

```text
ui/
├─ main.md              ← Screen + include で画面を組み立てる
├─ components/          ← 再利用コンポーネント（H1 なし）
│   ├─ AppHeader.md
│   └─ FormLogin.md
└─ dialogs/             ← ダイアログ（H1 なし）
    ├─ MessageDlg.md
    ├─ ok_btn.md
    └─ cancel_btn.md
```

**推奨規則**

- `main.md` など画面エントリポイントには H1（Screen）を置く。
- `components/` や `dialogs/` 配下は include で組み込まれることを前提とし、H1 は書かない。
- ファイル名は PascalCase（コンポーネント）または kebab-case（ページ）を目安とする。

---

## 6. 完全な構文例

### 6.1 ログイン画面（main.md）

```markdown
# /login {.screen .desktop}

```include
path: ./components/AppHeader.md
```

## ログインフォーム {.card .w-400 .mx-auto .mt-24 .shadow}

```include
path: ./components/FormLogin.md
```

```include
path: ./dialogs/ErrorDlg.md
```
```

### 6.2 メニューバーを含むヘッダー（AppHeader.md）

```markdown
## ヘッダー {.row .align-center .px-16 .py-8 .border-b}

[[ AppName | スペース | [ヘルプ]{.btn .ghost .text-sm} ]]{.row .align-center .gap-8}

## メニュー {.menubar}

### &File

- [新規作成]{on:click="file.new()" shortcut:"Ctrl+N"}
- [開く]{on:click="file.open()" shortcut:"Ctrl+O"}

---

- [終了]{on:click="app.quit()"}

### &Help

- [About]{on:click="help.about()"}
```

### 6.3 フォームコンポーネント（FormLogin.md）

```markdown
## ログイン

メールアドレスとパスワードを入力してください。{.text-sm .muted .mb-16}

[________________]{type:email required placeholder:"メールアドレス"}

[________________]{type:password required placeholder:"パスワード"}

[[ スペース | [ログイン]{.btn .primary on:click="auth.login()"} ]]{.row .right .gap-8 .mt-16}
```

### 6.4 インラインボタンを含むダイアログ（ErrorDlg.md）

```markdown
## エラー {.dialog .w-360}

ログインに失敗しました。{.text-sm}

[[
```include
path: ./retry_btn.md
as: inline
```
|
```include
path: ./cancel_btn.md
as: inline
```
]]{.row .right .gap-8 .mt-16}
```

### 6.5 ボタン単体（retry_btn.md）

```markdown
[再試行]{.btn .primary on:click="dlg.close('retry')"}
```
