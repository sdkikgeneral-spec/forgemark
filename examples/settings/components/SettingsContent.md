## 設定内容 {.p-24}

## 設定 {.accordion}

### アカウント {.accordion-item}

## プロフィール {.card .p-16 .mb-8}

[[ ![管理者](./assets/admin.png){.avatar size:64} | [変更]{.btn .ghost .text-sm on:click="avatar.change()"} ]]{.row .align-center .gap-12 .mb-16}

表示名{.text-sm .font-medium}

[________________]{type:text value:"山田 太郎" name:"displayName"}

メールアドレス{.text-sm .font-medium .mt-12}

[________________]{type:email value:"yamada@example.com" name:"email" required}

自己紹介{.text-sm .font-medium .mt-12}

[____]{type:textarea rows:3 placeholder:"自己紹介を入力..." name:"bio"}

[[ スペース | [変更を保存]{.btn .primary on:click="account.save()"} ]]{.row .right .gap-8 .mt-16}

### 外観 {.accordion-item collapsed}

## テーマ {.card .p-16 .mb-8}

テーマを選択してください。{.text-sm .muted .mb-12}

## テーマ選択 {.radio-group name:"theme"}

- (•) ライト {value:"light" selected}
- ( ) ダーク {value:"dark"}
- ( ) システムに合わせる {value:"system"}

---

## 表示オプション {.card .p-16}

[x] アニメーションを有効にする {name:"animation" on:change="appearance.update()"}

[ ] 高コントラストモード {name:"highContrast" on:change="appearance.update()"}

[x] コンパクト表示 {name:"compact" on:change="appearance.update()"}

言語{.text-sm .font-medium .mt-12}

[____]{type:select name:"language"}

- 日本語 {value:"ja" selected}
- English {value:"en"}
- 中文 {value:"zh"}

### エディター {.accordion-item collapsed}

## エディター設定 {.card .p-16}

フォントサイズ{.text-sm .font-medium}

[[ [____]{type:range min:10 max:24 value:14 step:1 name:"fontSize"} | 14px{.text-sm .muted .w-32} ]]{.row .align-center .gap-8}

タブサイズ{.text-sm .font-medium .mt-12}

## タブサイズ {.radio-group name:"tabSize"}

- (•) 2スペース {value:"2" selected}
- ( ) 4スペース {value:"4"}
- ( ) タブ文字 {value:"tab"}

---

[x] 自動保存 {name:"autoSave" on:change="editor.update()"}

[x] 行番号を表示 {name:"lineNumbers" on:change="editor.update()"}

[ ] ミニマップを表示 {name:"minimap" on:change="editor.update()"}

フォントファミリー{.text-sm .font-medium .mt-12}

[____]{type:combobox name:"fontFamily" placeholder:"フォントを選択..."}

- JetBrains Mono {value:"jetbrains-mono" selected}
- Fira Code {value:"fira-code"}
- Cascadia Code {value:"cascadia-code"}
- Source Code Pro {value:"source-code-pro"}

スニペット / カスタム設定{.text-sm .font-medium .mt-12}

[____]{type:textarea rows:6 placeholder:"{ \"editor.wordWrap\": \"on\" }" name:"customJson"}

### 通知 {.accordion-item collapsed}

## 通知設定 {.card .p-16}

メール通知{.text-sm .font-medium .mb-8}

[x] タスクが自分に割り当てられたとき {name:"notifyAssign"}

[x] コメントに返信があったとき {name:"notifyReply"}

[ ] 毎週のサマリーレポート {name:"notifyWeekly"}

---

## 通知頻度 {.radio-group name:"notifyFreq"}

- (•) リアルタイム {value:"realtime" selected}
- ( ) 1時間ごと {value:"hourly"}
- ( ) 1日1回 {value:"daily"}

---

## プッシュ通知 {.card .p-16}

プッシュ通知を受け取る{.text-sm .font-medium}

[____]{type:toggle checked name:"pushEnabled" on:change="notify.togglePush()"}

### セキュリティ {.accordion-item collapsed}

## 現在のセッション {.card .p-16 .mb-8}

## セキュリティ警告 {.alert .warning}

パスワードを最後に変更してから 90 日以上経過しています。

---

現在のパスワード{.text-sm .font-medium .mt-12}

[________________]{type:password name:"currentPassword" required}

新しいパスワード{.text-sm .font-medium .mt-8}

[________________]{type:password name:"newPassword" required}

確認（再入力）{.text-sm .font-medium .mt-8}

[________________]{type:password name:"confirmPassword" required}

[[ スペース | [パスワードを変更]{.btn .primary on:click="security.changePassword()"} ]]{.row .right .gap-8 .mt-16}

---

## 二要素認証 {.card .p-16}

二要素認証を有効にする{.text-sm .font-medium}

[____]{type:toggle name:"mfaEnabled" on:change="security.toggleMfa()"}

二要素認証を有効にすると、ログイン時にメールで確認コードが送信されます。{.text-sm .muted .mt-4}
