# Phase 6 — テストシナリオ

**対象期間**: D13–D14
**スコープ**: サンプル3画面の統合検証 / README / デモ仕上げ

---

## ギャップ分析（test_spec.md との差分）

| ギャップID | 未カバー領域 | 対応シナリオ |
| --- | --- | --- |
| G6-01 | login サンプルのフル include 展開検証 | SC-81 |
| G6-02 | dashboard サンプルの複合レンダリング | SC-82 |
| G6-03 | settings サンプルの Panes + Accordion 検証 | SC-83 |
| G6-04 | 3サンプルの next-shadcn 出力検証 | SC-84 |
| G6-05 | デモ用途のパフォーマンス通し計測 | SC-85 |
| G6-06 | README の記述内容確認（ドキュメントテスト） | SC-86 |

---

## シナリオ一覧

### SC-81: login サンプル — フル統合テスト

`examples/login/main.md` を起点に全 include を展開し、合成 AST と生成コードを検証する。

#### AST 検証

| シナリオID | 検証内容 | 期待結果 |
| --- | --- | --- |
| `p6-login-ast-01` | 合成 AST のルートノード | Screen `{ route: "/login" }` |
| `p6-login-ast-02` | AppHeader.md の展開 | MenuBar が Screen 直下に存在する |
| `p6-login-ast-03` | FormLogin.md の展開 | Card 内に Input（email/password）+ Button が存在する |
| `p6-login-ast-04` | MessageDlg.md の展開 | Card（.dialog）+ Row + include inline ボタン（2件）が展開される |
| `p6-login-ast-05` | id 衝突なし | 全ノードの id が一意である |
| `p6-login-ast-06` | 依存グラフのノード数 | main + AppHeader + FormLogin + MessageDlg + ok_btn + cancel_btn = 6ファイル |

#### コード生成検証（next-shadcn）

| シナリオID | 検証内容 | 期待結果 |
| --- | --- | --- |
| `p6-login-gen-01` | 生成ファイルパス | `generated/app/login/page.tsx` |
| `p6-login-gen-02` | MenuBar の生成 | `<Menubar>` + `<MenubarMenu>` + `<MenubarItem>` |
| `p6-login-gen-03` | フォームの生成 | `<Input type="email" required>` + `<Input type="password" required>` |
| `p6-login-gen-04` | Dialog の生成 | `<Dialog>` or `<Card className="dialog">` + inline ボタン2件 |
| `p6-login-gen-05` | `tsc --strict` でエラーなし | 型エラー 0 件 |

---

### SC-82: dashboard サンプル — 複合レンダリング

`examples/dashboard/main.md` を起点に全 include を展開し、複合コンポーネントの正確な生成を検証する。

#### AST 検証

| シナリオID | 検証内容 | 期待結果 |
| --- | --- | --- |
| `p6-dash-ast-01` | Grid（cols:4）の展開 | GridCell 4件、各セルに Progress ノード |
| `p6-dash-ast-02` | Tabs（top）の展開 | Tab 3件（タスク/メンバー/アクティビティ） |
| `p6-dash-ast-03` | Tab 内の Table | Table ノードに columns:5, rows:5 |
| `p6-dash-ast-04` | Tab 内の Grid（cols:3） | GridCell 3件、各セルに Avatar + Progress |
| `p6-dash-ast-05` | Toolbar の展開 | ToolbarItem 7件、ToolbarSeparator 3件 |
| `p6-dash-ast-06` | StatusBar の展開 | StatusItem 5件（left:3, right:2） |
| `p6-dash-ast-07` | Breadcrumb の展開 | BreadcrumbItem 3件 |
| `p6-dash-ast-08` | 依存グラフのノード数 | 8ファイル、循環なし |

#### コード生成検証（next-shadcn）

| シナリオID | 検証内容 | 期待結果 |
| --- | --- | --- |
| `p6-dash-gen-01` | Grid → `grid-cols-4` | `<div className="grid grid-cols-4 gap-4">` |
| `p6-dash-gen-02` | Tabs → `<Tabs defaultValue="...">` | Tab パネル3件 |
| `p6-dash-gen-03` | Table → shadcn Table | `<Table><TableHeader>` + `<TableBody>` |
| `p6-dash-gen-04` | Avatar × 3 | `<Avatar>` + `<AvatarImage>` + `<AvatarFallback>` |
| `p6-dash-gen-05` | Badge → shadcn Badge | `<Badge>` |
| `p6-dash-gen-06` | Progress → shadcn Progress | `<Progress value={...} />` |

---

### SC-83: settings サンプル — Panes + Accordion + フォームコントロール

`examples/settings/main.md` を起点に全 include を展開し、複合レイアウトの正確な生成を検証する。

#### AST 検証

| シナリオID | 検証内容 | 期待結果 |
| --- | --- | --- |
| `p6-set-ast-01` | Panes（horizontal）の展開 | Pane 2件（w:220, flex:1） |
| `p6-set-ast-02` | Tree の展開 | TreeItem 8件（Divider 含む） |
| `p6-set-ast-03` | Accordion の展開 | AccordionItem 5件 |
| `p6-set-ast-04` | RadioGroup の展開 | RadioItem 3件（テーマ選択） |
| `p6-set-ast-05` | Checkbox の展開 | Checkbox 3件（アニメーション/高コントラスト/コンパクト） |
| `p6-set-ast-06` | Range の展開 | Range `{ min:10, max:24, value:14, step:1 }` |
| `p6-set-ast-07` | Combobox + options の展開 | options: JetBrains Mono / Fira Code / Cascadia Code / Source Code Pro |
| `p6-set-ast-08` | Toggle の展開 | Toggle `{ checked: true }` |
| `p6-set-ast-09` | Alert(.warning) の展開 | Alert `{ variant: "warning" }` |

#### コード生成検証（next-shadcn）

| シナリオID | 検証内容 | 期待結果 |
| --- | --- | --- |
| `p6-set-gen-01` | Panes → ResizablePanelGroup | `<ResizablePanelGroup direction="horizontal">` |
| `p6-set-gen-02` | Accordion → shadcn Accordion | `<Accordion type="single" collapsible>` |
| `p6-set-gen-03` | RadioGroup → shadcn RadioGroup | `<RadioGroup>` + `<RadioGroupItem>` × 3 |
| `p6-set-gen-04` | Slider（Range） → `<Slider>` | `<Slider min={10} max={24} defaultValue={[14]} step={1} />` |
| `p6-set-gen-05` | Switch（Toggle） → `<Switch>` | `<Switch defaultChecked />` |
| `p6-set-gen-06` | Combobox → shadcn Combobox | `<Command>` + `<CommandInput>` + `<CommandItem>` × 4 |

---

### SC-84: 3サンプル コード生成スナップショット

| テストID | サンプル | ターゲット | スナップショット |
| --- | --- | --- | --- |
| `p6-snap-login-next` | login | next-shadcn | `snapshots/next-shadcn/login-full.tsx` |
| `p6-snap-dashboard-next` | dashboard | next-shadcn | `snapshots/next-shadcn/dashboard-full.tsx` |
| `p6-snap-settings-next` | settings | next-shadcn | `snapshots/next-shadcn/settings-full.tsx` |
| `p6-snap-login-tw` | login | tailwind-plain | `snapshots/tailwind-plain/login-full.html` |
| `p6-snap-dashboard-tw` | dashboard | tailwind-plain | `snapshots/tailwind-plain/dashboard-full.html` |
| `p6-snap-settings-tw` | settings | tailwind-plain | `snapshots/tailwind-plain/settings-full.html` |

---

### SC-85: デモ用パフォーマンス通し計測

| シナリオID | 計測内容 | 目標値 |
| --- | --- | --- |
| `p6-perf-01` | dashboard サンプル（最大規模）の初回パース | 500ms 以内 |
| `p6-perf-02` | dashboard サンプルの差分レンダリング（ボタン1行変更） | 100ms 以内 |
| `p6-perf-03` | settings サンプルの next-shadcn 生成 | 1000ms 以内 |
| `p6-perf-04` | 全3サンプルの依存グラフ構築（合計18ファイル） | 50ms 以内 |

---

### SC-86: README ドキュメント検証

| シナリオID | 確認内容 | 合格基準 |
| --- | --- | --- |
| `p6-doc-01` | README に Overview セクションが存在する | H2 `## Overview` 以上のセクションが存在する |
| `p6-doc-02` | クイックスタート手順が存在する | インストール・起動・サンプル開始の3ステップが記述されている |
| `p6-doc-03` | 全3サンプルへのリンクが存在する | `examples/login/`, `examples/dashboard/`, `examples/settings/` へのリンク |
| `p6-doc-04` | 構文リファレンスへのリンクが存在する | `docs/syntax_spec.md` へのリンク |
| `p6-doc-05` | コントリビュートガイドが存在する | CONTRIBUTING.md または README 内セクション |

---

## テスト実装方針

- **フレームワーク**: Vitest（統合） + `@vscode/test-electron`（E2E）
- **フィクスチャ**: `examples/` フォルダを直接利用
- **スナップショット**: `tests/fixtures/snapshots/` に格納
- **実行コマンド**: `npx vitest run tests/integration/samples/`
