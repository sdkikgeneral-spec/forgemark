import type { AstNode } from "@forgemark/core";
import { ScreenRenderer } from "./nodes/ScreenRenderer";
import { CardRenderer } from "./nodes/CardRenderer";
import { RowRenderer } from "./nodes/RowRenderer";
import { InputRenderer } from "./nodes/InputRenderer";
import { ButtonRenderer } from "./nodes/ButtonRenderer";
import { TextRenderer } from "./nodes/TextRenderer";
import { DividerRenderer } from "./nodes/DividerRenderer";
import { IncludeRenderer } from "./nodes/IncludeRenderer";
import { UnknownRenderer } from "./nodes/UnknownRenderer";

// NodeRenderer: ASTノード種別に応じてレンダラーをディスパッチする
export function NodeRenderer({ node }: { node: AstNode }) {
  switch (node.type) {
    case "Screen":
      return <ScreenRenderer node={node} />;
    case "Card":
      return <CardRenderer node={node} />;
    case "Row":
      return <RowRenderer node={node} />;
    case "Input":
      return <InputRenderer node={node} />;
    case "Button":
      return <ButtonRenderer node={node} />;
    case "Text":
      return <TextRenderer node={node} />;
    case "Divider":
      return <DividerRenderer node={node} />;
    case "Include":
      return <IncludeRenderer node={node} />;
    case "Unknown":
      return <UnknownRenderer node={node} />;
    default:
      // MVP外のノードはラベル付きプレースホルダーで表示する
      return (
        <div className="border border-dashed border-gray-200 rounded px-2 py-1 text-xs text-gray-400">
          {(node as AstNode).type}
        </div>
      );
  }
}
