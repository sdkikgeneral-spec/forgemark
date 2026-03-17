/**
 * ID採番・衝突解消
 * ASTノードに {nodeType}-{index} 形式のIDを付与する
 * include展開後の重複IDには `-{suffix}` を付与する
 */

import type { AstNode } from "../ast/types.js";

/**
 * ASTノード配列にIDを付与する（再帰的に処理）
 * @param nodes - ID未付与のASTノード配列
 * @param counter - 型ごとのカウンター（外部から渡す場合は衝突解消に使用）
 * @returns ID付与済みのノード配列（元配列を変更しない）
 */
export function assignIds(
  nodes: AstNode[],
  counter?: Map<string, number>,
): AstNode[] {
  const typeCounter = counter ?? new Map<string, number>();
  return nodes.map((node) => assignIdToNode(node, typeCounter));
}

/**
 * 単一ノードにIDを付与し、子ノードを再帰的に処理する
 */
function assignIdToNode(node: AstNode, counter: Map<string, number>): AstNode {
  const typeLower = node.type.toLowerCase();
  const count = counter.get(typeLower) ?? 0;
  counter.set(typeLower, count + 1);

  const id = `${typeLower}-${count}`;
  const updated = { ...node, id };

  // 子ノードの再帰処理
  return processChildren(updated, counter);
}

/**
 * 子ノードを持つ型の children を再帰的に処理する
 */
function processChildren(node: AstNode, counter: Map<string, number>): AstNode {
  switch (node.type) {
    case "Screen":
      return { ...node, children: assignIds(node.children, counter) };
    case "Card":
      return { ...node, children: assignIds(node.children, counter) };
    case "Row":
      return {
        ...node,
        columns: node.columns.map((col) => assignIds(col, counter)),
      };
    case "Include":
      return {
        ...node,
        fallback: node.fallback
          ? assignIds(node.fallback, counter)
          : undefined,
      };
    case "MenuBar":
      return {
        ...node,
        menus: node.menus.map((m) => assignIdToNode(m, counter) as typeof m),
      };
    case "Menu":
      return {
        ...node,
        items: node.items.map(
          (item) => assignIdToNode(item, counter) as typeof item,
        ),
      };
    case "Breadcrumb":
      return {
        ...node,
        items: node.items.map(
          (item) => assignIdToNode(item, counter) as typeof item,
        ),
      };
    case "Tree":
      return {
        ...node,
        items: node.items.map(
          (item) => assignIdToNode(item, counter) as typeof item,
        ),
      };
    case "TreeItem":
      return {
        ...node,
        children: node.children.map(
          (child) => assignIdToNode(child, counter) as typeof child,
        ),
      };
    case "Panes":
      return {
        ...node,
        panes: node.panes.map(
          (pane) => assignIdToNode(pane, counter) as typeof pane,
        ),
      };
    case "Pane":
      return { ...node, children: assignIds(node.children, counter) };
    case "RadioGroup":
      return {
        ...node,
        items: node.items.map(
          (item) => assignIdToNode(item, counter) as typeof item,
        ),
      };
    case "Tabs":
      return {
        ...node,
        tabs: node.tabs.map(
          (tab) => assignIdToNode(tab, counter) as typeof tab,
        ),
      };
    case "Tab":
      return { ...node, children: assignIds(node.children, counter) };
    case "Accordion":
      return {
        ...node,
        items: node.items.map(
          (item) => assignIdToNode(item, counter) as typeof item,
        ),
      };
    case "AccordionItem":
      return { ...node, children: assignIds(node.children, counter) };
    case "Dropdown":
      return {
        ...node,
        items: node.items.map(
          (item) => assignIdToNode(item, counter) as typeof item,
        ),
      };
    case "Listbox":
      return {
        ...node,
        items: node.items.map(
          (item) => assignIdToNode(item, counter) as typeof item,
        ),
      };
    case "Toolbar":
      return {
        ...node,
        groups: node.groups.map((group) =>
          group.map((item) => assignIdToNode(item, counter) as typeof item),
        ),
      };
    case "StatusBar":
      return {
        ...node,
        items: node.items.map(
          (item) => assignIdToNode(item, counter) as typeof item,
        ),
      };
    case "Alert":
      return { ...node, children: assignIds(node.children, counter) };
    case "Grid":
      return {
        ...node,
        cells: node.cells.map(
          (cell) => assignIdToNode(cell, counter) as typeof cell,
        ),
      };
    case "GridCell":
      return { ...node, children: assignIds(node.children, counter) };
    default:
      return node;
  }
}

/**
 * include展開後のID衝突を解消する
 * 既存IDセットに対して重複するIDをリネームする
 * @param nodes - 展開済みノード配列
 * @param existingIds - 既存IDセット
 * @returns ID衝突を解消したノード配列
 */
export function resolveIdConflicts(
  nodes: AstNode[],
  existingIds: Set<string>,
): AstNode[] {
  return nodes.map((node) => resolveNodeConflict(node, existingIds));
}

function resolveNodeConflict(node: AstNode, existingIds: Set<string>): AstNode {
  let id = node.id;
  if (existingIds.has(id)) {
    let suffix = 1;
    while (existingIds.has(`${id}-${suffix}`)) {
      suffix++;
    }
    id = `${id}-${suffix}`;
  }
  existingIds.add(id);
  const updated = { ...node, id };
  return processChildrenWithConflictCheck(updated, existingIds);
}

function processChildrenWithConflictCheck(
  node: AstNode,
  existingIds: Set<string>,
): AstNode {
  switch (node.type) {
    case "Screen":
      return {
        ...node,
        children: resolveIdConflicts(node.children, existingIds),
      };
    case "Card":
      return {
        ...node,
        children: resolveIdConflicts(node.children, existingIds),
      };
    default:
      return node;
  }
}
