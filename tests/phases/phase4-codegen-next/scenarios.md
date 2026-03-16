# Phase 4 — テストシナリオ

**対象期間**: D8–D10
**スコープ**: コード生成（next-shadcn）

---

## ギャップ分析（test_spec.md との差分）

| ギャップID | 未カバー領域 | 対応シナリオ |
| --- | --- | --- |
| G4-01 | TypeScript strict mode の型定義出力 | SC-61 |
| G4-02 | handlers スタブの型付け | SC-62 |
| G4-03 | 重複 import の排除 | SC-63 |
| G4-04 | RSC / "use client" 判定ロジック | SC-64 |
| G4-05 | Tabs position → `orientation` 変換 | SC-65 |
| G4-06 | Grid `cols` → Tailwind `grid-cols-N` | SC-66 |
| G4-07 | Table の shadcn マッピング | SC-67 |
| G4-08 | Avatar の AvatarFallback 生成 | SC-68 |
| G4-09 | 新プリミティブ全体のコード生成スナップショット | SC-69（§14 拡張） |

---

## シナリオ一覧

### §5 回帰（既存）

`gen-next-screen-01` 〜 `gen-next-unknown-01` / `gen-next-menu-01` 〜 `gen-next-menu-05` を回帰テストとして実行する（test_spec.md §5 参照）。

---

### SC-61: TypeScript strict mode 型定義

| シナリオID | 入力 | 期待結果 |
| --- | --- | --- |
| `p4-ts-01` | Screen `{ route: "/login" }` | 生成ファイルの先頭に `"use client"` または省略、型エラーなし |
| `p4-ts-02` | Button with `on:click` | `handlers` props の型定義 `{ [key: string]: ((...args: unknown[]) => void) \| undefined }` |
| `p4-ts-03` | Input `required` | `required` が `boolean` 型として生成される |
| `p4-ts-04` | dir 属性 | `dir?: "auto" \| "ltr" \| "rtl"` として生成される |
| `p4-ts-05` | 生成ファイルを `tsc --strict --noEmit` で検証 | 型エラー 0 件 |

---

### SC-62: handlers スタブ型

| シナリオID | 入力 | 期待結果 |
| --- | --- | --- |
| `p4-handlers-01` | `on:click="dlg.close('ok')"` のある Button | `handlers["dlg.close"]?.("ok")` が生成される |
| `p4-handlers-02` | 複数のイベント（click + change） | handlers オブジェクトに両方のキーが含まれる |
| `p4-handlers-03` | handlers なし（イベントなしの Screen） | handlers props が省略される（不要な props なし） |
| `p4-handlers-04` | 同じイベント識別子が2つのButtonに登場 | handlers のキーは重複なし（deduplicate） |

---

### SC-63: import 重複排除

| シナリオID | 入力 | 期待結果 |
| --- | --- | --- |
| `p4-import-01` | Button が5個ある Screen | `import { Button } from "@/components/ui/button"` は1行のみ |
| `p4-import-02` | Card + Input + Button | 各コンポーネントが1行ずつ、重複なし |
| `p4-import-03` | MenuBar + Tabs + Accordion | 各 shadcn コンポーネントの import が1行ずつ |
| `p4-import-04` | Avatar（AvatarImage + AvatarFallback 使用） | `{ Avatar, AvatarImage, AvatarFallback }` が1 import 文でまとめられる |

---

### SC-64: RSC / "use client" 判定

| シナリオID | 入力 | 期待結果 |
| --- | --- | --- |
| `p4-rsc-01` | イベントハンドラなし、静的テキストのみ | `"use client"` なし（RSC） |
| `p4-rsc-02` | `on:click` を含む Button | ファイル先頭に `"use client"` が付与される |
| `p4-rsc-03` | `on:change` を含む Input | `"use client"` が付与される |
| `p4-rsc-04` | Toggle（状態管理あり） | `"use client"` が付与される |
| `p4-rsc-05` | include のみで構成（展開後にイベントなし） | `"use client"` なし |

---

### SC-65: Tabs position → orientation

| シナリオID | 入力 | 期待出力 |
| --- | --- | --- |
| `p4-tabs-01` | `{.tabs top}` | `<Tabs defaultValue="...">` （`orientation` なし、既定水平） |
| `p4-tabs-02` | `{.tabs bottom}` | `<Tabs className="flex-col-reverse">` または相当クラス |
| `p4-tabs-03` | `{.tabs left}` | `<Tabs orientation="vertical" className="flex-row">` |
| `p4-tabs-04` | `{.tabs right}` | `<Tabs orientation="vertical" className="flex-row-reverse">` |

---

### SC-66: Grid → Tailwind grid-cols

| シナリオID | 入力 | 期待出力 |
| --- | --- | --- |
| `p4-grid-01` | `{.grid cols:3}` | `<div className="grid grid-cols-3">` |
| `p4-grid-02` | `{.grid cols:4 gap:16}` | `<div className="grid grid-cols-4 gap-4">` （16px=gap-4） |
| `p4-grid-03` | GridCell `{span:2}` | `<div className="col-span-2">` |
| `p4-grid-04` | GridCell `{row-span:2}` | `<div className="row-span-2">` |

---

### SC-67: Table → shadcn Table

| シナリオID | 入力 | 期待出力 |
| --- | --- | --- |
| `p4-table-01` | 3列2行テーブル | `<Table><TableHeader><TableRow>` × 1 + `<TableBody><TableRow>` × 2 |
| `p4-table-02` | `{striped}` | テーブルに `className="..."` で striped クラス付与 |
| `p4-table-03` | `{hoverable}` | `<TableRow className="hover:bg-muted/50">` |
| `p4-table-04` | カラム名が日本語 | `<TableHead>` 内に日本語文字列が正しく出力される |

---

### SC-68: Avatar の AvatarFallback

| シナリオID | 入力 | 期待出力 |
| --- | --- | --- |
| `p4-avatar-01` | `![山田](./yamada.jpg){.avatar size:40}` | `<AvatarFallback>山</AvatarFallback>`（alt 先頭文字） |
| `p4-avatar-02` | `![JD](./john.jpg){.avatar size:32}` | `<AvatarFallback>J</AvatarFallback>` |
| `p4-avatar-03` | alt が空の場合 | `<AvatarFallback>?</AvatarFallback>` |

---

### SC-69: 新プリミティブ スナップショット

test_spec.md §14 の `codegen-ns-*` に加え、以下を追加する。

| テストID | 入力フィクスチャ | スナップショット |
| --- | --- | --- |
| `p4-snap-01` | `fixtures/valid/textarea.md` | `snapshots/next-shadcn/textarea.tsx` |
| `p4-snap-02` | `fixtures/valid/range.md` | `snapshots/next-shadcn/range.tsx` |
| `p4-snap-03` | `fixtures/valid/combobox.md` | `snapshots/next-shadcn/combobox.tsx` |
| `p4-snap-04` | `fixtures/valid/progress.md` | `snapshots/next-shadcn/progress.tsx` |
| `p4-snap-05` | `fixtures/valid/spinner.md` | `snapshots/next-shadcn/spinner.tsx` |
| `p4-snap-06` | `fixtures/valid/alert.md` | `snapshots/next-shadcn/alert.tsx` |
| `p4-snap-07` | `fixtures/valid/divider.md` | `snapshots/next-shadcn/divider.tsx` |
| `p4-snap-08` | `fixtures/valid/image.md` | `snapshots/next-shadcn/image.tsx` |
| `p4-snap-09` | `fixtures/valid/avatar.md` | `snapshots/next-shadcn/avatar.tsx` |
| `p4-snap-10` | `fixtures/valid/grid.md` | `snapshots/next-shadcn/grid.tsx` |
| `p4-snap-11` | `fixtures/valid/table.md` | `snapshots/next-shadcn/table.tsx` |
| `p4-snap-12` | `fixtures/valid/skeleton.md` | `snapshots/next-shadcn/skeleton.tsx` |

---

## テスト実装方針

- **フレームワーク**: Vitest + スナップショット
- **型検証**: `tsc --strict --noEmit` を CI でパイプライン実行
- **ファイル配置**: `tests/unit/codegen/next-shadcn/`
- **実行コマンド**: `npx vitest run tests/unit/codegen/next-shadcn/`
