/**
 * 見出しノードマッパー
 * H1 → Screen、H2 → Card/MenuBar/Tree/... の変換を行う
 * H2のクラス昇格はデータ駆動テーブルで管理する
 */

import { parseAttrBlock } from "./attrParser.js";
import type {
  AstNodeType,
  Dir,
  ScreenNode,
  CardNode,
  MenuBarNode,
  TreeNode,
  PanesNode,
  RadioGroupNode,
  TabsNode,
  AccordionNode,
  BreadcrumbNode,
  DropdownNode,
  ListboxNode,
  ToolbarNode,
  StatusBarNode,
  AlertNode,
  GridNode,
  TableNode,
} from "../ast/types.js";

/** H2クラス→ノード型のマッピングテーブル */
const H2_UPGRADES: Record<string, AstNodeType> = {
  menubar: "MenuBar",
  tree: "Tree",
  panes: "Panes",
  "radio-group": "RadioGroup",
  tabs: "Tabs",
  accordion: "Accordion",
  breadcrumb: "Breadcrumb",
  dropdown: "Dropdown",
  listbox: "Listbox",
  toolbar: "Toolbar",
  statusbar: "StatusBar",
  alert: "Alert",
  grid: "Grid",
  table: "Table",
};

/** H3クラス→ノード型のマッピングテーブル（親ノードの種別も必要） */
const H3_UPGRADES: Partial<Record<AstNodeType, AstNodeType>> = {
  MenuBar: "Menu",
  Panes: "Pane",
  Tabs: "Tab",
  Accordion: "AccordionItem",
  Grid: "GridCell",
};

/** Alert バリアント一覧 */
const ALERT_VARIANTS = new Set(["info", "success", "warning", "error"]);

/**
 * 見出し文字列から本文ラベルと属性ブロックを分離する
 * 例: "ログイン {.card .w-400}" → { label: "ログイン", attrRaw: "{.card .w-400}" }
 */
export function splitHeadingLabel(heading: string): {
  label: string;
  attrRaw: string;
} {
  const attrMatch = heading.match(/\{[^}]*(?:\{[^}]*\}[^}]*)?\}\s*$/);
  if (attrMatch) {
    const attrRaw = attrMatch[0];
    const label = heading.slice(0, heading.lastIndexOf(attrRaw)).trim();
    return { label, attrRaw };
  }
  return { label: heading.trim(), attrRaw: "" };
}

/**
 * H1見出しをScreenノードに変換する
 * @param heading - 見出しテキスト（# を除いた部分）
 * @returns ScreenNodeのベース（children未設定）
 */
export function mapH1ToScreen(
  heading: string,
): Omit<ScreenNode, "children"> {
  const { label, attrRaw } = splitHeadingLabel(heading);
  const attrs = parseAttrBlock(attrRaw);
  const dir = extractDir(attrs.attrs);

  return {
    id: "",
    type: "Screen",
    // ルートパスはラベルから取得（例: "/login"）
    route: label.startsWith("/") ? label : `/${label}`,
    class: attrs.classes,
    dir,
  };
}

/**
 * H2見出しをCardまたは昇格ノードに変換する
 * @param heading - 見出しテキスト（## を除いた部分）
 * @returns CardNodeまたは昇格ノードのベース
 */
export function mapH2ToNode(heading: string): {
  type: AstNodeType;
  label: string;
  classes: string[];
  attrs: Record<string, string | true>;
  events: Record<string, string>;
  dir: Dir;
} {
  const { label, attrRaw } = splitHeadingLabel(heading);
  const parsed = parseAttrBlock(attrRaw);
  const dir = extractDir(parsed.attrs);

  // クラス昇格チェック
  for (const cls of parsed.classes) {
    const upgraded = H2_UPGRADES[cls];
    if (upgraded) {
      return {
        type: upgraded,
        label,
        classes: parsed.classes,
        attrs: parsed.attrs,
        events: parsed.events,
        dir,
      };
    }
  }

  return {
    type: "Card",
    label,
    classes: parsed.classes,
    attrs: parsed.attrs,
    events: parsed.events,
    dir,
  };
}

/**
 * H3見出しを親コンテキストに基づいて変換する
 * @param heading - 見出しテキスト
 * @param parentType - 親ノードの種別
 */
export function mapH3ToNode(
  heading: string,
  parentType: AstNodeType,
): {
  type: AstNodeType | null;
  label: string;
  classes: string[];
  attrs: Record<string, string | true>;
  dir: Dir;
} {
  const { label, attrRaw } = splitHeadingLabel(heading);
  const parsed = parseAttrBlock(attrRaw);
  const dir = extractDir(parsed.attrs);

  // H3は親ノードのコンテキストが必要
  const upgraded = H3_UPGRADES[parentType];
  if (upgraded) {
    return {
      type: upgraded,
      label,
      classes: parsed.classes,
      attrs: parsed.attrs,
      dir,
    };
  }

  // 未知の親コンテキスト → null（lintで警告）
  return {
    type: null,
    label,
    classes: parsed.classes,
    attrs: parsed.attrs,
    dir,
  };
}

/**
 * アラートバリアントをクラスから抽出する
 */
export function extractAlertVariant(
  classes: string[],
): AlertNode["variant"] {
  for (const cls of classes) {
    if (ALERT_VARIANTS.has(cls)) {
      return cls as AlertNode["variant"];
    }
  }
  return "info";
}

/**
 * Gridノードのcolsをattrまたはクラスから抽出する
 */
export function extractGridCols(
  attrs: Record<string, string | true>,
  classes: string[],
): number {
  const colsAttr = attrs["cols"];
  if (typeof colsAttr === "string") {
    const n = parseInt(colsAttr, 10);
    if (!isNaN(n)) return n;
  }
  // grid-cols-{n} クラスからも抽出
  for (const cls of classes) {
    const match = cls.match(/^grid-cols-(\d+)$/);
    if (match?.[1]) {
      const n = parseInt(match[1], 10);
      if (!isNaN(n)) return n;
    }
  }
  return 1;
}

/**
 * 属性マップからDir値を抽出する
 */
function extractDir(attrs: Record<string, string | true>): Dir {
  const dir = attrs["dir"];
  if (dir === "ltr" || dir === "rtl" || dir === "auto") return dir;
  return "auto";
}

export type {
  ScreenNode,
  CardNode,
  MenuBarNode,
  TreeNode,
  PanesNode,
  RadioGroupNode,
  TabsNode,
  AccordionNode,
  BreadcrumbNode,
  DropdownNode,
  ListboxNode,
  ToolbarNode,
  StatusBarNode,
  AlertNode,
  GridNode,
  TableNode,
};
