# Contributing to ForgeMark

ForgeMark へのコントリビュートを歓迎します。
バグ報告・機能提案・ドキュメント改善・コード実装、いずれも大歓迎です。

---

## 目次

- [行動規範](#行動規範)
- [バグ報告](#バグ報告)
- [機能提案](#機能提案)
- [開発環境セットアップ](#開発環境セットアップ)
- [ブランチ戦略](#ブランチ戦略)
- [コミット規約](#コミット規約)
- [Pull Request の作成](#pull-request-の作成)
- [コーディング規約](#コーディング規約)

---

## 行動規範

- 他のコントリビューターを尊重してください。
- 建設的なフィードバックを心がけてください。
- Issue / PR のやり取りは英語または日本語で構いません。

---

## バグ報告

[GitHub Issues](https://github.com/sdkikgeneral-spec/forgemark/issues) から報告してください。

以下を含めると解決が早まります:

- **再現手順**（最小限の `.md` サンプルがあると理想的）
- **期待する動作** と **実際の動作**
- **VS Code バージョン** と **拡張バージョン**
- エラーメッセージ / スクリーンショット（あれば）

---

## 機能提案

[GitHub Issues](https://github.com/sdkikgeneral-spec/forgemark/issues) に `enhancement` ラベルを付けて投稿してください。

提案前に以下を確認してください:

- [docs/requirements_spec.md](docs/requirements_spec.md) に既に含まれていないか
- MVP スコープ外の場合は「将来対応」として議論します

---

## 開発環境セットアップ

> **前提条件**
> - Node.js 20 LTS 以上
> - VS Code 1.85.0 以上
> - Git

```bash
# リポジトリのクローン
git clone https://github.com/sdkikgeneral-spec/forgemark.git
cd forgemark

# 依存パッケージのインストール
npm install

# テストの実行
npm test

# VS Code 拡張の開発モード起動
# VS Code で F5 キーを押す（Extension Development Host が起動します）
```

> 実装が進み次第、詳細なセットアップ手順を追記します。

---

## ブランチ戦略

| ブランチ | 用途 |
| --- | --- |
| `main` | リリース済みの安定版 |
| `develop` | 開発統合ブランチ |
| `feature/{name}` | 機能開発（例: `feature/parser-include`） |
| `fix/{name}` | バグ修正（例: `fix/circular-detection`） |
| `docs/{name}` | ドキュメント修正（例: `docs/syntax-spec`） |

- `main` への直接 push は禁止。必ず PR を通してください。
- `feature/*` は `develop` からブランチし、`develop` へ PR します。
- リリース時に `develop` → `main` へ PR します。

---

## コミット規約

[Conventional Commits](https://www.conventionalcommits.org/) に従います。

```
<type>(<scope>): <概要>

[本文（任意）]
```

**type 一覧**

| type | 用途 |
| --- | --- |
| `feat` | 新機能 |
| `fix` | バグ修正 |
| `docs` | ドキュメントのみの変更 |
| `test` | テストの追加・修正 |
| `refactor` | 機能変更を伴わないリファクタリング |
| `chore` | ビルド・CI など雑務 |
| `perf` | パフォーマンス改善 |

**例**

```
feat(parser): add Tree node parser
fix(include): resolve circular detection for diamond dependency
docs(syntax): add Tabs position section
```

---

## Pull Request の作成

1. `develop` から `feature/{name}` ブランチを作成する
2. 変更を加えてテストが通ることを確認する（`npm test`）
3. PR を `develop` に向けて作成する
4. PR の説明に以下を記載する:
   - **変更内容**（何をなぜ変えたか）
   - **テスト方法**（手動確認手順 or 自動テスト）
   - **関連 Issue**（`Closes #123` など）
5. CI がすべて通ることを確認する
6. レビュー後、マージは PR 作者以外が行います（セルフマージ不可）

---

## コーディング規約

[CLAUDE.md](CLAUDE.md) のルールに従います。要点を抜粋します。

- **命名**（変数・関数・クラス等）は **英語**
- **コメント**は **日本語**
- **変数名に固有名詞を使わない**（`loginButton` ではなく `submitButton`）
- Microsoft コーディング規約を基準とする
- TypeScript: `strict: true` を前提とする

---

## ドキュメント修正

仕様書を修正する場合、以下の3ファイルを**常に同期**して更新してください。

| ファイル | 役割 |
| --- | --- |
| [docs/requirements_spec.md](docs/requirements_spec.md) | 要件仕様（正本） |
| [docs/syntax_spec.md](docs/syntax_spec.md) | 構文リファレンス |
| [tests/test_spec.md](tests/test_spec.md) | テスト仕様 |

3ファイルのうち1つだけを変更する PR はレビューで差し戻しになることがあります。
