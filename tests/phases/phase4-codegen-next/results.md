# Phase 4 — テスト結果

**フェーズ**: D8–D10 コード生成（next-shadcn）
**最終更新**: —
**実行環境**: Node 20 / Vitest + tsc --strict

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

## §5 回帰

| テストID | 説明 | 状態 | メモ |
| --- | --- | --- | --- |
| `gen-next-screen-01` | Screen → page.tsx | TODO | |
| `gen-next-card-01` | Card → `<Card>` | TODO | |
| `gen-next-input-01/02` | Input email / required | TODO | |
| `gen-next-btn-01` | Button + on:click → handlers | TODO | |
| `gen-next-row-01` | Row 3列 → flex | TODO | |
| `gen-next-text-01` | Text → `<p>` | TODO | |
| `gen-next-snap-01` 〜 `03` | スナップショット | TODO | |
| `gen-next-menu-01` 〜 `05` | MenuBar マッピング | TODO | |
| `gen-next-unknown-01` | Unknown → コメント | TODO | |

---

## SC-61: TypeScript strict mode

| テストID | 説明 | 状態 | メモ |
| --- | --- | --- | --- |
| `p4-ts-01` | RSC / "use client" 分岐 | TODO | |
| `p4-ts-02` | handlers props 型定義 | TODO | |
| `p4-ts-03` | required → boolean 型 | TODO | |
| `p4-ts-04` | dir → union 型 | TODO | |
| `p4-ts-05` | tsc --strict --noEmit エラー 0 | TODO | |

---

## SC-62: handlers スタブ

| テストID | 説明 | 状態 | メモ |
| --- | --- | --- | --- |
| `p4-handlers-01` | on:click → handlers["key"]?.() | TODO | |
| `p4-handlers-02` | 複数イベント | TODO | |
| `p4-handlers-03` | イベントなし → handlers 省略 | TODO | |
| `p4-handlers-04` | 同一キー重複排除 | TODO | |

---

## SC-63: import 重複排除

| テストID | 説明 | 状態 | メモ |
| --- | --- | --- | --- |
| `p4-import-01` | Button 5個 → import 1行 | TODO | |
| `p4-import-02` | Card+Input+Button 各1行 | TODO | |
| `p4-import-03` | MenuBar+Tabs+Accordion | TODO | |
| `p4-import-04` | Avatar の named imports まとめ | TODO | |

---

## SC-64: RSC / "use client"

| テストID | 説明 | 状態 | メモ |
| --- | --- | --- | --- |
| `p4-rsc-01` | 静的のみ → "use client" なし | TODO | |
| `p4-rsc-02` | on:click → "use client" あり | TODO | |
| `p4-rsc-03` | on:change → "use client" あり | TODO | |
| `p4-rsc-04` | Toggle → "use client" あり | TODO | |
| `p4-rsc-05` | includeのみ・展開後イベントなし | TODO | |

---

## SC-65: Tabs position

| テストID | 説明 | 状態 | メモ |
| --- | --- | --- | --- |
| `p4-tabs-01` | top（既定） | TODO | |
| `p4-tabs-02` | bottom | TODO | |
| `p4-tabs-03` | left → orientation="vertical" | TODO | |
| `p4-tabs-04` | right → orientation="vertical" + reverse | TODO | |

---

## SC-66: Grid

| テストID | 説明 | 状態 | メモ |
| --- | --- | --- | --- |
| `p4-grid-01` | cols:3 → grid-cols-3 | TODO | |
| `p4-grid-02` | cols:4 gap:16 → gap-4 | TODO | |
| `p4-grid-03` | span:2 → col-span-2 | TODO | |
| `p4-grid-04` | row-span:2 → row-span-2 | TODO | |

---

## SC-67: Table

| テストID | 説明 | 状態 | メモ |
| --- | --- | --- | --- |
| `p4-table-01` | 3列2行 → TableHeader+TableBody | TODO | |
| `p4-table-02` | striped クラス | TODO | |
| `p4-table-03` | hoverable → hover クラス | TODO | |
| `p4-table-04` | 日本語カラム名 | TODO | |

---

## SC-68: Avatar Fallback

| テストID | 説明 | 状態 | メモ |
| --- | --- | --- | --- |
| `p4-avatar-01` | alt先頭文字「山」 | TODO | |
| `p4-avatar-02` | alt先頭文字「J」 | TODO | |
| `p4-avatar-03` | alt空 → 「?」 | TODO | |

---

## SC-69: 新プリミティブ スナップショット

| テストID | フィクスチャ | 状態 | メモ |
| --- | --- | --- | --- |
| `p4-snap-01` | textarea.md | TODO | |
| `p4-snap-02` | range.md | TODO | |
| `p4-snap-03` | combobox.md | TODO | |
| `p4-snap-04` | progress.md | TODO | |
| `p4-snap-05` | spinner.md | TODO | |
| `p4-snap-06` | alert.md | TODO | |
| `p4-snap-07` | divider.md | TODO | |
| `p4-snap-08` | image.md | TODO | |
| `p4-snap-09` | avatar.md | TODO | |
| `p4-snap-10` | grid.md | TODO | |
| `p4-snap-11` | table.md | TODO | |
| `p4-snap-12` | skeleton.md | TODO | |

---

## 凡例

| 状態 | 意味 |
| --- | --- |
| `TODO` | 未実装 |
| `PASS` | 合格 |
| `FAIL` | 不合格 |
| `SKIP` | スキップ |
| `WONTFIX` | 対応しない |
