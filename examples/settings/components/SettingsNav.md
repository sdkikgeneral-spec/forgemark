## 設定メニュー {.tree .border-r .h-full}

- アカウント {icon:"user" selected on:click="settings.show('account')"}
- 外観 {icon:"palette" on:click="settings.show('appearance')"}
- エディター {icon:"code" on:click="settings.show('editor')"}
- 通知 {icon:"bell" on:click="settings.show('notifications')"}
- セキュリティ {icon:"shield" on:click="settings.show('security')"}
---
- 言語・地域 {icon:"globe" on:click="settings.show('locale')"}
- キーボードショートカット {icon:"keyboard" on:click="settings.show('shortcuts')"}
---
- プラグイン {icon:"puzzle" on:click="settings.show('plugins')"}
