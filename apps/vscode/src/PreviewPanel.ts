import * as vscode from "vscode";
import { parseMarkdown } from "@forgemark/core";

/**
 * ForgeMark プレビュー Webview パネル
 * 拡張機能ホスト側でMarkdownをパースしてASTをwebviewに送信する
 */
export class PreviewPanel {
  static currentPanel: PreviewPanel | undefined;

  private readonly panel: vscode.WebviewPanel;
  private readonly extensionUri: vscode.Uri;
  private lastDocument: vscode.TextDocument | undefined;
  private readonly disposables: vscode.Disposable[] = [];

  // パネルを作成または既存パネルにフォーカスする
  static createOrShow(
    extensionUri: vscode.Uri,
    document: vscode.TextDocument
  ): void {
    const column = vscode.ViewColumn.Beside;

    if (PreviewPanel.currentPanel) {
      PreviewPanel.currentPanel.panel.reveal(column);
      PreviewPanel.currentPanel.updateContent(document);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      "forgemarkPreview",
      "ForgeMark Preview",
      column,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.joinPath(extensionUri, "dist", "webview"),
        ],
      }
    );

    PreviewPanel.currentPanel = new PreviewPanel(panel, extensionUri);
    PreviewPanel.currentPanel.updateContent(document);
  }

  // ドキュメント更新を既存パネルに通知する（保存時・タイプ時）
  static update(document: vscode.TextDocument): void {
    PreviewPanel.currentPanel?.updateContent(document);
  }

  private constructor(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri
  ) {
    this.panel = panel;
    this.extensionUri = extensionUri;

    this.panel.webview.html = this.getHtml();

    // webview が "ready" を送ってきたら最後のドキュメントを再送する
    this.panel.webview.onDidReceiveMessage(
      (msg: { type: string }) => {
        if (msg.type === "ready" && this.lastDocument) {
          this.sendAst(this.lastDocument);
        }
      },
      null,
      this.disposables
    );

    // 非表示から再表示されたときに内容を再送する
    this.panel.onDidChangeViewState(
      ({ webviewPanel }) => {
        if (webviewPanel.visible && this.lastDocument) {
          this.sendAst(this.lastDocument);
        }
      },
      null,
      this.disposables
    );

    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
  }

  private updateContent(document: vscode.TextDocument): void {
    this.lastDocument = document;
    this.sendAst(document);
  }

  private sendAst(document: vscode.TextDocument): void {
    const result = parseMarkdown(document.getText(), document.fileName);
    void this.panel.webview.postMessage({
      type: "update",
      nodes: result.nodes,
      diagnostics: result.diagnostics,
    });
  }

  private getHtml(): string {
    const webview = this.panel.webview;

    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, "dist", "webview", "main.js")
    );
    const cssUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, "dist", "webview", "index.css")
    );

    // XSS防止のためnonce付きCSPを設定する
    const nonce = generateNonce();

    return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Security-Policy"
    content="default-src 'none';
             style-src ${webview.cspSource} 'unsafe-inline';
             script-src 'nonce-${nonce}';" />
  <link rel="stylesheet" href="${cssUri}" />
  <title>ForgeMark Preview</title>
</head>
<body>
  <div id="root"></div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }

  private dispose(): void {
    PreviewPanel.currentPanel = undefined;
    this.panel.dispose();
    this.disposables.forEach((d) => d.dispose());
    this.disposables.length = 0;
  }
}

function generateNonce(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 32 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
}

