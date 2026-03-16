## ログイン

ようこそ。メールアドレスとパスワードを入力してください。{.text-sm .muted .mb-16}

[________________]{type:email required placeholder:"メールアドレス"}

[________________]{type:password required placeholder:"パスワード"}

[パスワードをお忘れですか？]{.link .text-sm .mt-4}

[[ スペース | [ログイン]{.btn .primary on:click="auth.login()"} ]]{.row .right .gap-8 .mt-16}

---

アカウントをお持ちでない方は [新規登録]{.link on:click="nav.push('/register')"}
