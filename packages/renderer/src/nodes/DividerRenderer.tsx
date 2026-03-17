import type { DividerNode } from "@forgemark/core";

// DividerRenderer: --- → 水平区切り線
export function DividerRenderer({ node: _node }: { node: DividerNode }) {
  return <hr className="border-dashed border-gray-300 my-1" />;
}
