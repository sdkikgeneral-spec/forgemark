import type { RowNode } from "@forgemark/core";
import { NodeRenderer } from "../NodeRenderer";

// RowRenderer: [[ A | B | C ]] → 実際の横並びフレックスレイアウト
export function RowRenderer({ node }: { node: RowNode }) {
  const dirAttr = node.dir !== "auto" ? node.dir : undefined;
  const extraClasses = node.class.join(" ");

  return (
    <div
      className={`flex flex-row gap-2 ${extraClasses}`}
      dir={dirAttr}
    >
      {node.columns.map((col, i) => (
        <div
          key={i}
          className="flex-1 min-w-0 flex flex-col gap-1"
        >
          {col.length > 0
            ? col.map((child) => (
                <NodeRenderer key={child.id} node={child} />
              ))
            : <div className="h-6 border border-dashed border-gray-200 rounded" />}
        </div>
      ))}
    </div>
  );
}
