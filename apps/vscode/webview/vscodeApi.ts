// VS Code Webview API ラッパー
// acquireVsCodeApi() は VS Code webview でのみ利用可能なグローバル関数
interface VsCodeApi {
  postMessage(message: unknown): void;
  getState<T>(): T | undefined;
  setState<T>(state: T): void;
}

declare function acquireVsCodeApi(): VsCodeApi;

// シングルトン: 複数回呼ぶとエラーになるため一度だけ取得する
export const vscode: VsCodeApi = acquireVsCodeApi();
