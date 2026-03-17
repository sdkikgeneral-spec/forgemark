# ForgeMark

> Markdown だけで UI スケルトンを記述し、VS Code でライブプレビューしながら実装コードへハンドオフする。

---

## Overview

ForgeMark は、UI 設計と実装の橋渡しをする Markdown 拡張ツールです。

- **記述**: 見慣れた Markdown の記法で画面構造を書く
- **確認**: VS Code のライブプレビューで即座に形を確認する
- **出力**: next-shadcn / tailwind-plain / sveltekit のコードを自動生成する

```markdown
# /login {.screen}

## ログイン {.card .w-400 .mx-auto}

[________________]{type:email required placeholder:"メールアドレス"}

[________________]{type:password required placeholder:"パスワード"}

[[ スペース | [ログイン]{.btn .primary on:click="auth.login()"} ]]{.row .right .mt-16}
```

↓ 自動生成（next-shadcn）

```tsx
// app/login/page.tsx
"use client"
export default function LoginPage({ handlers }: Props) {
  return (
    <Card className="w-[400px] mx-auto">
      <Input type="email" required placeholder="メールアドレス" />
      <Input type="password" required placeholder="パスワード" />
      <div className="flex justify-end mt-4">
        <Button onClick={() => handlers["auth.login"]?.()}>ログイン</Button>
      </div>
    </Card>
  )
}
```

---

## 特徴

| 機能 | 説明 |
| --- | --- |
| **記号主義の構文** | `#`, `[]`, `[[...]]`, `{.class key:value}` だけで UI を表現 |
| **include 分割** | 画面・コンポーネント・ダイアログを別ファイルに分割して管理 |
| **循環検出** | include 参照の循環・不在パスをリアルタイムで診断 |
| **差分レンダリング** | 変更部分のみ再描画（目標 100ms 以内） |
| **コード生成** | Next.js + shadcn/ui / Tailwind 素出力 / SvelteKit に対応 |
| **多言語対応** | 表示テキストは UTF-8 任意言語、RTL は `dir:rtl` で明示 |

---

## クイックスタート

### 1. インストール

```bash
# 拡張のインストール（VS Code Marketplace から）
code --install-extension forgemark.forgemark

# または VSIX から手動インストール
code --install-extension forgemark-0.1.0.vsix
```

### 2. サンプルを開く

```bash
git clone https://github.com/your-org/forgemark
cd forgemark
code examples/login/main.md
```

VS Code が起動したら、右上の「ForgeMark: プレビュー」ボタンをクリックします。
左にエディタ、右にプレビューが並んで表示されます。

### 3. コードを生成する

エディタ上で右クリック → **「コードへ変換」** → ターゲット（`next-shadcn` など）を選択します。
差分エディタで内容を確認し、「適用」を押すと `./generated/` にファイルが書き出されます。

---

## 構文チートシート

```markdown
# /route {.screen}                  ← 画面（H1）
## ラベル {.card .w-400}             ← カード（H2）
[[ A | B | C ]]{.row .gap-8}        ← 行レイアウト
[ラベル]{.btn .primary on:click="f()"} ← ボタン
[________________]{type:email required}  ← 入力
[x] 同意する {name:"agree"}          ← チェックボックス

## メニュー {.menubar}               ← メニューバー
### &File                           ← メニュー（Alt+F）
- [新規作成]{shortcut:"Ctrl+N" on:click="file.new()"}
---                                 ← セパレーター

## サイドバー {.panes horizontal}    ← ペイン
### 左 {.pane w:220}
### 右 {.pane flex:1}

## タブ {.tabs top}                  ← タブ
### 概要 {.tab selected}
### 詳細 {.tab}

![ユーザー](./avatar.jpg){.avatar size:40}  ← アバター
[____]{type:range min:0 max:100 value:50}   ← スライダー
[____]{type:progress value:75}              ← プログレス
[~]{.spinner}                               ← スピナー
---                                         ← ディバイダー

## 警告 {.alert .warning}           ← アラート
メッセージ本文
```

完全なリファレンスは [docs/syntax_spec.md](docs/syntax_spec.md) を参照してください。

---

## include 分割

複数ファイルに分割して管理できます。

```markdown
# /dashboard {.screen}

```include
path: ./components/Header.md
```

```include
path: ./components/Content.md
```
```

**糖衣形**（1行）でも書けます。保存時に自動的に正規形へ整形されます。

````markdown
```include path="./components/Header.md"```
````

---

## サンプル一覧

| サンプル | 説明 | 使用プリミティブ |
| --- | --- | --- |
| [examples/login/](examples/login/) | ログイン画面 | Screen, Card, Input, Button, MenuBar, Dialog |
| [examples/dashboard/](examples/dashboard/) | プロジェクト管理ダッシュボード | Grid, Table, Tabs, Toolbar, Breadcrumb, StatusBar, Avatar, Badge, Progress |
| [examples/settings/](examples/settings/) | 設定画面（2ペイン） | Panes, Tree, Accordion, RadioGroup, Checkbox, Range, Combobox, Toggle, Alert |

---

## コード生成ターゲット

### next-shadcn（推奨）

- **出力先**: `app/(route)/page.tsx`（App Router）
- **依存**: React 19 / Next.js 15 / Tailwind CSS v4 / shadcn/ui
- **特徴**: TypeScript strict mode、RSC / "use client" を自動判定

### tailwind-plain

- **出力先**: `*.html`
- **依存**: Tailwind CSS v4 のみ
- **特徴**: フレームワーク非依存、アクセシビリティ属性（aria-*）付き

### sveltekit

- **出力先**: `src/routes/(route)/+page.svelte`
- **依存**: Svelte 5 / SvelteKit / Tailwind CSS v4
- **特徴**: Svelte 5 runes 構文（`$props()`, `$state()`）

---

## プリミティブ一覧

| カテゴリ | プリミティブ |
| --- | --- |
| **レイアウト** | Screen, Card, Row, Grid, Panes / Pane |
| **テキスト** | Text, Badge, Divider |
| **入力** | Input, Textarea, Select, Toggle, Range, Combobox |
| **アクション** | Button, Spinner |
| **ナビゲーション** | MenuBar, Tabs, Breadcrumb, Accordion, Dropdown, Tree |
| **一覧** | Listbox, Table, Toolbar, StatusBar |
| **フィードバック** | Progress, Alert, Skeleton |
| **メディア** | Image, Avatar |

---

## ForgeMark Studio（ノードグラフエディタ）

Markdown を書かずに、ビジュアルなノードグラフで ForgeMark の UI ツリーを組み立てられる Web アプリです。

```
┌─────────────────────────────────────────────────────────┐
│  ForgeMark Studio              [Import .fm.md] [Export] │
├──────┬──────────────────────────────────────┬───────────┤
│Nodes │                                      │Properties │
│      │  [Screen:ログイン]                    │           │
│Screen│    └──[Card:ログインフォーム]          │ type:email│
│Card  │         ├──[Input:email]              │ required:☑│
│Row   │         ├──[Input:password]           │           │
│Input │         └──[Button:サインイン]         │           │
│Button│                                      │           │
├──────┴──────────────────────────────────────┴───────────┤
│  Generated ForgeMark Markdown                           │
└─────────────────────────────────────────────────────────┘
```

### 起動方法

```bash
npm install
cd apps/studio
npx vite
# → http://localhost:5173 を開く
```

### 機能

| 機能 | 説明 |
| --- | --- |
| **ノードパレット** | 左サイドバーからクリックでキャンバスに追加 |
| **エッジ接続** | ノード同士をドラッグ接続して親子関係を構築 |
| **プロパティ編集** | 右サイドバーで選択ノードの属性をフォーム編集 |
| **Markdown生成** | 下部パネルに ForgeMark Markdown をリアルタイム表示 |
| **Import** | `.fm.md` ファイルを読み込んでグラフ化 |
| **Export** | グラフを `.fm.md` ファイルとして書き出し |

### 技術スタック

- **@xyflow/react** — ノードグラフ UI
- **Vite + React** — ビルド & UI フレームワーク
- **Tailwind CSS v4** — スタイリング
- **Zustand** — グラフ状態管理
- **@forgemark/core** — パーサー・AST（ソースを直接参照）

---

## 開発

### 要件・仕様

| ドキュメント | 内容 |
| --- | --- |
| [docs/requirements_spec.md](docs/requirements_spec.md) | 要件仕様（正本） |
| [docs/syntax_spec.md](docs/syntax_spec.md) | 構文リファレンス |
| [tests/test_spec.md](tests/test_spec.md) | テスト仕様 |

### テスト実行

```bash
# ユニット・統合テスト
npx vitest run

# カバレッジ付き
npx vitest run --coverage

# VS Code E2E テスト
npx vscode-test

# フェーズ別テスト
npx vitest run tests/unit/parser/       # Phase 1
npx vitest run tests/unit/renderer/     # Phase 2
npx vitest run tests/unit/codegen/      # Phase 4/5
```

### フェーズ別テスト計画

| フェーズ | 期間 | スコープ | シナリオ |
| --- | --- | --- | --- |
| Phase 1 | D1–D2 | パーサー / include / 依存グラフ | [scenarios.md](tests/phases/phase1-parser-include/scenarios.md) |
| Phase 2 | D3–D4 | 差分レンダリング | [scenarios.md](tests/phases/phase2-renderer/scenarios.md) |
| Phase 3 | D5–D7 | VS Code 拡張 | [scenarios.md](tests/phases/phase3-ide/scenarios.md) |
| Phase 4 | D8–D10 | コード生成（next-shadcn） | [scenarios.md](tests/phases/phase4-codegen-next/scenarios.md) |
| Phase 5 | D11–D12 | コード生成（tailwind / sveltekit） | [scenarios.md](tests/phases/phase5-codegen-tailwind/scenarios.md) |
| Phase 6 | D13–D14 | サンプル統合 / デモ | [scenarios.md](tests/phases/phase6-samples-demo/scenarios.md) |

---

## カバレッジ目標

| 対象 | 目標 |
| --- | --- |
| `src/parser/` | 90% 以上 |
| `src/codegen/` | 85% 以上 |
| `src/extension/` | 70% 以上 |

---

## ライセンス

MIT
