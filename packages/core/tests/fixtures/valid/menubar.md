# /app {.screen}

## メニュー {.menubar}

### &File

- [新規]{on:click="file.new()"}
- [開く]{on:click="file.open()"}
- ---
- [終了]{on:click="app.quit()"}

### &Edit

- [元に戻す]{shortcut:"Ctrl+Z" on:click="edit.undo()"}
- [やり直す]{shortcut:"Ctrl+Y" on:click="edit.redo()"}
