import * as vscode from "vscode";
import { PreviewPanel } from "./PreviewPanel";

// .fm.md ファイルかどうかを判定する
function isForgeMarkFile(document: vscode.TextDocument): boolean {
  return document.fileName.endsWith(".fm.md");
}

export function activate(context: vscode.ExtensionContext): void {
  // コマンド: ForgeMark プレビューを開く
  context.subscriptions.push(
    vscode.commands.registerCommand("forgemark.openPreview", () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        void vscode.window.showInformationMessage(
          ".fm.md ファイルをエディタで開いてください"
        );
        return;
      }
      PreviewPanel.createOrShow(context.extensionUri, editor.document);
    })
  );

  // .fm.md をアクティブにしたときに自動でプレビューを開く
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor && isForgeMarkFile(editor.document)) {
        PreviewPanel.createOrShow(context.extensionUri, editor.document);
      }
    })
  );

  // 保存時にプレビューを更新する
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument((document) => {
      if (isForgeMarkFile(document)) {
        PreviewPanel.update(document);
      }
    })
  );

  // 起動時にすでに .fm.md が開いていれば即座にプレビューを表示する
  const activeEditor = vscode.window.activeTextEditor;
  if (activeEditor && isForgeMarkFile(activeEditor.document)) {
    PreviewPanel.createOrShow(context.extensionUri, activeEditor.document);
  }
}

export function deactivate(): void {
  // クリーンアップは subscriptions に任せる
}
