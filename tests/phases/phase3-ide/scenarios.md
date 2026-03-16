# Phase 3 — テストシナリオ

**対象期間**: D5–D7
**スコープ**: VS Code拡張（補完 / ジャンプ / リネーム追従 / 糖衣整形 / lint）

---

## ギャップ分析（test_spec.md との差分）

| ギャップID | 未カバー領域 | 対応シナリオ |
| --- | --- | --- |
| G3-01 | スニペット展開の正確なテキスト出力 | SC-51 |
| G3-02 | `as` / `dir` 補完の候補値 | SC-52 |
| G3-03 | Ctrl+Click と F12 の同一動作 | SC-53 |
| G3-04 | 複数ファイル同時リネームの原子性 | SC-54 |
| G3-05 | リネーム Refactor Preview の表示 | SC-55 |
| G3-06 | Problems パネルの複数エラー集約 | SC-56 |
| G3-07 | マルチルートワークスペース警告 | SC-57 |
| G3-08 | `forgemark.formatOnSave: false` の設定反映 | SC-58 |

---

## シナリオ一覧

### §10 E2E 回帰（既存）

`e2e-preview-01` 〜 `e2e-lint-03` を回帰テストとして実行する（test_spec.md §10 参照）。

---

### SC-51: スニペット展開の正確なテキスト

| シナリオID | 操作 | 期待結果 |
| --- | --- | --- |
| `p3-snip-01` | `inc` → Tab で補完 | 以下の文字列が挿入される: `` ```include\npath: ${1:./path/to.md}\nas: ${2\|block,inline\|}\ndir: ${3\|auto,ltr,rtl\|}\n``` `` |
| `p3-snip-02` | 挿入後の Tab 順序 | `path` → `as` → `dir` の順にカーソルが移動する |
| `p3-snip-03` | `as` のデフォルト選択肢 | `block` が先頭（選択済み）になる |

---

### SC-52: 補完候補

| シナリオID | 操作 | 期待結果 |
| --- | --- | --- |
| `p3-complete-01` | `path: ./` の後ろにカーソル | ワークスペース内の `.md` ファイル一覧が候補に表示される |
| `p3-complete-02` | `path: ./comp` と入力 | `./components/` 配下のファイルに絞り込まれる |
| `p3-complete-03` | `as: ` の後ろにカーソル | `block`, `inline` の2候補が表示される |
| `p3-complete-04` | `dir: ` の後ろにカーソル | `auto`, `ltr`, `rtl` の3候補が表示される |
| `p3-complete-05` | include 以外の行で `path:` を入力 | 補完が発火しない（include コンテキスト外） |
| `p3-complete-06` | ワークスペースに `.md` ファイルが0件 | 補完リストが空で表示される（エラーにならない） |

---

### SC-53: ジャンプ（定義へ移動）

| シナリオID | 操作 | 期待結果 |
| --- | --- | --- |
| `p3-jump-01` | 有効な `path:` 上で F12 | 参照先ファイルが開く |
| `p3-jump-02` | 有効な `path:` 上で Ctrl+Click | F12 と同一動作でファイルが開く |
| `p3-jump-03` | 存在しない `path:` 上で F12 | エラートースト「File not found: {path}」が表示される |
| `p3-jump-04` | `path:` の値の途中にカーソルがある場合 | ジャンプが正しく動作する（値全体をパスとして解釈） |
| `p3-jump-05` | 糖衣形の `path="..."` 上で F12 | 糖衣でも同様にジャンプできる |

---

### SC-54: リネーム追従（原子性）

| シナリオID | 操作 | 期待結果 |
| --- | --- | --- |
| `p3-rename-01` | A.md を B.md にリネーム（1参照元） | 参照元の `path: ./A.md` が `path: ./B.md` に更新される |
| `p3-rename-02` | A.md を B.md にリネーム（3参照元） | 3ファイル全ての参照が一括更新される（WorkspaceEdit で原子的適用） |
| `p3-rename-03` | フォルダ `components/` を `parts/` にリネーム | フォルダ配下すべての参照パスが更新される |
| `p3-rename-04` | リネーム後に参照元ファイルをundoする | パスが元に戻る（VS Code undo スタックに乗る） |
| `p3-rename-05` | 参照先がなくなるリネーム（ファイル外移動） | 該当 path に lint error が追加される |

---

### SC-55: Refactor Preview

| シナリオID | 操作 | 期待結果 |
| --- | --- | --- |
| `p3-refactor-01` | リネーム実行 | Refactor Preview パネルが開き、変更内容が表示される |
| `p3-refactor-02` | Refactor Preview で「適用」を押す | WorkspaceEdit が適用され、ファイルが更新される |
| `p3-refactor-03` | Refactor Preview で「キャンセル」を押す | ファイルは変更されない |

---

### SC-56: Problems パネル集約

| シナリオID | 操作 | 期待結果 |
| --- | --- | --- |
| `p3-lint-01` | 複数の lint error を含む md を開く | Problems パネルに全エラーが一覧表示される |
| `p3-lint-02` | Error と Warning が混在 | Error は Error、Warning は Warning で表示される（混同なし） |
| `p3-lint-03` | 循環参照（A→B→A）の場合 | AとB両方のファイルに lint error が表示される |
| `p3-lint-04` | lint error を修正して保存 | 対応する Problems エントリが消える |
| `p3-lint-05` | ファイルを閉じる | そのファイルの Problems エントリが消える |

---

### SC-57: マルチルートワークスペース

| シナリオID | 操作 | 期待結果 |
| --- | --- | --- |
| `p3-multi-01` | マルチルートワークスペースで ForgeMark を起動 | 警告通知「Multi-root workspace is not fully supported.」が表示される |
| `p3-multi-02` | 上記警告の「詳細を見る」クリック | ドキュメントまたは GitHub Issue にリンクする |

---

### SC-58: formatOnSave 設定

| シナリオID | 操作 | 期待結果 |
| --- | --- | --- |
| `p3-format-01` | デフォルト設定で糖衣を含むファイルを保存 | 糖衣が正規形に変換される |
| `p3-format-02` | `forgemark.formatOnSave: false` の状態で保存 | 糖衣が変換されない |
| `p3-format-03` | ワークスペース設定でONに戻して保存 | 糖衣が再び変換される |
| `p3-format-04` | 正規形のファイルを保存 | 変更なし（不要な変更が加わらない） |

---

## テスト実装方針

- **フレームワーク**: `@vscode/test-electron`（E2E）
- **ファイル配置**: `tests/e2e/`
- **フィクスチャ**: `tests/fixtures/valid/` + `tests/fixtures/invalid/`
- **実行コマンド**: `npx vscode-test`
