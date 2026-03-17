# ForgeMark 仕様レビュー

最終更新: 2026-03-17 (JST)

## 1. 対象

本レビューは、以下の仕様文書を対象に実施した。

- [requirements_spec.md](./requirements_spec.md)
- [syntax_spec.md](./syntax_spec.md)
- [spec_sheet.md](./spec_sheet.md)
- [README.md](../README.md)
- [test_spec.md](../tests/test_spec.md)
- [CLAUDE.md](../CLAUDE.md)

レビュー観点は以下の3点とした。

- 仕様間の整合性
- MVPとしての実装可能性とスコープ管理
- セキュリティ、性能、検証可能性

## 2. 総評

ForgeMark の中核コンセプトは明確であり、Markdown を UI スケルトン記述とコード生成に接続する方向性は一貫している。一方で、仕様書群の間にいくつかの重要な不整合があり、現時点では「何を MVP として確定するか」が文書ごとに揺れている。

とくに、include 糖衣構文、MVP に含めるプリミティブ範囲、AST の最小定義、検証範囲の4点は、実装判断とテスト設計に直接影響する。ここを先に収束させないまま進めると、実装は進んでも受け入れ判定がぶれる。

## 3. 指摘事項

### Critical 1. include 糖衣構文が文書間で衝突している

`spec_sheet.md` では糖衣構文が `!include[./components/header.md]` とされている一方、[requirements_spec.md](./requirements_spec.md) と [syntax_spec.md](./syntax_spec.md)、[test_spec.md](../tests/test_spec.md) では 1 行フェンス形式の ```` ```include path="..."``` ```` を前提にしている。

- [spec_sheet.md](./spec_sheet.md) は `!include[...]` を採用している
- [requirements_spec.md](./requirements_spec.md) は 1 行フェンス糖衣を採用している
- [syntax_spec.md](./syntax_spec.md) も 1 行フェンス糖衣を採用している
- [test_spec.md](../tests/test_spec.md) の include テストも 1 行フェンス糖衣で組まれている

この差分は表記揺れではなく、パーサ実装、保存時正規化、スニペット設計、ドキュメント例示をすべて分岐させる。現状の正本が [requirements_spec.md](./requirements_spec.md) である以上、`spec_sheet.md` は誤情報を含んでいる。

推奨対応:

1. 糖衣構文を 1 行フェンス形式に一本化する。
2. [spec_sheet.md](./spec_sheet.md) を修正するか、概要資料としての位置づけを明記して正規仕様から外す。
3. README の構文説明とスニペット仕様も同じ記法に固定する。

### Critical 2. MVP スコープが「最小構成」と「拡張構成」で二重化している

[CLAUDE.md](../CLAUDE.md) と [spec_sheet.md](./spec_sheet.md) は、MVP を Screen / Row / Card / Input / Button / Text を中心とした最小構成として読める。一方で [requirements_spec.md](./requirements_spec.md) と [syntax_spec.md](./syntax_spec.md) は、MenuBar、Tree、Panes、Tabs、Accordion、Grid、Table、Alert、Image、Avatar など多数のプリミティブを MVP 本文に含めている。さらに [README.md](../README.md) では、それらを既定機能として前面に出している。

この状態では、以下がすべて不安定になる。

- 2 週間 MVP 計画の妥当性
- 受け入れ基準の対象範囲
- フェーズごとの完了定義
- サンプルとテストの期待値

特に [requirements_spec.md](./requirements_spec.md) は「UI AST（最小）」という見出しの下で、実際には大規模な AST サーフェスを定義しており、見出し名と内容が一致していない。

推奨対応:

1. MVP Core と Extended Primitives を明確に分離する。
2. [requirements_spec.md](./requirements_spec.md) の AST 定義を「MVP Core」「MVP Stretch」「Post-MVP」に分割する。
3. [README.md](../README.md) は、確定機能だけを主記載にし、拡張機能はロードマップに下げる。

### High 3. include パス解決の安全境界が未定義で、パストラバーサル対策が不足している

仕様では include の `path` を相対パスとして扱い、不在パスや循環参照は診断対象になっている。しかし、以下の安全条件が明記されていない。

- `../` によるワークスペース外参照を禁止するか
- シンボリックリンクを許可するか
- Windows の `\` と `/` をどう正規化するか
- 大文字小文字の扱いをどう統一するか
- `file:` や URL 形式を拒否するか

ForgeMark は VS Code 拡張としてローカルファイルを横断するため、ここが未定義だと「見えるはずのないファイルを include できるか」「OS 差で同じ記述が別挙動になるか」が実装依存になる。これはセキュリティ上も設計上も弱い。

推奨対応:

1. include 解決対象を「現在ファイル基準で解決し、正規化後にワークスペースルート内に収まるものに限定」と明記する。
2. Windows を含むパス正規化規約を仕様化する。
3. 拒否対象の診断コードを追加する。例: `Path escapes workspace root`。

### High 4. 自動採番 ID の仕様が差分レンダリング要件と噛み合っていない

[requirements_spec.md](./requirements_spec.md) では `id` を `{nodeType}-{index}` の出現順自動採番としている。一方で同じ文書は、差分レンダリング、スクロール同期、影響サブツリーのみの再描画を要求している。

出現順ベースの ID は、先頭付近にノードを 1 つ挿入しただけで後続ノードの ID が大量に変わる。その結果、以下の不安定性が起きる。

- 差分レンダリングのキャッシュ無効化が広がる
- エディタ行と UI ノードの対応が揺れる
- 将来のジャンプ、選択、診断ハイライトのキーが不安定になる
- include 展開順変更で DOM キーが大量に変わる

これは性能要件と UX 要件の両方に反する。

推奨対応:

1. ID を出現順ではなく、ソース位置または内容ハッシュベースの安定 ID に切り替える。
2. include 展開後ではなく、元ファイルとノード位置を保持した複合キーにする。
3. `id` の役割を「内部追跡用」と「ユーザー指定 ID」で分離する。

### Medium 5. lint severity とエラー分類の基準が曖昧で、出力可否判断に使いにくい

[requirements_spec.md](./requirements_spec.md) では Unknown ノードが「lint エラー（severity: warning）」と記述されており、用語が衝突している。また、構造違反の一部は Warning 扱いだが、コード生成やプレビュー結果への影響度が大きいものも含まれている。

このままだと、以下が設計しづらい。

- Problems パネルでの優先度制御
- 生成ブロック条件
- フォールバック表示と処理継続の境界
- テスト時の期待結果

推奨対応:

1. `ParseError`, `SemanticError`, `Warning`, `Info` のように分類層を分ける。
2. 「コード生成を止める条件」を仕様に明記する。
3. Unknown ノードの扱いを、プレビュー許可・生成許可の観点で別途定義する。

### Medium 6. テスト仕様が現行リポジトリ構成および仕様面積と一致していない

[test_spec.md](../tests/test_spec.md) は `tests/unit/`, `tests/integration/`, `src/parser/`, `src/codegen/`, `src/extension/` という構成を前提にしているが、現行リポジトリは monorepo 構成で、実装とテストは [packages/core](../packages/core) 配下にある。さらに、仕様本体が定義している多数のプリミティブに対して、テスト仕様の記述量はまだ限定的で、受け入れ基準とのトレーサビリティが弱い。

これは「仕様として存在するが、どこで検証するかが決まっていない」状態を生む。

推奨対応:

1. [test_spec.md](../tests/test_spec.md) を monorepo 前提に更新する。
2. 各プリミティブに対して「MVPで必須の検証」「将来検証」を分ける。
3. 受け入れ基準ごとに対応テスト ID を引けるようにする。

### Medium 7. 性能目標はあるが、測定条件と劣化時の挙動が不足している

[requirements_spec.md](./requirements_spec.md) は「50 ファイル、1 ファイル最大 500 行で 100ms 以内」という目標を示しているが、どの操作で測るのか、どの環境を基準とするのか、超過時にどう扱うのかが書かれていない。

性能要件は目標値だけでは運用できず、少なくとも以下が必要である。

- ベンチマーク対象操作の定義
- 測定環境の前提
- P50 / P95 などの統計指標
- 超過時の許容劣化挙動

推奨対応:

1. Phase 2 に性能ベンチマークシナリオを追加する。
2. 「編集 1 回あたりの再解析」「include 変更時の再計算」など計測対象を固定する。
3. 100ms を超えたときの段階的劣化方針を仕様化する。

## 4. 改善優先順位

最初に着手すべき順序は以下が妥当である。

1. include 糖衣構文の一本化
2. MVP Core と拡張機能の切り分け
3. include パス解決の安全境界の仕様化
4. 安定 ID 戦略への見直し
5. lint severity と生成ブロック条件の整理
6. テスト仕様の追随

## 5. 結論

ForgeMark の方向性自体は良く、仕様の素材も十分に揃っている。ただし、現時点では「仕様が豊富」というより「仕様の層が混在している」状態であり、そのまま進めると MVP の完了条件が曖昧になる。

したがって、次の一手は機能追加ではなく、[requirements_spec.md](./requirements_spec.md) を正本として仕様の階層を整理し、他文書を従属文書として再整列することを推奨する。ここが揃えば、以後の設計、実装、テスト、README 更新のすべてが安定する。
