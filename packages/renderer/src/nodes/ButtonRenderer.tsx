import type { ButtonNode } from "@forgemark/core";

// ButtonRenderer: [label]{...} → ワイヤーフレームボタン
export function ButtonRenderer({ node }: { node: ButtonNode }) {
  const dirAttr = node.dir !== "auto" ? node.dir : undefined;
  const isPrimary = node.class.includes("primary");

  return (
    <button
      type="button"
      disabled={node.disabled}
      dir={dirAttr}
      className={[
        "inline-flex items-center justify-center px-4 py-1.5 text-sm rounded",
        "border border-dashed transition-none cursor-default",
        isPrimary
          ? "border-gray-600 bg-gray-100 text-gray-700 font-medium"
          : "border-gray-400 text-gray-600",
        node.disabled ? "opacity-40" : "",
        node.class.filter((c) => c !== "primary").join(" "),
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {node.label}
    </button>
  );
}
