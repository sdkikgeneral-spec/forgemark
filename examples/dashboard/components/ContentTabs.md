## コンテンツ {.tabs top}

### タスク一覧 {.tab selected}

## 検索・フィルター {.row .align-center .gap-8 .mb-12}

[[ [________________]{type:text placeholder:"タスクを検索..."} | [____]{type:select placeholder:"担当者"} | [____]{type:combobox placeholder:"ラベル"} | スペース | [CSV出力]{.btn .ghost .text-sm on:click="task.exportCsv()"} ]]{.row .align-center .gap-8}

- React{value:"react" selected}
- Vue{value:"vue"}
- デザイン{value:"design"}

## タスク {.table striped hoverable}

| タスク名 | 担当者 | 優先度 | 状態 | 期限 |
| --- | --- | --- | --- | --- |
| ログイン画面の実装 | 山田 | 高 | 完了 | 2026-03-10 |
| API 設計レビュー | 鈴木 | 高 | 進行中 | 2026-03-20 |
| テスト仕様書作成 | 田中 | 中 | 進行中 | 2026-03-25 |
| README 更新 | 山田 | 低 | 未着手 | 2026-04-01 |
| パフォーマンス計測 | 鈴木 | 中 | 未着手 | 2026-04-05 |

[[ スペース | [前へ]{.btn .ghost .text-sm disabled} | 1 / 3 {.text-sm .muted} | [次へ]{.btn .ghost .text-sm on:click="page.next()"} ]]{.row .align-center .gap-4 .mt-12}

### メンバー {.tab}

## チームメンバー {.grid cols:3 gap:16}

### 山田 太郎 {.card .p-16}

[[ ![山田](./assets/yamada.png){.avatar size:48} | [[ 山田 太郎{.font-bold} | フロントエンド{.text-sm .muted} ]]{.col .gap-2} ]]{.row .align-center .gap-12}

担当タスク: [12]{.badge}

[____]{type:progress value:75}

完了率 75%{.text-sm .muted}

### 鈴木 花子 {.card .p-16}

[[ ![鈴木](./assets/suzuki.png){.avatar size:48} | [[ 鈴木 花子{.font-bold} | バックエンド{.text-sm .muted} ]]{.col .gap-2} ]]{.row .align-center .gap-12}

担当タスク: [8]{.badge}

[____]{type:progress value:62}

完了率 62%{.text-sm .muted}

### 田中 健一 {.card .p-16}

[[ ![田中](./assets/tanaka.png){.avatar size:48} | [[ 田中 健一{.font-bold} | QA エンジニア{.text-sm .muted} ]]{.col .gap-2} ]]{.row .align-center .gap-12}

担当タスク: [6]{.badge}

[____]{type:progress value:50}

完了率 50%{.text-sm .muted}

### アクティビティ {.tab}

## 最新アクティビティ {.card .p-16}

[[ ![山田](./assets/yamada.png){.avatar size:32} | 山田 太郎が「ログイン画面の実装」を**完了**にしました | 2分前{.text-sm .muted} ]]{.row .align-center .gap-8 .py-8 .border-b}

[[ ![鈴木](./assets/suzuki.png){.avatar size:32} | 鈴木 花子が「API 設計レビュー」にコメントしました | 1時間前{.text-sm .muted} ]]{.row .align-center .gap-8 .py-8 .border-b}

[[ ![田中](./assets/tanaka.png){.avatar size:32} | 田中 健一が「テスト仕様書作成」を作成しました | 3時間前{.text-sm .muted} ]]{.row .align-center .gap-8 .py-8}

[[ スペース | [もっと見る]{.btn .ghost .text-sm on:click="activity.loadMore()"} ]]{.row .right .mt-8}
