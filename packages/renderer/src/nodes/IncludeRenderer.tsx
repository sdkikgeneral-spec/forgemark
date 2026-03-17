import type { IncludeNode } from "@forgemark/core";
import { NodeRenderer } from "../NodeRenderer";

// IncludeRenderer: ```include path=... ``` → パスプレースホルダー or フォールバック表示
export function IncludeRenderer({ node }: { node: IncludeNode }) {
  // フォールバックがあれば展開して表示する
  if (node.fallback && node.fallback.length > 0) {
    return (
      <div className="border border-dashed border-blue-200 rounded p-2 flex flex-col gap-1">
        <span className="text-xs text-blue-400 font-mono mb-1">{node.path}</span>
        {node.fallback.map((child) => (
          <NodeRenderer key={child.id} node={child} />
        ))}
      </div>
    );
  }

  // パスのみ表示（未解決）
  return (
    <div className="border border-dashed border-blue-300 rounded px-3 py-2 bg-blue-50 flex items-center gap-2">
      <span className="text-blue-400 text-xs">⬡</span>
      <span className="text-xs text-blue-500 font-mono truncate">{node.path}</span>
      {!node.resolved && (
        <span className="ml-auto text-xs text-red-400" title="パスが存在しません">✕</span>
      )}
    </div>
  );
}
