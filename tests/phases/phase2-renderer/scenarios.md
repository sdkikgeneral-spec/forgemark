# Phase 2 — テストシナリオ

**対象期間**: D3–D4
**スコープ**: 差分レンダリング / React+Tailwind プレビュー / テーマ / dir / スクロール同期

---

## ギャップ分析（test_spec.md との差分）

| ギャップID | 未カバー領域 | 対応シナリオ |
| --- | --- | --- |
| G2-01 | デバウンス 300ms 動作検証 | SC-41 |
| G2-02 | テーマクラス切替の正確な出力 | SC-42 |
| G2-03 | Unknown ノードの赤枠 CSS クラス | SC-43 |
| G2-04 | スクロール同期（カーソル行→DOM要素ハイライト） | SC-44 |
| G2-05 | 差分レンダリング（変更ノードのみ再描画） | SC-45 |
| G2-06 | `dir="auto"` のHTML属性出力 | SC-46 |
| G2-07 | Skeleton `.animate-pulse` クラス出力 | SC-47 |
| G2-08 | Spinner `.animate-spin` クラス出力 | SC-48 |

---

## シナリオ一覧

### 統合テスト §9 の回帰（既存）

`int-render-01` 〜 `int-render-perf-01` を回帰テストとして実行する（test_spec.md §9 参照）。

---

### SC-41: デバウンス 300ms

| シナリオID | 操作 | 期待結果 |
| --- | --- | --- |
| `p2-debounce-01` | ファイル変更→即座に確認 | 0ms 時点でレンダリング未発火 |
| `p2-debounce-02` | ファイル変更→200ms待機 | まだ未発火 |
| `p2-debounce-03` | ファイル変更→300ms待機 | 再パース・レンダリングが1回発火 |
| `p2-debounce-04` | 300ms以内に3回連続変更 | 最後の変更から300ms後に1回だけ発火 |

**検証方法**: タイマーをモックして `vi.useFakeTimers()` で制御する。

---

### SC-42: テーマ切替

| シナリオID | 操作 | 期待結果 |
| --- | --- | --- |
| `p2-theme-01` | テーマ `sketch` のデフォルト確認 | ルート要素に `data-theme="sketch"` が付与される |
| `p2-theme-02` | `clean` に切替 | `data-theme="clean"` に変更される |
| `p2-theme-03` | `sketch` に戻す | `data-theme="sketch"` に戻る |
| `p2-theme-04` | テーマ切替後のコンポーネント描画 | Card / Button に `sketch` / `clean` 用クラスが適用される |

---

### SC-43: Unknown ノードの表示

| シナリオID | 入力 | 期待結果 |
| --- | --- | --- |
| `p2-unknown-01` | AST に Unknown ノード1件 | `border-2 border-red-500` 等の赤枠クラスを持つ `<div>` が出力される |
| `p2-unknown-02` | Unknown ノードの raw テキストが `<script>` を含む | raw テキストが HTML エスケープされる（XSS防止） |
| `p2-unknown-03` | 有効なノードと Unknown ノードが混在 | 有効なノードは通常レンダリング、Unknown のみ赤枠 |

**セキュリティ注意**: raw テキストは必ずエスケープすること。

---

### SC-44: スクロール同期

| シナリオID | 操作 | 期待結果 |
| --- | --- | --- |
| `p2-scroll-01` | カーソルを Button ノードの行に移動 | プレビュー側の対応 Button 要素に `data-highlight="true"` が付与される |
| `p2-scroll-02` | カーソルを Card ノード開始行に移動 | Card 全体がハイライト |
| `p2-scroll-03` | カーソルを include 行に移動 | 展開されたinclude先のルートノードがハイライト |
| `p2-scroll-04` | カーソルが AST ノードに対応しない行（空行等） | 前回ハイライトが解除され、ハイライトなしになる |

**検証方法**: `postMessage` のペイロードに `{ type: "highlight", nodeId: "button-0" }` が含まれること。

---

### SC-45: 差分レンダリング

| シナリオID | 操作 | 期待結果 |
| --- | --- | --- |
| `p2-diff-01` | Button のラベルのみ変更 | Button ノードのみ再描画。Card / Screen の再描画なし |
| `p2-diff-02` | Card の class 変更 | Card と子ノード全体を再描画。兄弟ノードは再描画なし |
| `p2-diff-03` | include で参照するファイルを変更 | include ノードと祖先を再描画。無関係のノードは再描画なし |
| `p2-diff-04` | ノード追加（新しいInput） | 差分として Insert 操作が生成される |
| `p2-diff-05` | ノード削除 | 差分として Remove 操作が生成される |

**検証方法**: `renderer.diff(prevAST, nextAST)` の戻り値の `patches` 配列を検証する。

---

### SC-46: dir 属性のHTML出力

| シナリオID | 入力 | 期待結果 |
| --- | --- | --- |
| `p2-dir-01` | `{dir:rtl}` を持つ Card | `<div dir="rtl">` が出力される |
| `p2-dir-02` | `{dir:ltr}` を持つ Input | `<input dir="ltr">` が出力される |
| `p2-dir-03` | `{dir:auto}` を持つ Text | `<p dir="auto">` が出力される |
| `p2-dir-04` | dir 属性なし（既定） | `dir="auto"` が付与される（既定値） |
| `p2-dir-05` | 子ノードが dir を上書き | 子ノードのdir が優先される |

---

### SC-47: Skeleton クラス出力

| シナリオID | 入力 | 期待結果 |
| --- | --- | --- |
| `p2-skeleton-01` | `[____]{.skeleton}` | `<div class="animate-pulse bg-muted rounded h-4">` |
| `p2-skeleton-02` | `[ボタン]{.btn .skeleton}` | Button 要素に `animate-pulse` クラスが付与される |
| `p2-skeleton-03` | `.skeleton` を持つ Card | Card コンテナに `animate-pulse` クラス、子コンテンツは非表示 |
| `p2-skeleton-04` | Skeleton → `.skeleton` クラス除去後の再描画 | 通常表示に戻る（差分で `animate-pulse` クラスが除去される） |

---

### SC-48: Spinner クラス出力

| シナリオID | 入力 | 期待結果 |
| --- | --- | --- |
| `p2-spinner-01` | `[~]{.spinner}` | `<svg class="animate-spin" aria-label="loading">` または `<Loader2>` 相当のHTMLが出力される |
| `p2-spinner-02` | `[~]{.spinner size:24}` | size が width/height 属性または style に反映される |
| `p2-spinner-03` | Spinner を含む Row のレンダリング | Row の列として正しく配置される |

---

### パフォーマンス（§11 回帰）

| テストID | 条件 | 目標値 |
| --- | --- | --- |
| `int-render-perf-01` | ファイル50・各500行 | 100ms 以内 |
| `p2-perf-debounce` | 1000回の連続入力 | デバウンス後1回のみ発火、UI ブロックなし |

---

## テスト実装方針

- **フレームワーク**: Vitest + `@testing-library/react`
- **ファイル配置**: `tests/unit/renderer/`, `tests/integration/render/`
- **モック**: `vi.useFakeTimers()` でデバウンスを制御
- **スナップショット**: `renderer.toHTML()` の出力を比較
- **実行コマンド**: `npx vitest run tests/unit/renderer/ tests/integration/render/`
