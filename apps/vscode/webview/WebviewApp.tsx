import { useState, useEffect } from "react";
import type { AstNode } from "@forgemark/core";
import { PreviewRenderer } from "@forgemark/renderer";
import { vscode } from "./vscodeApi";

// extension host → webview メッセージ型
interface UpdateMessage {
  type: "update";
  nodes: AstNode[];
}

// WebviewApp: extension host から ASTを受け取ってプレビュー表示する
export function WebviewApp() {
  const [nodes, setNodes] = useState<AstNode[]>([]);

  useEffect(() => {
    const handler = (event: MessageEvent<UpdateMessage>) => {
      if (event.data.type === "update") {
        setNodes(event.data.nodes);
      }
    };

    window.addEventListener("message", handler);

    // extension host に準備完了を通知して初回コンテンツを要求する
    vscode.postMessage({ type: "ready" });

    return () => window.removeEventListener("message", handler);
  }, []);

  return <PreviewRenderer nodes={nodes} theme="sketch" />;
}
