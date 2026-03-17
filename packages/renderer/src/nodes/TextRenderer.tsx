import type { TextNode } from "@forgemark/core";

// TextRenderer: 段落テキスト
export function TextRenderer({ node }: { node: TextNode }) {
  const dirAttr = node.dir !== "auto" ? node.dir : undefined;

  return (
    <p
      className={`text-sm text-gray-600 ${node.class.join(" ")}`}
      dir={dirAttr}
    >
      {node.content || <span className="text-gray-300 italic">（テキスト）</span>}
    </p>
  );
}
