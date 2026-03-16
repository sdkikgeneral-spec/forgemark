# Phase 5 — テスト結果

**フェーズ**: D11–D12 コード生成（tailwind-plain / sveltekit）
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

## §6 / §7 回帰

| テストID | 説明 | 状態 | メモ |
| --- | --- | --- | --- |
| `gen-tw-btn-01` | Button + on:click コメントスタブ | TODO | |
| `gen-tw-input-01` | Input email | TODO | |
| `gen-tw-snap-01` | login スナップショット | TODO | |
| `gen-tw-menu-01` | MenuBar → nav+ul+li | TODO | |
| `gen-tw-menu-02` | shortcut → `<kbd>` | TODO | |
| `gen-tw-menu-03` | MenuSeparator → role="separator" | TODO | |
| `gen-svelte-screen-01` | Screen → +page.svelte | TODO | |
| `gen-svelte-props-01` | handlers $props() | TODO | |
| `gen-svelte-snap-01` | login スナップショット | TODO | |
| `gen-svelte-menu-01` | MenuBar svelte | TODO | |

---

## SC-71: アクセシビリティ属性

| テストID | 説明 | 状態 | メモ |
| --- | --- | --- | --- |
| `p5-a11y-01` | Button → `<button type="button">` | TODO | |
| `p5-a11y-02` | Input type:email | TODO | |
| `p5-a11y-03` | MenuBar → role="menubar" | TODO | |
| `p5-a11y-04` | Menu → role="menu" | TODO | |
| `p5-a11y-05` | MenuItem → role="menuitem" | TODO | |
| `p5-a11y-06` | MenuSeparator → role="separator" | TODO | |
| `p5-a11y-07` | Listbox multiple → aria-multiselectable | TODO | |
| `p5-a11y-08` | ListboxItem selected → aria-selected | TODO | |
| `p5-a11y-09` | Toolbar → role="toolbar" | TODO | |
| `p5-a11y-10` | StatusBar → role="status" | TODO | |
| `p5-a11y-11` | Spinner → role="status" aria-label | TODO | |
| `p5-a11y-12` | Progress → aria-valuenow | TODO | |
| `p5-a11y-13` | Alert .error → role="alert" | TODO | |
| `p5-a11y-14` | Alert .info → aria-live="polite" | TODO | |
| `p5-a11y-15` | disabled → aria-disabled="true" | TODO | |

---

## SC-72: `<kbd>` ショートカット

| テストID | 説明 | 状態 | メモ |
| --- | --- | --- | --- |
| `p5-kbd-01` | MenuItem shortcut → `<kbd>` | TODO | |
| `p5-kbd-02` | ToolbarItem shortcut → `<kbd>` | TODO | |
| `p5-kbd-03` | shortcut なし → `<kbd>` なし | TODO | |

---

## SC-73: `<form>` 生成

| テストID | 説明 | 状態 | メモ |
| --- | --- | --- | --- |
| `p5-form-01` | Card + Input + Button(submit) → form | TODO | |
| `p5-form-02` | Button type:submit | TODO | |
| `p5-form-03` | Input name 属性 | TODO | |
| `p5-form-04` | on:submit スタブ | TODO | |

---

## SC-74: tailwind-plain スナップショット

| テストID | フィクスチャ | 状態 | メモ |
| --- | --- | --- | --- |
| `p5-tw-snap-01` | textarea | TODO | |
| `p5-tw-snap-02` | range | TODO | |
| `p5-tw-snap-03` | table | TODO | |
| `p5-tw-snap-04` | grid | TODO | |
| `p5-tw-snap-05` | alert | TODO | |
| `p5-tw-snap-06` | avatar | TODO | |

---

## SC-75: Svelte 5 runes

| テストID | 説明 | 状態 | メモ |
| --- | --- | --- | --- |
| `p5-svelte-01` | $props() | TODO | |
| `p5-svelte-02` | $state(true) | TODO | |
| `p5-svelte-03` | Screen → ルートパス | TODO | |
| `p5-svelte-04` | onclick（Svelte 5記法） | TODO | |
| `p5-svelte-05` | onchange（Svelte 5記法） | TODO | |

---

## SC-76: sveltekit スナップショット

| テストID | フィクスチャ | 状態 | メモ |
| --- | --- | --- | --- |
| `p5-sv-snap-01` | textarea | TODO | |
| `p5-sv-snap-02` | table | TODO | |
| `p5-sv-snap-03` | grid | TODO | |

---

## 凡例

| 状態 | 意味 |
| --- | --- |
| `TODO` | 未実装 |
| `PASS` | 合格 |
| `FAIL` | 不合格 |
| `SKIP` | スキップ |
| `WONTFIX` | 対応しない |
