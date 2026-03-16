## ヘッダー {.row .align-center .px-16 .py-8 .border-b}

[[ ForgeMark | スペース | [ヘルプ]{.btn .ghost .text-sm} ]]{.row .align-center .gap-8}

## メニュー {.menubar}

### &File

- [新規作成]{on:click="file.new()" shortcut:"Ctrl+N"}
- [開く]{on:click="file.open()" shortcut:"Ctrl+O"}
---
- [保存]{on:click="file.save()" shortcut:"Ctrl+S"}
- [名前を付けて保存]{on:click="file.saveAs()"}
---
- [終了]{on:click="app.quit()"}

### &Edit

- [元に戻す]{on:click="edit.undo()" shortcut:"Ctrl+Z"}
- [やり直し]{on:click="edit.redo()" shortcut:"Ctrl+Y"}
---
- [切り取り]{on:click="edit.cut()" shortcut:"Ctrl+X"}
- [コピー]{on:click="edit.copy()" shortcut:"Ctrl+C"}
- [貼り付け]{on:click="edit.paste()" shortcut:"Ctrl+V"}

### &Help

- [ドキュメント]{on:click="help.docs()"}
- [キーボードショートカット]{on:click="help.shortcuts()"}
---
- [About ForgeMark]{on:click="help.about()"}
