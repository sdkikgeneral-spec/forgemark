import type { UnknownNode } from "@forgemark/core";

// UnknownRenderer: パース失敗ノード → エラーインジケーター
export function UnknownRenderer({ node }: { node: UnknownNode }) {
  return (
    <div className="border border-dashed border-red-300 rounded px-3 py-1.5 bg-red-50 flex items-center gap-2">
      <span className="text-red-400 text-xs">⚠</span>
      <span className="text-xs text-red-500 font-mono truncate">{node.raw}</span>
    </div>
  );
}
