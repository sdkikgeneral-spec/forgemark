import type { ScreenNode } from "@forgemark/core";
import { NodeRenderer } from "../NodeRenderer";

// ScreenRenderer: H1 → 画面ルートコンテナ（モックブラウザ風）
export function ScreenRenderer({ node }: { node: ScreenNode }) {
  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
      {/* ブラウザクロム風ヘッダー */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 border-b border-gray-300">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-gray-300 block" />
          <span className="w-3 h-3 rounded-full bg-gray-300 block" />
          <span className="w-3 h-3 rounded-full bg-gray-300 block" />
        </div>
        <span className="text-xs text-gray-400 font-mono truncate flex-1 text-center pr-8">
          {node.route || "/"}
        </span>
      </div>
      {/* 画面コンテンツ */}
      <div className="p-4 flex flex-col gap-3">
        {node.children.map((child) => (
          <NodeRenderer key={child.id} node={child} />
        ))}
      </div>
    </div>
  );
}
