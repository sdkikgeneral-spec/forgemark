import type { InputNode } from "@forgemark/core";

// InputRenderer: [___]{...} → ワイヤーフレーム入力フィールド
export function InputRenderer({ node }: { node: InputNode }) {
  const dirAttr = node.dir !== "auto" ? node.dir : undefined;
  const label = node.placeholder ?? node.name ?? node.inputType;

  return (
    <div
      className={`flex items-center gap-1.5 ${node.class.join(" ")}`}
      dir={dirAttr}
    >
      <div className="flex-1 border-b-2 border-dashed border-gray-400 py-1 px-0.5 flex items-center gap-1">
        <span className="text-xs text-gray-400 truncate">{label}</span>
        {node.inputType === "password" && (
          <span className="text-gray-300 text-xs ml-auto">••••</span>
        )}
      </div>
      {node.required && (
        <span className="text-red-400 text-xs leading-none" title="required">*</span>
      )}
    </div>
  );
}
