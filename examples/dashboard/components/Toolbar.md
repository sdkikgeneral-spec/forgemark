## ツールバー {.toolbar}

- [新規タスク]{icon:"plus" on:click="task.new()"}
- [インポート]{icon:"upload" on:click="task.import()"}
---
- [フィルター]{icon:"filter" on:click="filter.toggle()" checked}
- [グループ化]{icon:"layers" on:click="group.toggle()"}
---
- [表示: リスト]{icon:"list" on:click="view.list()"}
- [表示: カード]{icon:"grid" on:click="view.card()"}
---
- [更新]{icon:"refresh-cw" on:click="data.reload()" shortcut:"F5"}
