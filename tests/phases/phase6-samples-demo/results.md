# Phase 6 — テスト結果

**フェーズ**: D13–D14 サンプル統合 / デモ仕上げ
**最終更新**: —
**実行環境**: Node 20 / Vitest + @vscode/test-electron

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

## SC-81: login サンプル

| テストID | 説明 | 状態 | メモ |
| --- | --- | --- | --- |
| `p6-login-ast-01` | Screen route="/login" | TODO | |
| `p6-login-ast-02` | AppHeader → MenuBar 展開 | TODO | |
| `p6-login-ast-03` | FormLogin → Input + Button | TODO | |
| `p6-login-ast-04` | MessageDlg → Card + Row + inline | TODO | |
| `p6-login-ast-05` | id 一意性確認 | TODO | |
| `p6-login-ast-06` | 依存グラフ 6ファイル | TODO | |
| `p6-login-gen-01` | 生成パス確認 | TODO | |
| `p6-login-gen-02` | MenuBar 生成 | TODO | |
| `p6-login-gen-03` | フォーム生成 | TODO | |
| `p6-login-gen-04` | Dialog 生成 | TODO | |
| `p6-login-gen-05` | tsc --strict エラー 0 | TODO | |

---

## SC-82: dashboard サンプル

| テストID | 説明 | 状態 | メモ |
| --- | --- | --- | --- |
| `p6-dash-ast-01` | Grid cols:4 展開 | TODO | |
| `p6-dash-ast-02` | Tabs 3件 | TODO | |
| `p6-dash-ast-03` | Table cols:5 rows:5 | TODO | |
| `p6-dash-ast-04` | Grid cols:3 + Avatar + Progress | TODO | |
| `p6-dash-ast-05` | Toolbar 7件 + Separator 3件 | TODO | |
| `p6-dash-ast-06` | StatusBar left:3 right:2 | TODO | |
| `p6-dash-ast-07` | Breadcrumb 3件 | TODO | |
| `p6-dash-ast-08` | 依存グラフ 8ファイル | TODO | |
| `p6-dash-gen-01` | grid-cols-4 | TODO | |
| `p6-dash-gen-02` | Tabs 生成 | TODO | |
| `p6-dash-gen-03` | Table 生成 | TODO | |
| `p6-dash-gen-04` | Avatar × 3 | TODO | |
| `p6-dash-gen-05` | Badge | TODO | |
| `p6-dash-gen-06` | Progress | TODO | |

---

## SC-83: settings サンプル

| テストID | 説明 | 状態 | メモ |
| --- | --- | --- | --- |
| `p6-set-ast-01` | Panes horizontal 展開 | TODO | |
| `p6-set-ast-02` | Tree 8件 | TODO | |
| `p6-set-ast-03` | Accordion 5件 | TODO | |
| `p6-set-ast-04` | RadioGroup 3件 | TODO | |
| `p6-set-ast-05` | Checkbox 3件 | TODO | |
| `p6-set-ast-06` | Range 属性 | TODO | |
| `p6-set-ast-07` | Combobox 4 options | TODO | |
| `p6-set-ast-08` | Toggle checked | TODO | |
| `p6-set-ast-09` | Alert warning | TODO | |
| `p6-set-gen-01` | ResizablePanelGroup | TODO | |
| `p6-set-gen-02` | Accordion shadcn | TODO | |
| `p6-set-gen-03` | RadioGroup shadcn | TODO | |
| `p6-set-gen-04` | Slider 生成 | TODO | |
| `p6-set-gen-05` | Switch 生成 | TODO | |
| `p6-set-gen-06` | Combobox 生成 | TODO | |

---

## SC-84: スナップショット

| テストID | サンプル + ターゲット | 状態 | メモ |
| --- | --- | --- | --- |
| `p6-snap-login-next` | login / next-shadcn | TODO | |
| `p6-snap-dashboard-next` | dashboard / next-shadcn | TODO | |
| `p6-snap-settings-next` | settings / next-shadcn | TODO | |
| `p6-snap-login-tw` | login / tailwind-plain | TODO | |
| `p6-snap-dashboard-tw` | dashboard / tailwind-plain | TODO | |
| `p6-snap-settings-tw` | settings / tailwind-plain | TODO | |

---

## SC-85: パフォーマンス

| テストID | 計測内容 | 目標 | 実測 | 状態 | メモ |
| --- | --- | --- | --- | --- | --- |
| `p6-perf-01` | dashboard 初回パース | 500ms | — | TODO | |
| `p6-perf-02` | dashboard 差分レンダリング | 100ms | — | TODO | |
| `p6-perf-03` | settings next-shadcn 生成 | 1000ms | — | TODO | |
| `p6-perf-04` | 全3サンプル依存グラフ | 50ms | — | TODO | |

---

## SC-86: README

| テストID | 確認内容 | 状態 | メモ |
| --- | --- | --- | --- |
| `p6-doc-01` | Overview セクションの存在 | TODO | |
| `p6-doc-02` | クイックスタート 3ステップ | TODO | |
| `p6-doc-03` | 3サンプルへのリンク | TODO | |
| `p6-doc-04` | syntax_spec.md へのリンク | TODO | |
| `p6-doc-05` | コントリビュートガイド | TODO | |

---

## 凡例

| 状態 | 意味 |
| --- | --- |
| `TODO` | 未実装 |
| `PASS` | 合格 |
| `FAIL` | 不合格 |
| `SKIP` | スキップ |
| `WONTFIX` | 対応しない |
