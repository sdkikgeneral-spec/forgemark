# Phase 5 — テストシナリオ

**対象期間**: D11–D12
**スコープ**: コード生成（tailwind-plain / sveltekit）

---

## ギャップ分析（test_spec.md との差分）

| ギャップID | 未カバー領域 | 対応シナリオ |
| --- | --- | --- |
| G5-01 | aria-* 属性の出力（アクセシビリティ） | SC-71 |
| G5-02 | role 属性の出力 | SC-71 |
| G5-03 | `<kbd>` 要素でのショートカット出力 | SC-72 |
| G5-04 | `<form>` 要素の生成 | SC-73 |
| G5-05 | 新プリミティブの tailwind-plain スナップショット | SC-74 |
| G5-06 | sveltekit Svelte 5 runes 構文の出力 | SC-75 |
| G5-07 | 新プリミティブの sveltekit スナップショット | SC-76 |

---

## シナリオ一覧

### §6 / §7 回帰（既存）

`gen-tw-btn-01` / `gen-tw-input-01` / `gen-tw-snap-01` / `gen-svelte-screen-01` 等を回帰実行（test_spec.md §6, §7 参照）。

---

### SC-71: アクセシビリティ属性

#### tailwind-plain での role / aria-*

| シナリオID | 入力 | 期待出力 |
| --- | --- | --- |
| `p5-a11y-01` | Button `.btn` | `<button type="button">` |
| `p5-a11y-02` | Input `type:email` | `<input type="email" />` |
| `p5-a11y-03` | MenuBar | `<nav role="menubar">` |
| `p5-a11y-04` | Menu | `<ul role="menu">` |
| `p5-a11y-05` | MenuItem | `<li role="menuitem">` |
| `p5-a11y-06` | MenuSeparator | `<li role="separator" />` |
| `p5-a11y-07` | Listbox `{multiple}` | `<ul role="listbox" aria-multiselectable="true">` |
| `p5-a11y-08` | ListboxItem `{selected}` | `<li role="option" aria-selected="true">` |
| `p5-a11y-09` | Toolbar | `<div role="toolbar" aria-label="...">` |
| `p5-a11y-10` | StatusBar | `<footer role="status">` |
| `p5-a11y-11` | Spinner | `<div role="status" aria-label="loading">` |
| `p5-a11y-12` | Progress `value:75` | `<progress value="75" max="100" aria-valuenow="75">` |
| `p5-a11y-13` | Alert `.error` | `<div role="alert" aria-live="assertive">` |
| `p5-a11y-14` | Alert `.info` | `<div role="status" aria-live="polite">` |
| `p5-a11y-15` | disabled Button | `<button disabled aria-disabled="true">` |

---

### SC-72: `<kbd>` ショートカット出力

| シナリオID | 入力 | 期待出力 |
| --- | --- | --- |
| `p5-kbd-01` | MenuItem `{ shortcut: "Ctrl+N" }` | `<kbd class="...">Ctrl+N</kbd>` |
| `p5-kbd-02` | ToolbarItem `{ shortcut: "Ctrl+S" }` | `<kbd class="...">Ctrl+S</kbd>` |
| `p5-kbd-03` | shortcut なし MenuItem | `<kbd>` なし |

---

### SC-73: `<form>` 要素生成

| シナリオID | 入力 | 期待出力 |
| --- | --- | --- |
| `p5-form-01` | Card 内に Input + Button（submit） | Card が `<form>` にラップされる（`method="post"` を持つ） |
| `p5-form-02` | Button `{type:submit}` | `<button type="submit">` |
| `p5-form-03` | Input `{name:"email"}` | `name="email"` が `<input>` に付与される |
| `p5-form-04` | イベントのみ（`on:submit`） | `<form onSubmit="...">` のコメントスタブ |

---

### SC-74: tailwind-plain 新プリミティブ スナップショット

| テストID | フィクスチャ | スナップショット |
| --- | --- | --- |
| `p5-tw-snap-01` | `fixtures/valid/textarea.md` | `snapshots/tailwind-plain/textarea.html` |
| `p5-tw-snap-02` | `fixtures/valid/range.md` | `snapshots/tailwind-plain/range.html` |
| `p5-tw-snap-03` | `fixtures/valid/table.md` | `snapshots/tailwind-plain/table.html` |
| `p5-tw-snap-04` | `fixtures/valid/grid.md` | `snapshots/tailwind-plain/grid.html` |
| `p5-tw-snap-05` | `fixtures/valid/alert.md` | `snapshots/tailwind-plain/alert.html` |
| `p5-tw-snap-06` | `fixtures/valid/avatar.md` | `snapshots/tailwind-plain/avatar.html` |

---

### SC-75: sveltekit Svelte 5 runes 構文

| シナリオID | 入力 | 期待出力 |
| --- | --- | --- |
| `p5-svelte-01` | handlers を使う Button | `let { handlers } = $props()` が含まれる |
| `p5-svelte-02` | Toggle `{checked}` | `let checked = $state(true)` が含まれる |
| `p5-svelte-03` | Screen `{ route: "/settings" }` | `src/routes/settings/+page.svelte` に出力 |
| `p5-svelte-04` | on:click イベント | `onclick={...}` （Svelte 5 記法、`on:click` ではない） |
| `p5-svelte-05` | on:change イベント | `onchange={...}` （Svelte 5 記法） |

---

### SC-76: sveltekit 新プリミティブ スナップショット

| テストID | フィクスチャ | スナップショット |
| --- | --- | --- |
| `p5-sv-snap-01` | `fixtures/valid/textarea.md` | `snapshots/sveltekit/textarea.svelte` |
| `p5-sv-snap-02` | `fixtures/valid/table.md` | `snapshots/sveltekit/table.svelte` |
| `p5-sv-snap-03` | `fixtures/valid/grid.md` | `snapshots/sveltekit/grid.svelte` |

---

## テスト実装方針

- **フレームワーク**: Vitest + スナップショット
- **ファイル配置**: `tests/unit/codegen/tailwind-plain/` / `tests/unit/codegen/sveltekit/`
- **HTML 検証**: `htmlvalidate` または `axe-core` でアクセシビリティ検証
- **実行コマンド**: `npx vitest run tests/unit/codegen/tailwind-plain/ tests/unit/codegen/sveltekit/`
