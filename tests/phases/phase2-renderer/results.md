# Phase 2 — テスト結果

**フェーズ**: D3–D4 差分レンダリング
**最終更新**: —
**実行環境**: Node 20 / Vitest + @testing-library/react

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

## 統合テスト §9 回帰

| テストID | 説明 | 状態 | メモ |
| --- | --- | --- | --- |
| `int-render-01` | 有効なmd → Reactコンポーネント生成 | TODO | |
| `int-render-02` | Unknownノード → 赤枠プレースホルダ | TODO | |
| `int-render-03` | dir:rtl → DOM属性付与 | TODO | |
| `int-render-04` | sketch/clean テーマ切替 | TODO | |
| `int-render-perf-01` | 50ファイル・500行 → 100ms以内 | TODO | |

---

## SC-41: デバウンス

| テストID | 説明 | 状態 | メモ |
| --- | --- | --- | --- |
| `p2-debounce-01` | 0ms: 未発火 | TODO | |
| `p2-debounce-02` | 200ms: 未発火 | TODO | |
| `p2-debounce-03` | 300ms: 1回発火 | TODO | |
| `p2-debounce-04` | 3回連続変更→1回のみ発火 | TODO | |

---

## SC-42: テーマ切替

| テストID | 説明 | 状態 | メモ |
| --- | --- | --- | --- |
| `p2-theme-01` | sketch デフォルト | TODO | |
| `p2-theme-02` | clean 切替 | TODO | |
| `p2-theme-03` | sketch に戻す | TODO | |
| `p2-theme-04` | 切替後のコンポーネントクラス | TODO | |

---

## SC-43: Unknown ノード

| テストID | 説明 | 状態 | メモ |
| --- | --- | --- | --- |
| `p2-unknown-01` | 赤枠クラスの付与 | TODO | |
| `p2-unknown-02` | raw テキストのXSSエスケープ | TODO | |
| `p2-unknown-03` | 有効ノードと混在 | TODO | |

---

## SC-44: スクロール同期

| テストID | 説明 | 状態 | メモ |
| --- | --- | --- | --- |
| `p2-scroll-01` | Button 行→ハイライト | TODO | |
| `p2-scroll-02` | Card 開始行→Card 全体ハイライト | TODO | |
| `p2-scroll-03` | include 行→展開先ルートハイライト | TODO | |
| `p2-scroll-04` | 空行→ハイライト解除 | TODO | |

---

## SC-45: 差分レンダリング

| テストID | 説明 | 状態 | メモ |
| --- | --- | --- | --- |
| `p2-diff-01` | Buttonラベル変更→Buttonのみ再描画 | TODO | |
| `p2-diff-02` | Cardクラス変更→Card+子を再描画 | TODO | |
| `p2-diff-03` | includeファイル変更→include+祖先再描画 | TODO | |
| `p2-diff-04` | ノード追加 | TODO | |
| `p2-diff-05` | ノード削除 | TODO | |

---

## SC-46: dir 属性

| テストID | 説明 | 状態 | メモ |
| --- | --- | --- | --- |
| `p2-dir-01` | dir:rtl → `dir="rtl"` | TODO | |
| `p2-dir-02` | dir:ltr → `dir="ltr"` | TODO | |
| `p2-dir-03` | dir:auto → `dir="auto"` | TODO | |
| `p2-dir-04` | dir省略 → `dir="auto"` (既定) | TODO | |
| `p2-dir-05` | 子ノードのdir優先 | TODO | |

---

## SC-47: Skeleton

| テストID | 説明 | 状態 | メモ |
| --- | --- | --- | --- |
| `p2-skeleton-01` | animate-pulse クラス出力 | TODO | |
| `p2-skeleton-02` | Button+skeleton | TODO | |
| `p2-skeleton-03` | Card+skeleton（子非表示） | TODO | |
| `p2-skeleton-04` | skeleton除去後の通常表示 | TODO | |

---

## SC-48: Spinner

| テストID | 説明 | 状態 | メモ |
| --- | --- | --- | --- |
| `p2-spinner-01` | animate-spin + aria-label | TODO | |
| `p2-spinner-02` | size反映 | TODO | |
| `p2-spinner-03` | Row内配置 | TODO | |

---

## 凡例

| 状態 | 意味 |
| --- | --- |
| `TODO` | 未実装 |
| `PASS` | 合格 |
| `FAIL` | 不合格（メモに原因記録） |
| `SKIP` | スキップ（メモに理由記録） |
| `WONTFIX` | 対応しない |
