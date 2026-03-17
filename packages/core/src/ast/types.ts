/**
 * UI ASTノード型定義
 * ForgeMark Markdown構文から生成される全ノード型を定義する
 */

// ─── 共通型 ────────────────────────────────────────────────────────────────

/** テキスト方向 */
export type Dir = "auto" | "ltr" | "rtl";

/** ソース位置情報 */
export interface Position {
  start: { line: number; column: number; offset: number };
  end: { line: number; column: number; offset: number };
}

/** 全ノード共通プロパティ */
export interface BaseNode {
  /** 採番済みID（例: "button-0"） */
  id: string;
  /** Tailwindクラス配列 */
  class: string[];
  /** テキスト方向（既定: "auto"） */
  dir: Dir;
  /** ソース位置情報（差分レンダリング用） */
  position?: Position;
}

// ─── コア要素（9種） ───────────────────────────────────────────────────────

/** H1 → 画面ルートノード */
export interface ScreenNode extends BaseNode {
  type: "Screen";
  /** ルートパス（例: "/login"） */
  route: string;
  children: AstNode[];
}

/** H2（クラス昇格なし）→ カードコンテナ */
export interface CardNode extends BaseNode {
  type: "Card";
  label: string;
  children: AstNode[];
}

/** [[ A | B | C ]] → 列レイアウト */
export interface RowNode extends BaseNode {
  type: "Row";
  /** 列ごとのノード配列 */
  columns: AstNode[][];
}

/** [___]{...} → フォーム入力 */
export interface InputNode extends BaseNode {
  type: "Input";
  inputType: "text" | "email" | "password" | "number" | "url" | "tel" | "search" | "date" | "time" | "datetime-local" | "month" | "week" | "color" | "file" | "hidden";
  required: boolean;
  placeholder?: string;
  value?: string;
  disabled: boolean;
  name?: string;
  readonly: boolean;
}

/** [label]{...} → ボタン */
export interface ButtonNode extends BaseNode {
  type: "Button";
  label: string;
  disabled: boolean;
  /** イベントハンドラ（例: { "on:click": "auth.login()" }） */
  events: Record<string, string>;
}

/** 段落テキスト */
export interface TextNode extends BaseNode {
  type: "Text";
  content: string;
}

/** ```include ... ``` → ファイル埋め込み */
export interface IncludeNode extends BaseNode {
  type: "Include";
  /** ワークスペース相対パス（正規化済み） */
  path: string;
  /** 埋め込み種別（既定: "block"） */
  as: "block" | "inline";
  /** フォールバックコンテンツ（pathが存在しない場合に表示） */
  fallback?: AstNode[];
  /** パス解決済みフラグ（グラフ構築後に設定） */
  resolved: boolean;
}

/** 水平区切り線（--- が MenuBar/Toolbar 外に現れた場合） */
export interface DividerNode extends BaseNode {
  type: "Divider";
}

/** パース失敗箇所 */
export interface UnknownNode extends BaseNode {
  type: "Unknown";
  /** 元のMarkdownテキスト */
  raw: string;
}

// ─── メニュー/ナビゲーション（6種） ──────────────────────────────────────

/** ## {.menubar} → メニューバー */
export interface MenuBarNode extends BaseNode {
  type: "MenuBar";
  menus: MenuNode[];
}

/** ### &Label → メニュー */
export interface MenuNode extends BaseNode {
  type: "Menu";
  label: string;
  /** キーボードアクセラレーター（例: "&File"の"F"） */
  accelerator?: string;
  items: Array<MenuItemNode | MenuSeparatorNode>;
}

/** - [label]{...} in Menu → メニュー項目 */
export interface MenuItemNode extends BaseNode {
  type: "MenuItem";
  label: string;
  shortcut?: string;
  disabled: boolean;
  events: Record<string, string>;
}

/** --- in Menu → メニュー区切り */
export interface MenuSeparatorNode extends BaseNode {
  type: "MenuSeparator";
}

/** ## {.breadcrumb} → パンくずナビ */
export interface BreadcrumbNode extends BaseNode {
  type: "Breadcrumb";
  items: BreadcrumbItemNode[];
}

/** - [label]{...} in Breadcrumb → パンくずアイテム */
export interface BreadcrumbItemNode extends BaseNode {
  type: "BreadcrumbItem";
  label: string;
  events?: Record<string, string>;
}

// ─── ツリー/ペイン（4種） ─────────────────────────────────────────────────

/** ## {.tree} → ツリービュー */
export interface TreeNode extends BaseNode {
  type: "Tree";
  items: TreeItemNode[];
}

/** - label{...} in Tree → ツリーアイテム */
export interface TreeItemNode extends BaseNode {
  type: "TreeItem";
  label: string;
  icon?: string;
  selected: boolean;
  collapsed: boolean;
  disabled: boolean;
  events: Record<string, string>;
  children: TreeItemNode[];
}

/** ## {.panes} → ペインレイアウト */
export interface PanesNode extends BaseNode {
  type: "Panes";
  /** 分割方向（既定: "horizontal"） */
  direction: "horizontal" | "vertical";
  panes: PaneNode[];
}

/** ### label {.pane} → 個別ペイン */
export interface PaneNode extends BaseNode {
  type: "Pane";
  label: string;
  /** 固定幅（px） */
  w?: number;
  /** 固定高（px） */
  h?: number;
  /** フレックス伸縮比 */
  flex?: number;
  collapsed: boolean;
  children: AstNode[];
}

// ─── フォーム・選択（8種） ────────────────────────────────────────────────

/** [x] label → チェックボックス */
export interface CheckboxNode extends BaseNode {
  type: "Checkbox";
  label: string;
  checked: boolean;
  name?: string;
  required: boolean;
  disabled: boolean;
}

/** ## {.radio-group} → ラジオグループ */
export interface RadioGroupNode extends BaseNode {
  type: "RadioGroup";
  name?: string;
  items: RadioItemNode[];
}

/** - (•) label → ラジオボタン */
export interface RadioItemNode extends BaseNode {
  type: "RadioItem";
  label: string;
  value?: string;
  selected: boolean;
  disabled: boolean;
}

/** [___]{type:textarea} → テキストエリア */
export interface TextareaNode extends BaseNode {
  type: "Textarea";
  rows: number;
  placeholder?: string;
  value?: string;
  required: boolean;
  disabled: boolean;
  readonly: boolean;
  name?: string;
}

/** [___]{type:range ...} → スライダー */
export interface RangeNode extends BaseNode {
  type: "Range";
  min: number;
  max: number;
  value?: number;
  step?: number;
  disabled: boolean;
  name?: string;
}

/** [___]{type:combobox} → コンボボックス */
export interface ComboboxNode extends BaseNode {
  type: "Combobox";
  placeholder?: string;
  disabled: boolean;
  name?: string;
  options: ComboboxOptionNode[];
}

/** Combobox の選択肢 */
export interface ComboboxOptionNode {
  value: string;
  label: string;
  selected: boolean;
}

/** [___]{type:select} → セレクトボックス */
export interface SelectNode extends BaseNode {
  type: "Select";
  placeholder?: string;
  disabled: boolean;
  name?: string;
  options: SelectOptionNode[];
}

/** Select の選択肢 */
export interface SelectOptionNode {
  value: string;
  label: string;
  selected: boolean;
}

/** [___]{type:toggle} → トグルスイッチ */
export interface ToggleNode extends BaseNode {
  type: "Toggle";
  checked: boolean;
  disabled: boolean;
  name?: string;
}

// ─── UIコンポーネント（15種） ─────────────────────────────────────────────

/** ## {.tabs} → タブパネル */
export interface TabsNode extends BaseNode {
  type: "Tabs";
  tabs: TabNode[];
}

/** ### label {.tab} → タブ */
export interface TabNode extends BaseNode {
  type: "Tab";
  label: string;
  selected: boolean;
  disabled: boolean;
  children: AstNode[];
}

/** ## {.accordion} → アコーディオン */
export interface AccordionNode extends BaseNode {
  type: "Accordion";
  items: AccordionItemNode[];
}

/** ### label {.accordion-item} → アコーディオン項目 */
export interface AccordionItemNode extends BaseNode {
  type: "AccordionItem";
  label: string;
  collapsed: boolean;
  disabled: boolean;
  children: AstNode[];
}

/** ## {.dropdown} → ドロップダウンメニュー */
export interface DropdownNode extends BaseNode {
  type: "Dropdown";
  label: string;
  items: Array<DropdownItemNode | MenuSeparatorNode>;
}

/** - [label]{...} in Dropdown → ドロップダウン項目 */
export interface DropdownItemNode extends BaseNode {
  type: "DropdownItem";
  label: string;
  icon?: string;
  shortcut?: string;
  disabled: boolean;
  events: Record<string, string>;
}

/** ## {.listbox} → リストボックス */
export interface ListboxNode extends BaseNode {
  type: "Listbox";
  multiple: boolean;
  items: ListboxItemNode[];
}

/** - label{...} in Listbox → リストボックス項目 */
export interface ListboxItemNode extends BaseNode {
  type: "ListboxItem";
  label: string;
  selected: boolean;
  disabled: boolean;
  icon?: string;
  events?: Record<string, string>;
}

/** ## {.toolbar} → ツールバー */
export interface ToolbarNode extends BaseNode {
  type: "Toolbar";
  /** グループ単位のアイテム配列 */
  groups: Array<Array<ToolbarItemNode | ToolbarSeparatorNode>>;
}

/** - [label]{...} in Toolbar → ツールバーアイテム */
export interface ToolbarItemNode extends BaseNode {
  type: "ToolbarItem";
  label: string;
  icon?: string;
  shortcut?: string;
  checked: boolean;
  disabled: boolean;
  events: Record<string, string>;
}

/** --- in Toolbar → ツールバー区切り */
export interface ToolbarSeparatorNode extends BaseNode {
  type: "ToolbarSeparator";
}

/** ## {.statusbar} → ステータスバー */
export interface StatusBarNode extends BaseNode {
  type: "StatusBar";
  items: StatusItemNode[];
}

/** - text{...} in StatusBar → ステータス項目 */
export interface StatusItemNode extends BaseNode {
  type: "StatusItem";
  content: string;
  align: "left" | "right";
  disabled: boolean;
  events?: Record<string, string>;
}

// ─── メディア・表示（6種） ────────────────────────────────────────────────

/** [___]{type:progress} → プログレスバー */
export interface ProgressNode extends BaseNode {
  type: "Progress";
  value?: number;
  max: number;
}

/** [~]{.spinner} → スピナー */
export interface SpinnerNode extends BaseNode {
  type: "Spinner";
  size?: string;
}

/** ## label {.alert .variant} → アラート */
export interface AlertNode extends BaseNode {
  type: "Alert";
  variant: "info" | "success" | "warning" | "error";
  label: string;
  children: AstNode[];
}

/** ![alt](src){...} → 画像 */
export interface ImageNode extends BaseNode {
  type: "Image";
  src: string;
  alt: string;
  w?: number;
  h?: number;
}

/** ![alt](src){.avatar} → アバター画像 */
export interface AvatarNode extends BaseNode {
  type: "Avatar";
  src: string;
  alt: string;
  size?: number;
}

/** [label]{.badge} → バッジ */
export interface BadgeNode extends BaseNode {
  type: "Badge";
  label: string;
}

// ─── レイアウト・テーブル（3種） ──────────────────────────────────────────

/** ## label {.grid} → グリッドレイアウト */
export interface GridNode extends BaseNode {
  type: "Grid";
  cols: number;
  gap?: number;
  cells: GridCellNode[];
}

/** ### label {.cell} → グリッドセル */
export interface GridCellNode extends BaseNode {
  type: "GridCell";
  label?: string;
  span?: number;
  rowSpan?: number;
  children: AstNode[];
}

/** ## label {.table} → テーブル */
export interface TableNode extends BaseNode {
  type: "Table";
  striped: boolean;
  bordered: boolean;
  hoverable: boolean;
  compact: boolean;
  columns: string[];
  rows: string[][];
}

// ─── ユニオン型 ────────────────────────────────────────────────────────────

/** 全ASTノード型のユニオン */
export type AstNode =
  | ScreenNode
  | CardNode
  | RowNode
  | InputNode
  | ButtonNode
  | TextNode
  | IncludeNode
  | DividerNode
  | UnknownNode
  | MenuBarNode
  | MenuNode
  | MenuItemNode
  | MenuSeparatorNode
  | BreadcrumbNode
  | BreadcrumbItemNode
  | TreeNode
  | TreeItemNode
  | PanesNode
  | PaneNode
  | CheckboxNode
  | RadioGroupNode
  | RadioItemNode
  | TextareaNode
  | RangeNode
  | ComboboxNode
  | SelectNode
  | ToggleNode
  | TabsNode
  | TabNode
  | AccordionNode
  | AccordionItemNode
  | DropdownNode
  | DropdownItemNode
  | ListboxNode
  | ListboxItemNode
  | ToolbarNode
  | ToolbarItemNode
  | ToolbarSeparatorNode
  | StatusBarNode
  | StatusItemNode
  | ProgressNode
  | SpinnerNode
  | AlertNode
  | ImageNode
  | AvatarNode
  | BadgeNode
  | GridNode
  | GridCellNode
  | TableNode;

/** ASTノード種別の文字列リテラル型 */
export type AstNodeType = AstNode["type"];
