# CLAUDE.md

## About the Developer

- OSSデベロッパー
- UI/UXに詳しいプログラマー
- 実装と設計レビューの両方を担当する

## Review Policy

コードレビュー・実装時に以下を積極的に警告・指摘する：

- セキュリティ上の問題点
- パフォーマンス上の問題点
- 設計上の問題点

## Coding Rules

- コメントは日本語で記述する
- 変数名に固有名詞を使わない
- Microsoftコーディング規約を基準とする
- 命名（変数・関数・クラス等）は英語で記述する
- コード生成時は簡潔な説明をつける

## Project Mission
ForgeMarkは、MarkdownだけでUIスケルトンを記述し、VS Code拡張でライブプレビューしながら、安全に実装コードへハンドオフするMVPを提供する。

## Source of Truth
- 要件の正本は docs/requirements_spec.md
- 仕様が曖昧な場合はMVP要件を優先
- 表示テキストは多言語前提、属性キーは英語固定

## MVP Scope
1. Markdown構文をUI ASTへ変換するパーサ
2. include分割構成（フェンスド正規形＋1行糖衣）
3. VS Code上でのライブプレビュー（React + Tailwind）
4. IDE機能（補完、ジャンプ、リネーム追従、lint、糖衣→正規整形）
5. コード出力ターゲット
   1. next-shadcn（最優先）
   2. tailwind-plain
   3. sveltekit

## Normative Syntax
- 記号主義: #, [], [[...|...]], {.class key:value}
- 属性キー: 英語固定（type, required, dir, class など）
- テキスト: UTF-8任意言語
- dir: auto | ltr | rtl（既定 auto）

### Minimal Primitives
- Row: [[ A | B | C ]]
- Attr/Class: {.row .right .gap-12}, {type:email required}
- Input: [________________]{type:password required}
- Button: [サインイン]{.btn .primary on:click="dlg.close('ok')"}

## Include Rules
### Canonical form
- フェンス名: include
- サポートキー:
  - path（必須）
  - as: block | inline（既定 block）
  - dir: auto | ltr | rtl（既定 auto）
  - class（任意）
- 未知キーは警告

### Sugar form
- 1行糖衣を許可
- 保存時に糖衣を正規形へ自動整形（既定 ON）

## Parser and Graph
- remark / Unifiedで Markdown AST -> UI AST
- include依存グラフを構築
- 循環参照を検出して診断に出す
- 差分レンダリング前提（目標 <100ms）

## Minimal UI AST
- Node: Screen, Row, Card, Input, Button, Text
- 共通プロパティ:
  - id
  - class[]
  - dir（default auto）

## Preview Renderer
- React + Tailwind
- テーマ: sketch, clean
- dirをDOMへ反映
- RTLは :dir(rtl) または論理プロパティで対応

## VS Code Extension Requirements
- 左Markdown / 右UIのライブプレビュー
- includeスニペット（path補完、as/dir候補）
- path上のCtrl/Cmd+Clickジャンプ
- リネーム時のpath自動更新
- 糖衣⇄正規（保存時正規化）
- Problems集約:
  - 未知キー
  - 不正値
  - 不在パス
  - 循環参照

## Code Generation Targets
### 1) next-shadcn（Primary）
- 出力: app/(segments)/page.tsx（App Router）
- React 19 / RSC前提
- UIマッピング: shadcn/ui（Button/Input/Dialog等）
- スタイル: Tailwind v4
- イベント: handlers["dlg.close"]?.("ok") のようなスタブ受け渡し

### 2) tailwind-plain
- 最小HTML/JSX + Tailwindクラス
- フレームワーク非依存の出口

### 3) sveltekit
- +page.svelte / +page.server.jsへ分配
- Tailwindクラスを再利用

## i18n and Direction
- 表示文字列は任意言語
- RTLは dir:rtl で明示、既定は dir:auto
- 将来拡張: i18nキー属性を使う生成モード（t('key')置換）

## Acceptance Criteria
- include分割構成が機能する
- 不在pathと循環参照が診断表示される
- プレビューが高速更新され、dir挙動が正しい
- 1行糖衣が保存時に正規形へ整形される
- next-shadcn出力が安定した構造で生成できる

## Engineering Priorities
1. include解析と依存グラフの正確性
2. 予測可能で速いプレビュー更新
3. IDE診断の分かりやすさ
4. 生成コードの決定性（差分ノイズ最小）

## 2-Week MVP Plan
- D1-2: include正規化、パース、循環検出、依存グラフ
- D3-4: 差分レンダリング
- D5-7: VS Code機能（補完、ジャンプ、整形、lint）
- D8-10: next-shadcn出力
- D11-12: tailwind-plain追加
- D13-14: サンプル3画面、README、デモ仕上げ

## Repository

- GitHub: <https://github.com/sdkikgeneral-spec/forgemark>
- License: MIT

## Branch Strategy
- `main`: リリース済みの安定版（直接 push 禁止）
- `develop`: 開発統合ブランチ（現在の作業ブランチ）
- `feature/{name}`: 機能開発（develop からブランチ → develop へ PR）
- `fix/{name}`: バグ修正
- `docs/{name}`: ドキュメント修正
