/**
 * リストノードマッパー
 * 親ノードのコンテキストに基づいてMarkdownリストを
 * MenuItem/TreeItem/RadioItem/BreadcrumbItem/DropdownItem/ListboxItem/
 * ToolbarItem/StatusItem/SelectOption/ComboboxOption に変換する
 */

import { parseAttrBlock } from "./attrParser.js";
import { restoreEscapes } from "./escapeHandler.js";
import type {
  AstNodeType,
  AstNode,
  MenuItemNode,
  MenuSeparatorNode,
  TreeItemNode,
  RadioItemNode,
  BreadcrumbItemNode,
  DropdownItemNode,
  ListboxItemNode,
  ToolbarItemNode,
  ToolbarSeparatorNode,
  StatusItemNode,
  SelectOptionNode,
  ComboboxOptionNode,
} from "../ast/types.js";

/** リストアイテムの生テキスト */
export interface RawListItem {
  /** テキスト内容（前後空白除去済み） */
  text: string;
  /** 区切り線フラグ（--- アイテム） */
  isSeparator: boolean;
  /** ネストされた子アイテム */
  children: RawListItem[];
}

/** ラベル付き記法のパターン [label]{...} */
const LABEL_ATTR_PATTERN = /^\[([^\]]*)\](\{[^}]*(?:\{[^}]*\}[^}]*)?\})?/;
/** ラジオアイテム: (•) または ( ) */
const RADIO_PATTERN = /^\(([•·*\s])\)\s+(.*)/;
/** アイコン属性 icon:"..." */
const ICON_ATTR_PATTERN = /icon:"([^"]*)"/;

/**
 * リストアイテムを親コンテキストに基づいて変換する
 * @param items - 生リストアイテム配列
 * @param parentType - 親ノードの種別
 */
export function mapListItems(
  items: RawListItem[],
  parentType: AstNodeType,
): AstNode[] {
  switch (parentType) {
    case "Menu":
      return mapToMenuItems(items);
    case "Tree":
    case "TreeItem":
      return mapToTreeItems(items);
    case "RadioGroup":
      return mapToRadioItems(items);
    case "Breadcrumb":
      return mapToBreadcrumbItems(items);
    case "Dropdown":
      return mapToDropdownItems(items);
    case "Listbox":
      return mapToListboxItems(items);
    case "Toolbar":
      return mapToToolbarItems(items);
    case "StatusBar":
      return mapToStatusItems(items);
    default:
      return [];
  }
}

/**
 * MenuItemのリストに変換する
 */
function mapToMenuItems(
  items: RawListItem[],
): Array<MenuItemNode | MenuSeparatorNode> {
  return items.map((item) => {
    if (item.isSeparator) {
      return {
        id: "",
        type: "MenuSeparator",
        class: [],
        dir: "auto",
      } satisfies MenuSeparatorNode;
    }

    const labelMatch = item.text.match(LABEL_ATTR_PATTERN);
    if (labelMatch) {
      const label = restoreEscapes(labelMatch[1] ?? "");
      const attrs = parseAttrBlock(labelMatch[2] ?? "");
      const shortcut = attrs.attrs["shortcut"];
      return {
        id: "",
        type: "MenuItem",
        class: attrs.classes,
        dir: "auto",
        label,
        shortcut: typeof shortcut === "string" ? shortcut : undefined,
        disabled: attrs.attrs["disabled"] === true,
        events: attrs.events,
      } satisfies MenuItemNode;
    }

    return {
      id: "",
      type: "MenuItem",
      class: [],
      dir: "auto",
      label: item.text,
      disabled: false,
      events: {},
    } satisfies MenuItemNode;
  });
}

/**
 * TreeItemのリストに変換する（再帰的にネストを処理）
 */
function mapToTreeItems(items: RawListItem[]): TreeItemNode[] {
  return items.map((item) => {
    if (item.isSeparator) {
      // Treeの中のセパレーターは無視
      return {
        id: "",
        type: "TreeItem",
        class: [],
        dir: "auto",
        label: "",
        selected: false,
        collapsed: false,
        disabled: false,
        events: {},
        children: [],
      } satisfies TreeItemNode;
    }

    // "label {attr}" または "label{attr}" の形式
    const attrMatch = item.text.match(/^(.*?)(\{[^}]*\})?\s*$/);
    const label = restoreEscapes((attrMatch?.[1] ?? item.text).trim());
    const attrRaw = attrMatch?.[2] ?? "";
    const attrs = parseAttrBlock(attrRaw);

    const iconMatch = item.text.match(ICON_ATTR_PATTERN);
    const icon = iconMatch?.[1];

    return {
      id: "",
      type: "TreeItem",
      class: attrs.classes,
      dir: "auto",
      label,
      icon,
      selected: attrs.attrs["selected"] === true,
      collapsed: attrs.attrs["collapsed"] === true,
      disabled: attrs.attrs["disabled"] === true,
      events: attrs.events,
      children: mapToTreeItems(item.children),
    } satisfies TreeItemNode;
  });
}

/**
 * RadioItemのリストに変換する
 */
function mapToRadioItems(items: RawListItem[]): RadioItemNode[] {
  return items
    .filter((item) => !item.isSeparator)
    .map((item) => {
      const radioMatch = item.text.match(RADIO_PATTERN);
      const isSelected = radioMatch?.[1] !== " " && radioMatch?.[1] !== undefined;
      const labelText = radioMatch ? (radioMatch[2] ?? "") : item.text;

      const attrMatch = labelText.match(/^(.*?)(\{[^}]*\})?\s*$/);
      const label = restoreEscapes((attrMatch?.[1] ?? labelText).trim());
      const attrRaw = attrMatch?.[2] ?? "";
      const attrs = parseAttrBlock(attrRaw);
      const value = attrs.attrs["value"];

      return {
        id: "",
        type: "RadioItem",
        class: attrs.classes,
        dir: "auto",
        label,
        value: typeof value === "string" ? value : undefined,
        selected: attrs.attrs["selected"] === true || isSelected,
        disabled: attrs.attrs["disabled"] === true,
      } satisfies RadioItemNode;
    });
}

/**
 * BreadcrumbItemのリストに変換する
 */
function mapToBreadcrumbItems(items: RawListItem[]): BreadcrumbItemNode[] {
  return items
    .filter((item) => !item.isSeparator)
    .map((item) => {
      const labelMatch = item.text.match(LABEL_ATTR_PATTERN);
      if (labelMatch) {
        const label = restoreEscapes(labelMatch[1] ?? "");
        const attrs = parseAttrBlock(labelMatch[2] ?? "");
        return {
          id: "",
          type: "BreadcrumbItem",
          class: attrs.classes,
          dir: "auto",
          label,
          events: Object.keys(attrs.events).length > 0 ? attrs.events : undefined,
        } satisfies BreadcrumbItemNode;
      }
      return {
        id: "",
        type: "BreadcrumbItem",
        class: [],
        dir: "auto",
        label: item.text,
      } satisfies BreadcrumbItemNode;
    });
}

/**
 * DropdownItemのリストに変換する
 */
function mapToDropdownItems(
  items: RawListItem[],
): Array<DropdownItemNode | MenuSeparatorNode> {
  return items.map((item) => {
    if (item.isSeparator) {
      return {
        id: "",
        type: "MenuSeparator",
        class: [],
        dir: "auto",
      } satisfies MenuSeparatorNode;
    }

    const labelMatch = item.text.match(LABEL_ATTR_PATTERN);
    if (labelMatch) {
      const label = restoreEscapes(labelMatch[1] ?? "");
      const attrs = parseAttrBlock(labelMatch[2] ?? "");
      const icon = attrs.attrs["icon"];
      const shortcut = attrs.attrs["shortcut"];
      return {
        id: "",
        type: "DropdownItem",
        class: attrs.classes,
        dir: "auto",
        label,
        icon: typeof icon === "string" ? icon : undefined,
        shortcut: typeof shortcut === "string" ? shortcut : undefined,
        disabled: attrs.attrs["disabled"] === true,
        events: attrs.events,
      } satisfies DropdownItemNode;
    }

    return {
      id: "",
      type: "DropdownItem",
      class: [],
      dir: "auto",
      label: item.text,
      disabled: false,
      events: {},
    } satisfies DropdownItemNode;
  });
}

/**
 * ListboxItemのリストに変換する
 */
function mapToListboxItems(items: RawListItem[]): ListboxItemNode[] {
  return items
    .filter((item) => !item.isSeparator)
    .map((item) => {
      const attrMatch = item.text.match(/^(.*?)(\{[^}]*\})?\s*$/);
      const label = restoreEscapes((attrMatch?.[1] ?? item.text).trim());
      const attrRaw = attrMatch?.[2] ?? "";
      const attrs = parseAttrBlock(attrRaw);
      const icon = attrs.attrs["icon"];

      return {
        id: "",
        type: "ListboxItem",
        class: attrs.classes,
        dir: "auto",
        label,
        selected: attrs.attrs["selected"] === true,
        disabled: attrs.attrs["disabled"] === true,
        icon: typeof icon === "string" ? icon : undefined,
        events: Object.keys(attrs.events).length > 0 ? attrs.events : undefined,
      } satisfies ListboxItemNode;
    });
}

/**
 * ToolbarItemのリストに変換する
 */
function mapToToolbarItems(
  items: RawListItem[],
): Array<ToolbarItemNode | ToolbarSeparatorNode> {
  return items.map((item) => {
    if (item.isSeparator) {
      return {
        id: "",
        type: "ToolbarSeparator",
        class: [],
        dir: "auto",
      } satisfies ToolbarSeparatorNode;
    }

    const labelMatch = item.text.match(LABEL_ATTR_PATTERN);
    if (labelMatch) {
      const label = restoreEscapes(labelMatch[1] ?? "");
      const attrs = parseAttrBlock(labelMatch[2] ?? "");
      const icon = attrs.attrs["icon"];
      const shortcut = attrs.attrs["shortcut"];
      return {
        id: "",
        type: "ToolbarItem",
        class: attrs.classes,
        dir: "auto",
        label,
        icon: typeof icon === "string" ? icon : undefined,
        shortcut: typeof shortcut === "string" ? shortcut : undefined,
        checked: attrs.attrs["checked"] === true,
        disabled: attrs.attrs["disabled"] === true,
        events: attrs.events,
      } satisfies ToolbarItemNode;
    }

    return {
      id: "",
      type: "ToolbarItem",
      class: [],
      dir: "auto",
      label: item.text,
      checked: false,
      disabled: false,
      events: {},
    } satisfies ToolbarItemNode;
  });
}

/**
 * StatusItemのリストに変換する
 */
function mapToStatusItems(items: RawListItem[]): StatusItemNode[] {
  return items
    .filter((item) => !item.isSeparator)
    .map((item) => {
      const attrMatch = item.text.match(/^(.*?)(\{[^}]*\})?\s*$/);
      const content = restoreEscapes((attrMatch?.[1] ?? item.text).trim());
      const attrRaw = attrMatch?.[2] ?? "";
      const attrs = parseAttrBlock(attrRaw);
      const align = attrs.attrs["align"];

      return {
        id: "",
        type: "StatusItem",
        class: attrs.classes,
        dir: "auto",
        content,
        align: align === "right" ? "right" : "left",
        disabled: attrs.attrs["disabled"] === true,
        events: Object.keys(attrs.events).length > 0 ? attrs.events : undefined,
      } satisfies StatusItemNode;
    });
}

/**
 * SelectOptionのリストに変換する
 */
export function mapToSelectOptions(items: RawListItem[]): SelectOptionNode[] {
  return items
    .filter((item) => !item.isSeparator)
    .map((item) => {
      const attrMatch = item.text.match(/^(.*?)(\{[^}]*\})?\s*$/);
      const label = restoreEscapes((attrMatch?.[1] ?? item.text).trim());
      const attrRaw = attrMatch?.[2] ?? "";
      const attrs = parseAttrBlock(attrRaw);
      const value = attrs.attrs["value"];

      return {
        value: typeof value === "string" ? value : label,
        label,
        selected: attrs.attrs["selected"] === true,
      } satisfies SelectOptionNode;
    });
}

/**
 * ComboboxOptionのリストに変換する
 */
export function mapToComboboxOptions(items: RawListItem[]): ComboboxOptionNode[] {
  return items
    .filter((item) => !item.isSeparator)
    .map((item) => {
      const attrMatch = item.text.match(/^(.*?)(\{[^}]*\})?\s*$/);
      const label = restoreEscapes((attrMatch?.[1] ?? item.text).trim());
      const attrRaw = attrMatch?.[2] ?? "";
      const attrs = parseAttrBlock(attrRaw);
      const value = attrs.attrs["value"];

      return {
        value: typeof value === "string" ? value : label,
        label,
        selected: attrs.attrs["selected"] === true,
      } satisfies ComboboxOptionNode;
    });
}
