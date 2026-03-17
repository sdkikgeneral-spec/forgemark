/**
 * remark/Unified プラグイン
 * Markdown AST（mdast）を走査してForgeMark UI ASTを生成する
 *
 * 処理優先順位:
 * 1. fenced code block (include)
 * 2. heading[depth=1] → Screen
 * 3. heading[depth=2] → Card/MenuBar/... (クラス昇格)
 * 4. heading[depth=3] → Menu/Tab/Pane 等（親コンテキスト依存）
 * 5. paragraph → Row/Button/Input/Text
 * 6. list → MenuItem/TreeItem 等（親コンテキスト依存）
 * 7. thematicBreak → Separator/Divider
 * 8. image → Avatar/Image
 * 9. table → Table
 */

import type { Root, RootContent, Code, Heading, Paragraph, List, ListItem, ThematicBreak, Image, Table as MdTable, Position as MdastPosition } from "mdast";
import { toString as mdastToString } from "mdast-util-to-string";
import { parseAttrBlock } from "./attrParser.js";
import { parseInlineElements } from "./inlineParser.js";
import { isRowSyntax, parseRowSyntax } from "./rowParser.js";
import {
  mapListItems,
  mapToSelectOptions,
  mapToComboboxOptions,
  type RawListItem,
} from "./listMapper.js";
import {
  mapH1ToScreen,
  mapH2ToNode,
  mapH3ToNode,
  extractAlertVariant,
  extractGridCols,
} from "./headingMapper.js";
import { parseCanonicalIncludeWithWarnings } from "../include/canonicalParser.js";
import { parseSugarInclude } from "../include/sugarParser.js";
import { replaceEscapes, restoreEscapes } from "./escapeHandler.js";
import type {
  AstNode,
  AstNodeType,
  ScreenNode,
  CardNode,
  MenuBarNode,
  MenuNode,
  TreeNode,
  PanesNode,
  PaneNode,
  RadioGroupNode,
  TabsNode,
  TabNode,
  AccordionNode,
  AccordionItemNode,
  DropdownNode,
  ListboxNode,
  ToolbarNode,
  StatusBarNode,
  AlertNode,
  GridNode,
  GridCellNode,
  TableNode,
  BreadcrumbNode,
  TextNode,
  DividerNode,
  UnknownNode,
  IncludeNode,
  ImageNode,
  AvatarNode,
  ToolbarItemNode,
  ToolbarSeparatorNode,
  MenuItemNode,
  MenuSeparatorNode,
  DropdownItemNode,
} from "../ast/types.js";

/** パース中のコンテキストスタック要素 */
interface ContextFrame {
  nodeType: AstNodeType;
  node: AstNode;
}

/** プラグインの内部状態 */
interface PluginState {
  nodes: AstNode[];
  contextStack: ContextFrame[];
}

/**
 * mdastのRootを走査してForgeMark UI ASTノード配列を生成する
 */
export function transformMdastToAst(root: Root): AstNode[] {
  const state: PluginState = {
    nodes: [],
    contextStack: [],
  };

  for (const child of root.children) {
    processNode(child, state);
  }

  // スタックに残っているノードをフラッシュ
  flushContextStack(state);

  return state.nodes;
}

/**
 * mdastノードを処理してASTノードを生成する
 */
function processNode(node: RootContent, state: PluginState): void {
  switch (node.type) {
    case "code":
      processCode(node as Code, state);
      break;
    case "heading":
      processHeading(node as Heading, state);
      break;
    case "paragraph":
      processParagraph(node as Paragraph, state);
      break;
    case "list":
      processList(node as List, state);
      break;
    case "thematicBreak":
      processThematicBreak(state);
      break;
    case "table":
      processTable(node as MdTable, state);
      break;
    default:
      // 未知のmdastノードは無視
      break;
  }
}

/**
 * fenced code block の処理
 * lang === "include" の場合はIncludeノードに変換
 */
function processCode(node: Code, state: PluginState): void {
  if (node.lang === "include") {
    const includeNode = parseIncludeBlock(node);
    if (includeNode) {
      appendToCurrentContext(includeNode, state);
      return;
    }
  }
  // include以外のコードブロックはUnknownとして扱う
  appendToCurrentContext(
    {
      id: "",
      type: "Unknown",
      class: [],
      dir: "auto",
      raw: `\`\`\`${node.lang ?? ""}\n${node.value}\n\`\`\``,
    } satisfies UnknownNode,
    state,
  );
}

/**
 * Includeブロックをパースする
 * 正規形（フェンスドYAML）と糖衣形（1行）を判別して処理する
 * unknownKeys・fallbackRaw・position をノードにセットする
 */
function parseIncludeBlock(node: Code): IncludeNode | null {
  let includeNode: IncludeNode | null;

  if (node.meta && node.value.trim() === "") {
    // 糖衣形: meta属性にキーバリューが含まれる
    includeNode = parseSugarInclude(node.meta);
  } else {
    // 正規形: コードブロック内容を解析（未知キー警告も取得）
    const result = parseCanonicalIncludeWithWarnings(node.value);
    includeNode = result.node;
  }

  if (includeNode && node.position) {
    // mdast の position を AST ノードに引き継ぐ
    includeNode = { ...includeNode, position: toAstPosition(node.position) };
  }

  return includeNode;
}

/**
 * mdast の Position を ForgeMark AST の Position に変換する
 */
function toAstPosition(pos: MdastPosition): import("../ast/types.js").Position {
  return {
    start: {
      line: pos.start.line,
      column: pos.start.column,
      offset: pos.start.offset ?? 0,
    },
    end: {
      line: pos.end.line,
      column: pos.end.column,
      offset: pos.end.offset ?? 0,
    },
  };
}

/**
 * 見出しの処理
 */
function processHeading(node: Heading, state: PluginState): void {
  const text = mdastToString(node);

  switch (node.depth) {
    case 1: {
      // H1 → Screen（新しいコンテキストを開始）
      flushContextStack(state);
      const screenBase = mapH1ToScreen(text);
      const screenNode: ScreenNode = {
        ...screenBase,
        children: [],
        position: node.position ? toAstPosition(node.position) : undefined,
      };
      state.contextStack.push({ nodeType: "Screen", node: screenNode });
      break;
    }
    case 2: {
      // H2 → Card または昇格ノード
      const { type, label, classes, attrs, events, dir } = mapH2ToNode(text);
      const h2Base = buildH2Node(type, label, classes, attrs, events, dir);
      const h2Node = h2Base && node.position
        ? { ...h2Base, position: toAstPosition(node.position) }
        : h2Base;
      if (h2Node) {
        // Screen内のH2はScreenのchildrenに追加
        // Screen外のH2は直接rootに追加
        const topFrame = state.contextStack[state.contextStack.length - 1];
        if (topFrame && topFrame.nodeType !== "Screen") {
          // Screenより深いコンテキストはフラッシュ
          popToScreenOrRoot(state);
        }
        state.contextStack.push({ nodeType: type, node: h2Node });
      }
      break;
    }
    case 3: {
      // H3 → 親コンテキスト依存
      const parentFrame = state.contextStack[state.contextStack.length - 1];
      const parentType = parentFrame?.nodeType ?? "Screen";
      const { type: h3Type, label: h3Label, classes: h3Classes, attrs: h3Attrs, dir: h3Dir } =
        mapH3ToNode(text, parentType);

      if (h3Type) {
        const h3Base = buildH3Node(
          h3Type,
          h3Label,
          h3Classes,
          h3Attrs,
          h3Dir,
        );
        const h3Node = h3Base && node.position
          ? { ...h3Base, position: toAstPosition(node.position) }
          : h3Base;
        if (h3Node) {
          // 前の同レベルH3コンテキストをフラッシュ
          const top = state.contextStack[state.contextStack.length - 1];
          if (top && isH3NodeType(top.nodeType)) {
            popH3Context(state);
          }
          state.contextStack.push({ nodeType: h3Type, node: h3Node });
        }
      } else {
        // 未知のH3コンテキスト → UnknownとしてChildに追加
        appendToCurrentContext(
          {
            id: "",
            type: "Unknown",
            class: [],
            dir: "auto",
            raw: `### ${text}`,
            position: node.position ? toAstPosition(node.position) : undefined,
          } satisfies UnknownNode,
          state,
        );
      }
      break;
    }
    default:
      // H4以下は通常テキストとして扱う
      appendToCurrentContext(
        {
          id: "",
          type: "Text",
          class: [],
          dir: "auto",
          content: text,
          position: node.position ? toAstPosition(node.position) : undefined,
        } satisfies TextNode,
        state,
      );
  }
}

/**
 * 段落の処理
 * Row記法・インライン記法・通常テキストを判別する
 */
function processParagraph(node: Paragraph, state: PluginState): void {
  const text = mdastToString(node);
  const escaped = replaceEscapes(text);
  const restored = restoreEscapes(escaped);

  const nodePos = node.position ? toAstPosition(node.position) : undefined;

  // Row記法: [[ A | B ]]
  if (isRowSyntax(restored)) {
    const rowNode = parseRowSyntax(restored);
    if (rowNode) {
      appendToCurrentContext(
        { ...rowNode, position: nodePos },
        state,
      );
      return;
    }
  }

  // インライン要素（Button/Input 等）
  const inlineNodes = parseInlineElements(restored);
  if (inlineNodes.length > 0) {
    for (const n of inlineNodes) {
      // 段落内の複数インライン要素は同じ段落位置を共有する
      appendToCurrentContext({ ...n, position: nodePos }, state);
    }
    return;
  }

  // 画像ノードを個別に処理
  for (const child of node.children) {
    if (child.type === "image") {
      const imgNode = processImage(child as Image);
      appendToCurrentContext({ ...imgNode, position: nodePos }, state);
      return;
    }
  }

  // 通常テキスト
  appendToCurrentContext(
    {
      id: "",
      type: "Text",
      class: [],
      dir: "auto",
      content: restoreEscapes(text),
      position: nodePos,
    } satisfies TextNode,
    state,
  );
}

/**
 * 画像ノードの処理（Avatar/Image）
 */
function processImage(node: Image): ImageNode | AvatarNode {
  const attrRaw = node.title ?? "";
  const attrs = parseAttrBlock(attrRaw);
  const w = attrs.attrs["w"];
  const h = attrs.attrs["h"];
  const size = attrs.attrs["size"];

  if (attrs.classes.includes("avatar")) {
    return {
      id: "",
      type: "Avatar",
      class: attrs.classes,
      dir: "auto",
      src: node.url,
      alt: node.alt ?? "",
      size: typeof size === "string" ? parseInt(size, 10) : undefined,
    } satisfies AvatarNode;
  }

  return {
    id: "",
    type: "Image",
    class: attrs.classes,
    dir: "auto",
    src: node.url,
    alt: node.alt ?? "",
    w: typeof w === "string" ? parseInt(w, 10) : undefined,
    h: typeof h === "string" ? parseInt(h, 10) : undefined,
  } satisfies ImageNode;
}

/**
 * リストの処理（親コンテキスト依存）
 */
function processList(node: List, state: PluginState): void {
  const parentFrame = state.contextStack[state.contextStack.length - 1];
  if (!parentFrame) return;

  const rawItems = extractRawListItems(node);
  const parentType = parentFrame.nodeType;

  // Toolbar: セパレーター（---）でグループ分け
  if (parentType === "Toolbar") {
    const toolbarNode = parentFrame.node as ToolbarNode;
    const toolbarItems = mapListItems(rawItems, "Toolbar") as Array<
      ToolbarItemNode | ToolbarSeparatorNode
    >;
    // セパレーターでグループを分割
    const groups: Array<Array<ToolbarItemNode | ToolbarSeparatorNode>> = [[]];
    for (const item of toolbarItems) {
      if (item.type === "ToolbarSeparator") {
        groups.push([]);
      } else {
        groups[groups.length - 1]?.push(item);
      }
    }
    const updated = {
      ...toolbarNode,
      groups: [...toolbarNode.groups, ...groups.filter((g) => g.length > 0)],
    } as ToolbarNode;
    parentFrame.node = updated;
    return;
  }

  // Select/Combobox: 直前の子ノードがSelect/Comboboxの場合にオプションをセット
  // （インライン要素はcontextStackに積まれないため、親フレームの最後の子を確認する）
  const lastChild = getLastChildNode(parentFrame);
  if (lastChild?.type === "Select" || lastChild?.type === "Combobox") {
    updateLastChildOptions(parentFrame, (n) => {
      if (n.type === "Select") {
        return { ...n, options: mapToSelectOptions(rawItems) };
      } else if (n.type === "Combobox") {
        return { ...n, options: mapToComboboxOptions(rawItems) };
      }
      return n;
    });
    return;
  }

  // Select/Combobox がcontextStack上に直接ある場合（将来の拡張用）
  if (
    parentType === "Select" ||
    parentType === "Combobox" ||
    parentType === "Input"
  ) {
    const inputNode = parentFrame.node;
    if (inputNode.type === "Select") {
      const options = mapToSelectOptions(rawItems);
      parentFrame.node = { ...inputNode, options };
    } else if (inputNode.type === "Combobox") {
      const options = mapToComboboxOptions(rawItems);
      parentFrame.node = { ...inputNode, options };
    }
    return;
  }

  const mappedItems = mapListItems(rawItems, parentType);
  if (mappedItems.length === 0) return;

  // 親ノードにアイテムを追加
  appendItemsToParent(mappedItems, parentFrame);
}

/**
 * 区切り線の処理（文脈によってDivider/MenuSeparator/ToolbarSeparatorに変換）
 */
function processThematicBreak(state: PluginState): void {
  const parentFrame = state.contextStack[state.contextStack.length - 1];
  const parentType = parentFrame?.nodeType;

  if (parentType === "Menu" || parentType === "Dropdown") {
    appendToCurrentContext(
      { id: "", type: "MenuSeparator", class: [], dir: "auto" },
      state,
    );
  } else {
    appendToCurrentContext(
      { id: "", type: "Divider", class: [], dir: "auto" } satisfies DividerNode,
      state,
    );
  }
}

/**
 * Markdownテーブルの処理
 */
function processTable(node: MdTable, state: PluginState): void {
  const parentFrame = state.contextStack[state.contextStack.length - 1];
  const parentType = parentFrame?.nodeType;

  // Table昇格（## {.table}の直後のMarkdownテーブル）
  if (parentType === "Table") {
    // mdastのtableからcolumnsとrowsを抽出
    const [headerRow, ...bodyRows] = node.children;
    const columns = headerRow
      ? headerRow.children.map((cell) => mdastToString(cell))
      : [];
    const rows = bodyRows.map((row) =>
      row.children.map((cell) => mdastToString(cell)),
    );
    const tableNode = parentFrame!.node as TableNode;
    parentFrame!.node = { ...tableNode, columns, rows };
    return;
  }

  // 通常のMarkdownテーブル（Unknownとして扱う）
  appendToCurrentContext(
    {
      id: "",
      type: "Unknown",
      class: [],
      dir: "auto",
      raw: "[markdown table]",
    } satisfies UnknownNode,
    state,
  );
}

// ─── ヘルパー関数 ───────────────────────────────────────────────────────────

/**
 * H2ノードを種別に応じて生成する
 */
function buildH2Node(
  type: AstNodeType,
  label: string,
  classes: string[],
  attrs: Record<string, string | true>,
  events: Record<string, string>,
  dir: "auto" | "ltr" | "rtl",
): AstNode | null {
  switch (type) {
    case "MenuBar":
      return { id: "", type: "MenuBar", class: classes, dir, menus: [] } satisfies MenuBarNode;
    case "Tree":
      return { id: "", type: "Tree", class: classes, dir, items: [] } satisfies TreeNode;
    case "Panes": {
      const dirAttr = attrs["horizontal"] !== undefined ? "horizontal" : attrs["vertical"] !== undefined ? "vertical" : "horizontal";
      return {
        id: "",
        type: "Panes",
        class: classes,
        dir,
        direction: dirAttr,
        panes: [],
      } satisfies PanesNode;
    }
    case "RadioGroup":
      return {
        id: "",
        type: "RadioGroup",
        class: classes,
        dir,
        name: typeof attrs["name"] === "string" ? attrs["name"] : undefined,
        items: [],
      };
    case "Tabs":
      return { id: "", type: "Tabs", class: classes, dir, tabs: [] };
    case "Accordion":
      return { id: "", type: "Accordion", class: classes, dir, items: [] };
    case "Breadcrumb":
      return { id: "", type: "Breadcrumb", class: classes, dir, items: [] } satisfies BreadcrumbNode;
    case "Dropdown":
      return { id: "", type: "Dropdown", class: classes, dir, label, items: [] } satisfies DropdownNode;
    case "Listbox":
      return {
        id: "",
        type: "Listbox",
        class: classes,
        dir,
        multiple: attrs["multiple"] === true,
        items: [],
      };
    case "Toolbar":
      return { id: "", type: "Toolbar", class: classes, dir, groups: [] } satisfies ToolbarNode;
    case "StatusBar":
      return { id: "", type: "StatusBar", class: classes, dir, items: [] } satisfies StatusBarNode;
    case "Alert":
      return {
        id: "",
        type: "Alert",
        class: classes,
        dir,
        variant: extractAlertVariant(classes),
        label,
        children: [],
      } satisfies AlertNode;
    case "Grid":
      return {
        id: "",
        type: "Grid",
        class: classes,
        dir,
        cols: extractGridCols(attrs, classes),
        gap: typeof attrs["gap"] === "string" ? parseInt(attrs["gap"], 10) : undefined,
        cells: [],
      } satisfies GridNode;
    case "Table":
      return {
        id: "",
        type: "Table",
        class: classes,
        dir,
        striped: attrs["striped"] === true,
        bordered: attrs["bordered"] === true,
        hoverable: attrs["hoverable"] === true,
        compact: attrs["compact"] === true,
        columns: [],
        rows: [],
      } satisfies TableNode;
    case "Card":
    default:
      return { id: "", type: "Card", class: classes, dir, label, children: [] } satisfies CardNode;
  }
}

/**
 * H3ノードを種別に応じて生成する
 */
function buildH3Node(
  type: AstNodeType,
  label: string,
  classes: string[],
  attrs: Record<string, string | true>,
  dir: "auto" | "ltr" | "rtl",
): AstNode | null {
  switch (type) {
    case "Menu":
      return {
        id: "",
        type: "Menu",
        class: classes,
        dir,
        label: label.replace(/^&/, ""),
        accelerator: label.startsWith("&") ? label[1] : undefined,
        items: [],
      } satisfies MenuNode;
    case "Pane":
      return {
        id: "",
        type: "Pane",
        class: classes,
        dir,
        label,
        w: typeof attrs["w"] === "string" ? parseInt(attrs["w"], 10) : undefined,
        h: typeof attrs["h"] === "string" ? parseInt(attrs["h"], 10) : undefined,
        flex: typeof attrs["flex"] === "string" ? parseFloat(attrs["flex"]) : undefined,
        collapsed: attrs["collapsed"] === true,
        children: [],
      } satisfies PaneNode;
    case "Tab":
      return {
        id: "",
        type: "Tab",
        class: classes,
        dir,
        label,
        selected: attrs["selected"] === true,
        disabled: attrs["disabled"] === true,
        children: [],
      } satisfies TabNode;
    case "AccordionItem":
      return {
        id: "",
        type: "AccordionItem",
        class: classes,
        dir,
        label,
        collapsed: attrs["collapsed"] === true,
        disabled: attrs["disabled"] === true,
        children: [],
      } satisfies AccordionItemNode;
    case "GridCell":
      return {
        id: "",
        type: "GridCell",
        class: classes,
        dir,
        label,
        span: typeof attrs["span"] === "string" ? parseInt(attrs["span"], 10) : undefined,
        rowSpan: typeof attrs["rowspan"] === "string" ? parseInt(attrs["rowspan"], 10) : undefined,
        children: [],
      } satisfies GridCellNode;
    default:
      return null;
  }
}

/**
 * 現在のコンテキストにノードを追加する
 */
function appendToCurrentContext(node: AstNode, state: PluginState): void {
  const frame = state.contextStack[state.contextStack.length - 1];
  if (!frame) {
    state.nodes.push(node);
    return;
  }
  appendNodeToFrame(node, frame);
}

/**
 * フレームのノードにchildを追加する
 */
function appendNodeToFrame(node: AstNode, frame: ContextFrame): void {
  const parent = frame.node;
  switch (parent.type) {
    case "Screen":
      (parent as ScreenNode).children.push(node);
      break;
    case "Card":
      (parent as CardNode).children.push(node);
      break;
    case "Alert":
      (parent as AlertNode).children.push(node);
      break;
    case "Pane":
      (parent as PaneNode).children.push(node);
      break;
    case "Tab":
      (parent as TabNode).children.push(node);
      break;
    case "AccordionItem":
      (parent as AccordionItemNode).children.push(node);
      break;
    case "GridCell":
      (parent as GridCellNode).children.push(node);
      break;
    case "Menu":
      // MenuSeparatorなどのインライン追加（thematicBreak経由）
      (parent as MenuNode).items.push(node as unknown as MenuItemNode | MenuSeparatorNode);
      break;
    case "Dropdown":
      // MenuSeparatorなどのインライン追加（thematicBreak経由）
      (parent as DropdownNode).items.push(node as unknown as DropdownItemNode | MenuSeparatorNode);
      break;
    default:
      // チャイルドを持てない親にはUnknownとして追加しない
      break;
  }
}

/**
 * フレームの最後の子ノードを返す（children配列を持つ親のみ対象）
 */
function getLastChildNode(frame: ContextFrame): AstNode | undefined {
  const parent = frame.node;
  switch (parent.type) {
    case "Screen": return (parent as ScreenNode).children.at(-1);
    case "Card": return (parent as CardNode).children.at(-1);
    case "Alert": return (parent as AlertNode).children.at(-1);
    case "Pane": return (parent as PaneNode).children.at(-1);
    case "Tab": return (parent as TabNode).children.at(-1);
    case "AccordionItem": return (parent as AccordionItemNode).children.at(-1);
    case "GridCell": return (parent as GridCellNode).children.at(-1);
    default: return undefined;
  }
}

/**
 * フレームの最後の子ノードをupdaterで置き換える
 */
function updateLastChildOptions(
  frame: ContextFrame,
  updater: (node: AstNode) => AstNode,
): void {
  const parent = frame.node;
  let arr: AstNode[] | undefined;
  switch (parent.type) {
    case "Screen": arr = (parent as ScreenNode).children; break;
    case "Card": arr = (parent as CardNode).children; break;
    case "Alert": arr = (parent as AlertNode).children; break;
    case "Pane": arr = (parent as PaneNode).children; break;
    case "Tab": arr = (parent as TabNode).children; break;
    case "AccordionItem": arr = (parent as AccordionItemNode).children; break;
    case "GridCell": arr = (parent as GridCellNode).children; break;
    default: return;
  }
  if (arr && arr.length > 0) {
    arr[arr.length - 1] = updater(arr[arr.length - 1]!);
  }
}

/**
 * 親ノードにアイテムを追加する
 */
function appendItemsToParent(items: AstNode[], frame: ContextFrame): void {
  const parent = frame.node;
  switch (parent.type) {
    case "MenuBar":
      (parent as MenuBarNode).menus.push(
        ...(items as MenuNode[]),
      );
      break;
    case "Menu":
      (parent as MenuNode).items.push(
        ...(items as Array<ReturnType<typeof mapListItems>[number]>),
      );
      break;
    case "Tree":
      (parent as TreeNode).items.push(...items as Parameters<typeof mapListItems>[0]);
      break;
    case "RadioGroup":
      (parent as RadioGroupNode).items.push(...items as Parameters<typeof mapListItems>[0]);
      break;
    case "Breadcrumb":
      (parent as BreadcrumbNode).items.push(...items as Parameters<typeof mapListItems>[0]);
      break;
    case "Dropdown":
      (parent as DropdownNode).items.push(...items as Parameters<typeof mapListItems>[0]);
      break;
    case "Listbox":
      (parent as ListboxNode).items.push(...items as Parameters<typeof mapListItems>[0]);
      break;
    case "StatusBar":
      (parent as StatusBarNode).items.push(...items as Parameters<typeof mapListItems>[0]);
      break;
    default:
      break;
  }
}

/**
 * コンテキストスタックの全フレームをフラッシュしてrootノードに追加する
 */
function flushContextStack(state: PluginState): void {
  while (state.contextStack.length > 0) {
    flushTopFrame(state);
  }
}

/**
 * スタックの最上位フレームをポップして親に追加する
 * appendNodeToFrame（インライン追加）とは分離した専用関数で二重追加を防ぐ
 */
function flushTopFrame(state: PluginState): void {
  const frame = state.contextStack.pop();
  if (!frame) return;

  const parent = state.contextStack[state.contextStack.length - 1];
  if (parent) {
    addChildToParentFrame(frame.node, parent);
  } else {
    state.nodes.push(frame.node);
  }
}

/**
 * フラッシュ時専用の親への追加関数
 * コンテナ型ごとの適切な配列に追加する
 * appendNodeToFrame（インライン追加）と分けることで二重追加バグを構造的に防ぐ
 */
function addChildToParentFrame(child: AstNode, parent: ContextFrame): void {
  switch (parent.node.type) {
    case "Screen":
      (parent.node as ScreenNode).children.push(child);
      break;
    case "Card":
      (parent.node as CardNode).children.push(child);
      break;
    case "Alert":
      (parent.node as AlertNode).children.push(child);
      break;
    case "Pane":
      (parent.node as PaneNode).children.push(child);
      break;
    case "Tab":
      (parent.node as TabNode).children.push(child);
      break;
    case "AccordionItem":
      (parent.node as AccordionItemNode).children.push(child);
      break;
    case "GridCell":
      (parent.node as GridCellNode).children.push(child);
      break;
    case "MenuBar":
      if (child.type === "Menu") {
        (parent.node as MenuBarNode).menus.push(child as MenuNode);
      }
      break;
    case "Tabs":
      if (child.type === "Tab") {
        (parent.node as TabsNode).tabs.push(child as TabNode);
      }
      break;
    case "Accordion":
      if (child.type === "AccordionItem") {
        (parent.node as AccordionNode).items.push(child as AccordionItemNode);
      }
      break;
    case "Panes":
      if (child.type === "Pane") {
        (parent.node as PanesNode).panes.push(child as PaneNode);
      }
      break;
    case "Grid":
      if (child.type === "GridCell") {
        (parent.node as GridNode).cells.push(child as GridCellNode);
      }
      break;
    default:
      break;
  }
}

/**
 * Screenまたはrootまでスタックをポップする
 */
function popToScreenOrRoot(state: PluginState): void {
  while (
    state.contextStack.length > 0 &&
    state.contextStack[state.contextStack.length - 1]?.nodeType !== "Screen"
  ) {
    flushTopFrame(state);
  }
}

/**
 * H3コンテキストをポップする
 */
function popH3Context(state: PluginState): void {
  const top = state.contextStack[state.contextStack.length - 1];
  if (top && isH3NodeType(top.nodeType)) {
    flushTopFrame(state);
  }
}

/**
 * H3レベルのノード種別かどうかを判定する
 */
function isH3NodeType(type: AstNodeType): boolean {
  return (
    type === "Menu" ||
    type === "Pane" ||
    type === "Tab" ||
    type === "AccordionItem" ||
    type === "GridCell"
  );
}

/**
 * mdastのListからRawListItemの配列を抽出する
 */
function extractRawListItems(list: List): RawListItem[] {
  return list.children.map((item: ListItem) => {
    const text = mdastToString(item).split("\n")[0] ?? "";
    const isSeparator = text.trim() === "---";

    // ネストされたリストを子アイテムとして抽出
    const nestedList = item.children.find(
      (child) => child.type === "list",
    ) as List | undefined;
    const children = nestedList ? extractRawListItems(nestedList) : [];

    return { text: text.trim(), isSeparator, children };
  });
}

// 型のre-export（remarkPlugin.tsを参照するファイルが型を利用できるように）
export type { TabsNode, AccordionNode, PanesNode };
