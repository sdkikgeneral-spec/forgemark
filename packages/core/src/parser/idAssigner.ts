/**
 * ID採番・衝突解消
 * - position が利用可能な場合: `{nodeType}-L{line}` 形式の安定 ID を付与する
 * - position が未設定の場合: `{nodeType}-{index}` 形式のフォールバック ID を付与する
 *
 * 安定 ID により、ファイル先頭へのノード挿入で後続 ID が変動する問題を解消する。
 * include 展開後の重複 ID には `-{suffix}` を付与して解消する。
 */

import type { AstNode } from "../ast/types.js";

/**
 * ASTノード配列にIDを付与する（再帰的に処理）
 * @param nodes - ID未付与のASTノード配列
 * @param counter - 型ごとのカウンター（positionなしノードのフォールバック用）
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
  let id: string;

  if (node.position) {
    // 位置情報ベースの安定ID（先頭挿入で後続IDが変わらない）
    id = `${typeLower}-L${node.position.start.line}`;
  } else {
    // フォールバック: 出現順インデックス
    const count = counter.get(typeLower) ?? 0;
    counter.set(typeLower, count + 1);
    id = `${typeLower}-${count}`;
  }

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

/**
 * 全コンテナ型の子ノードを再帰的に衝突チェックする
 * processChildren と同じ網羅範囲を維持する
 */
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
    case "Row":
      return {
        ...node,
        columns: node.columns.map((col) => resolveIdConflicts(col, existingIds)),
      };
    case "Include":
      return {
        ...node,
        fallback: node.fallback
          ? resolveIdConflicts(node.fallback, existingIds)
          : undefined,
      };
    case "MenuBar":
      return {
        ...node,
        menus: node.menus.map(
          (m) => resolveNodeConflict(m, existingIds) as typeof m,
        ),
      };
    case "Menu":
      return {
        ...node,
        items: node.items.map(
          (item) => resolveNodeConflict(item, existingIds) as typeof item,
        ),
      };
    case "Breadcrumb":
      return {
        ...node,
        items: node.items.map(
          (item) => resolveNodeConflict(item, existingIds) as typeof item,
        ),
      };
    case "Tree":
      return {
        ...node,
        items: node.items.map(
          (item) => resolveNodeConflict(item, existingIds) as typeof item,
        ),
      };
    case "TreeItem":
      return {
        ...node,
        children: node.children.map(
          (child) => resolveNodeConflict(child, existingIds) as typeof child,
        ),
      };
    case "Panes":
      return {
        ...node,
        panes: node.panes.map(
          (pane) => resolveNodeConflict(pane, existingIds) as typeof pane,
        ),
      };
    case "Pane":
      return {
        ...node,
        children: resolveIdConflicts(node.children, existingIds),
      };
    case "RadioGroup":
      return {
        ...node,
        items: node.items.map(
          (item) => resolveNodeConflict(item, existingIds) as typeof item,
        ),
      };
    case "Tabs":
      return {
        ...node,
        tabs: node.tabs.map(
          (tab) => resolveNodeConflict(tab, existingIds) as typeof tab,
        ),
      };
    case "Tab":
      return {
        ...node,
        children: resolveIdConflicts(node.children, existingIds),
      };
    case "Accordion":
      return {
        ...node,
        items: node.items.map(
          (item) => resolveNodeConflict(item, existingIds) as typeof item,
        ),
      };
    case "AccordionItem":
      return {
        ...node,
        children: resolveIdConflicts(node.children, existingIds),
      };
    case "Dropdown":
      return {
        ...node,
        items: node.items.map(
          (item) => resolveNodeConflict(item, existingIds) as typeof item,
        ),
      };
    case "Listbox":
      return {
        ...node,
        items: node.items.map(
          (item) => resolveNodeConflict(item, existingIds) as typeof item,
        ),
      };
    case "Toolbar":
      return {
        ...node,
        groups: node.groups.map((group) =>
          group.map(
            (item) => resolveNodeConflict(item, existingIds) as typeof item,
          ),
        ),
      };
    case "StatusBar":
      return {
        ...node,
        items: node.items.map(
          (item) => resolveNodeConflict(item, existingIds) as typeof item,
        ),
      };
    case "Alert":
      return {
        ...node,
        children: resolveIdConflicts(node.children, existingIds),
      };
    case "Grid":
      return {
        ...node,
        cells: node.cells.map(
          (cell) => resolveNodeConflict(cell, existingIds) as typeof cell,
        ),
      };
    case "GridCell":
      return {
        ...node,
        children: resolveIdConflicts(node.children, existingIds),
      };
    default:
      return node;
  }
}
