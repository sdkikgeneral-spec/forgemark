# ForgeMark 仕様書

> バージョン: 0.1.0-draft
> 作成日: 2026-03-16
> ステータス: MVP策定中

---

## 1. プロジェクト概要

**ForgeMark** は、Markdown だけで UI スケルトンを記述し、VS Code 拡張でライブプレビューしながら、安全に実装コードへハンドオフする開発支援ツールです。

### 目的

- デザイナー・開発者が Markdown という共通言語で UI 構造を定義できる
- ライブプレビューにより即座にフィードバックを得られる
- 複数フレームワーク向けのコード生成で実装コストを削減する

---

## 2. スコープ（MVP）

| # | 機能 | 優先度 |
|---|------|--------|
| 1 | Markdown → UI AST パーサ | 必須 |
| 2 | include 分割構成（正規形 + 糖衣） | 必須 |
| 3 | VS Code ライブプレビュー（React + Tailwind） | 必須 |
| 4 | IDE 機能（補完・ジャンプ・リネーム・lint・整形） | 必須 |
| 5 | コード生成: next-shadcn | 最優先 |
| 6 | コード生成: tailwind-plain | 高 |
| 7 | コード生成: sveltekit | 中 |

---

## 3. 構文仕様

### 3.1 基本ルール

| 項目 | 仕様 |
|------|------|
| 属性キー | 英語固定（`type`, `required`, `dir`, `class` など） |
| テキスト | UTF-8 任意言語 |
| 方向指定 | `dir: auto \| ltr \| rtl`（既定: `auto`） |

### 3.2 プリミティブ一覧

```
# 画面見出し

[[ A | B | C ]]                              → Row（列分割）
{.row .right .gap-12}                        → クラス・属性指定
{type:email required}                        → 型・バリデーション属性
[________________]{type:password required}   → Input
[サインイン]{.btn .primary on:click="dlg.close('ok')"}  → Button
```

### 3.3 属性・クラス記法

- クラス: `{.クラス名}`（複数可）
- 属性: `{key:value}`（スペース区切りで複数指定可）
- イベント: `on:イベント名="ハンドラ"`

---

## 4. include 仕様

### 4.1 正規形（Canonical form）

````markdown
```include
path: ./components/header.md
as: block
dir: auto
class: my-class
```
````

| キー | 必須 | 既定値 | 値 |
|------|------|--------|----|
| `path` | ✅ | — | 相対パス |
| `as` | ❌ | `block` | `block \| inline` |
| `dir` | ❌ | `auto` | `auto \| ltr \| rtl` |
| `class` | ❌ | — | 任意文字列 |

- 未知キーは警告として診断に出力する

### 4.2 糖衣形（Sugar form）

```markdown
!include[./components/header.md]
```

- 1 行で記述可能
- 保存時に自動で正規形へ整形される（既定 ON）

---

## 5. パーサ・依存グラフ

### 5.1 処理フロー

```
Markdown テキスト
  ↓ remark / Unified
Markdown AST
  ↓ ForgeMark プラグイン
UI AST
  ↓
include 依存グラフ → 循環参照検出 → 診断出力
```

### 5.2 パフォーマンス目標

- 差分レンダリング: **< 100ms**

---

## 6. UI AST

### 6.1 ノード種別

| ノード | 説明 |
|--------|------|
| `Screen` | 画面ルート |
| `Row` | 横並び列 |
| `Card` | カードコンテナ |
| `Input` | 入力フィールド |
| `Button` | ボタン |
| `Text` | テキスト |

### 6.2 共通プロパティ

```ts
interface BaseNode {
  id: string;
  class: string[];
  dir: "auto" | "ltr" | "rtl"; // 既定: "auto"
}
```

---

## 7. プレビューレンダラー

| 項目 | 仕様 |
|------|------|
| フレームワーク | React + Tailwind |
| テーマ | `sketch`（手書き風）/ `clean`（シンプル） |
| RTL 対応 | `:dir(rtl)` または CSS 論理プロパティ |
| dir 反映 | DOM の `dir` 属性へ直接反映 |

---

## 8. VS Code 拡張機能

### 8.1 UI

- 左ペイン: Markdown エディタ
- 右ペイン: UI ライブプレビュー

### 8.2 機能一覧

| 機能 | 説明 |
|------|------|
| path 補完 | include の path キーで候補表示 |
| as / dir 補完 | 値の候補表示 |
| ジャンプ | `Ctrl/Cmd + Click` で include 先ファイルを開く |
| リネーム追従 | ファイルリネーム時に path を自動更新 |
| 保存時整形 | 糖衣 → 正規形へ自動変換 |

### 8.3 Problems（診断）

| 種別 | 内容 |
|------|------|
| 未知キー | include ブロック内の未定義キー |
| 不正値 | `as` / `dir` の想定外の値 |
| 不在パス | include 先ファイルが存在しない |
| 循環参照 | include が循環している |

---

## 9. コード生成

### 9.1 next-shadcn（最優先）

- 出力先: `app/(segments)/page.tsx`（App Router）
- React 19 / RSC 前提
- UI コンポーネント: shadcn/ui（`Button`, `Input`, `Dialog` 等）
- スタイル: Tailwind v4
- イベント: `handlers["dlg.close"]?.("ok")` 形式のスタブ

### 9.2 tailwind-plain

- 最小限の HTML/JSX + Tailwind クラス
- フレームワーク非依存

### 9.3 sveltekit

- `+page.svelte` / `+page.server.js` へ分配
- Tailwind クラスを再利用

---

## 10. i18n・方向制御

| 項目 | 仕様 |
|------|------|
| 表示文字列 | 任意言語（UTF-8） |
| RTL 指定 | `dir:rtl` を明示（既定: `auto`） |
| 将来拡張 | `t('key')` 置換モード（i18n キー属性） |

---

## 11. 受け入れ基準

- [ ] include 分割構成が正しく動作する
- [ ] 不在 path・循環参照が Problems パネルに表示される
- [ ] プレビューが < 100ms で更新される
- [ ] `dir` 挙動が ltr / rtl / auto で正しく反映される
- [ ] 糖衣形が保存時に正規形へ整形される
- [ ] next-shadcn 出力が安定した構造で生成される

---

## 12. 開発スケジュール（2 週間 MVP）

| 期間 | タスク |
|------|--------|
| D1–2 | include 正規化、パース、循環検出、依存グラフ |
| D3–4 | 差分レンダリング |
| D5–7 | VS Code 機能（補完・ジャンプ・整形・lint） |
| D8–10 | next-shadcn 出力 |
| D11–12 | tailwind-plain 追加 |
| D13–14 | サンプル 3 画面、README、デモ仕上げ |

---

## 13. エンジニアリング優先事項

1. include 解析と依存グラフの正確性
2. 予測可能で高速なプレビュー更新
3. IDE 診断のわかりやすさ
4. 生成コードの決定性（差分ノイズ最小）
