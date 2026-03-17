import type { CardNode } from "@forgemark/core";
import { NodeRenderer } from "../NodeRenderer";

// CardRenderer: H2 → ラベル付きカードコンテナ
export function CardRenderer({ node }: { node: CardNode }) {
  const dirAttr = node.dir !== "auto" ? node.dir : undefined;

  return (
    <div
      className={`border border-dashed border-gray-300 rounded-md overflow-hidden ${node.class.join(" ")}`}
      dir={dirAttr}
    >
      {node.label && (
        <div className="px-3 py-1.5 bg-gray-50 border-b border-dashed border-gray-300">
          <span className="text-xs font-medium text-gray-500">{node.label}</span>
        </div>
      )}
      <div className="p-3 flex flex-col gap-2">
        {node.children.map((child) => (
          <NodeRenderer key={child.id} node={child} />
        ))}
      </div>
    </div>
  );
}
