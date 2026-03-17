import type { AstNode } from "@forgemark/core";
import { NodeRenderer } from "./NodeRenderer";

interface PreviewRendererProps {
  nodes: AstNode[];
  /** スケッチ | クリーン（将来拡張用、現在は sketch のみ） */
  theme?: "sketch" | "clean";
}

// PreviewRenderer: ASTノード配列をUIスケルトンとして描画するトップレベルコンポーネント
export function PreviewRenderer({ nodes, theme = "sketch" }: PreviewRendererProps) {
  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        プレビューなし
      </div>
    );
  }

  return (
    <div
      className={[
        "p-4 flex flex-col gap-4 min-h-full",
        theme === "sketch" ? "bg-gray-50 font-sans" : "bg-white",
      ].join(" ")}
      data-theme={theme}
    >
      {nodes.map((node) => (
        <NodeRenderer key={node.id} node={node} />
      ))}
    </div>
  );
}
