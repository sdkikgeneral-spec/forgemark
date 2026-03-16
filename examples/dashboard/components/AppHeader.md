## ヘッダー {.row .align-center .px-16 .py-8 .border-b}

[[ ProjectHub | スペース | [~]{.spinner size:14} | [通知]{.badge} 3 | ![管理者](./assets/admin.png){.avatar size:32} ]]{.row .align-center .gap-12}

## メニュー {.menubar}

### &File

- [新規プロジェクト]{on:click="project.new()" shortcut:"Ctrl+N"}
- [開く]{on:click="project.open()" shortcut:"Ctrl+O"}
---
- [エクスポート]{on:click="project.export()"}
---
- [終了]{on:click="app.quit()"}

### &View

- [ダッシュボード]{on:click="nav.push('/dashboard')"}
- [タスク一覧]{on:click="nav.push('/tasks')"}
- [メンバー]{on:click="nav.push('/members')"}
---
- [設定]{on:click="nav.push('/settings')" shortcut:"Ctrl+,"}

### &Help

- [ドキュメント]{on:click="help.docs()"}
- [キーボードショートカット]{on:click="help.shortcuts()"}
---
- [About ProjectHub]{on:click="help.about()"}
