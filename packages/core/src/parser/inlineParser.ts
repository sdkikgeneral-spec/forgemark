/**
 * インライン記法パーサー
 * [label]{...} Button/Badge、[___]{...} Input/Toggle/Select 等を解析する
 */

import { parseAttrBlock } from "./attrParser.js";
import { restoreEscapes } from "./escapeHandler.js";
import type {
  AstNode,
  ButtonNode,
  InputNode,
  BadgeNode,
  SpinnerNode,
  CheckboxNode,
  ProgressNode,
  ToggleNode,
  SelectNode,
  TextareaNode,
  RangeNode,
  ComboboxNode,
} from "../ast/types.js";

/** インライン解析結果 */
export interface InlineParseResult {
  node: AstNode | null;
  /** 未解析の残余テキスト（Textノード用） */
  remainder: string;
}

/** 入力フィールドのアンダースコアパターン */
const INPUT_PATTERN = /^\[_{3,}\]/;
/** ボタン/バッジのラベルパターン */
const LABEL_PATTERN = /^\[([^\]]*)\]/;
/** チェックボックスパターン: [x] または [ ] */
const CHECKBOX_PATTERN = /^\[([xX ])\]\s+(.*)/;
/** スピナーパターン: [~] */
const SPINNER_PATTERN = /^\[~\]/;
/** 属性ブロックパターン */
const ATTR_BLOCK_PATTERN = /^\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/;

/**
 * テキスト行からインライン記法を解析する
 * @param text - エスケープ処理済みのテキスト行
 * @param position - ソース位置情報（オプション）
 * @returns ASTノード配列（1行に複数のインライン要素が含まれる場合あり）
 */
export function parseInlineElements(text: string): AstNode[] {
  const results: AstNode[] = [];
  let remaining = text.trim();

  while (remaining.length > 0) {
    // チェックボックス: [x] label または [ ] label
    const checkboxMatch = remaining.match(CHECKBOX_PATTERN);
    if (checkboxMatch) {
      const checked = checkboxMatch[1]?.toLowerCase() === "x";
      const label = restoreEscapes(checkboxMatch[2] ?? "");
      results.push({
        id: "",
        type: "Checkbox",
        class: [],
        dir: "auto",
        label,
        checked: checked ?? false,
        required: false,
        disabled: false,
      } satisfies CheckboxNode);
      break;
    }

    // スピナー: [~]{.spinner}
    if (SPINNER_PATTERN.test(remaining)) {
      const spinnerMatch = remaining.match(SPINNER_PATTERN);
      if (spinnerMatch) {
        let attrs = { classes: [] as string[], attrs: {} as Record<string, string | true>, events: {} as Record<string, string> };
        const rest = remaining.slice(spinnerMatch[0].length);
        const attrMatch = rest.match(ATTR_BLOCK_PATTERN);
        if (attrMatch) {
          attrs = parseAttrBlock(attrMatch[0]);
          remaining = rest.slice(attrMatch[0].length).trim();
        } else {
          remaining = rest.trim();
        }
        results.push({
          id: "",
          type: "Spinner",
          class: attrs.classes,
          dir: "auto",
          size: attrs.attrs["size"] !== true ? (attrs.attrs["size"] as string | undefined) : undefined,
        } satisfies SpinnerNode);
        continue;
      }
    }

    // 入力フィールド: [___]{...}
    if (INPUT_PATTERN.test(remaining)) {
      const inputMatch = remaining.match(INPUT_PATTERN);
      if (inputMatch) {
        const rest = remaining.slice(inputMatch[0].length);
        const attrMatch = rest.match(ATTR_BLOCK_PATTERN);
        const attrRaw = attrMatch ? attrMatch[0] : "";
        const attrs = parseAttrBlock(attrRaw);
        remaining = attrMatch ? rest.slice(attrMatch[0].length).trim() : rest.trim();

        const inputType = attrs.attrs["type"];
        const typeStr = inputType === true ? "text" : (inputType ?? "text");

        const node = buildInputTypeNode(typeStr, attrs);
        if (node) {
          results.push(node);
          continue;
        }
      }
    }

    // ラベル付き要素: [label]{...}
    const labelMatch = remaining.match(LABEL_PATTERN);
    if (labelMatch) {
      const rawLabel = labelMatch[1] ?? "";
      const rest = remaining.slice(labelMatch[0].length);
      const attrMatch = rest.match(ATTR_BLOCK_PATTERN);
      const attrRaw = attrMatch ? attrMatch[0] : "";
      const attrs = parseAttrBlock(attrRaw);
      remaining = attrMatch ? rest.slice(attrMatch[0].length).trim() : rest.trim();

      const label = restoreEscapes(rawLabel);

      // バッジ: {.badge}
      if (attrs.classes.includes("badge")) {
        results.push({
          id: "",
          type: "Badge",
          class: attrs.classes,
          dir: "auto",
          label,
        } satisfies BadgeNode);
        continue;
      }

      // ボタン
      results.push({
        id: "",
        type: "Button",
        class: attrs.classes,
        dir: extractDir(attrs),
        label,
        disabled: attrs.attrs["disabled"] === true,
        events: attrs.events,
      } satisfies ButtonNode);
      continue;
    }

    // 解析できない場合は残余テキストとして終了
    break;
  }

  return results;
}

/**
 * type属性に基づいてInputノードまたは派生ノードを生成する
 */
function buildInputTypeNode(
  typeStr: string,
  attrs: ReturnType<typeof parseAttrBlock>,
): AstNode | null {
  const dir = extractDir(attrs);
  const disabled = attrs.attrs["disabled"] === true;
  const required = attrs.attrs["required"] === true;
  const name = attrs.attrs["name"] !== true ? (attrs.attrs["name"] as string | undefined) : undefined;
  const placeholder = attrs.attrs["placeholder"] !== true ? (attrs.attrs["placeholder"] as string | undefined) : undefined;
  const value = attrs.attrs["value"] !== true ? (attrs.attrs["value"] as string | undefined) : undefined;

  switch (typeStr) {
    case "toggle":
      return {
        id: "",
        type: "Toggle",
        class: attrs.classes,
        dir,
        checked: attrs.attrs["checked"] === true,
        disabled,
        name,
      } satisfies ToggleNode;

    case "progress": {
      const maxVal = attrs.attrs["max"];
      return {
        id: "",
        type: "Progress",
        class: attrs.classes,
        dir,
        value: parseOptionalNumber(attrs.attrs["value"]),
        max: parseOptionalNumber(maxVal) ?? 100,
      } satisfies ProgressNode;
    }

    case "range": {
      const minVal = parseOptionalNumber(attrs.attrs["min"]) ?? 0;
      const maxVal = parseOptionalNumber(attrs.attrs["max"]) ?? 100;
      return {
        id: "",
        type: "Range",
        class: attrs.classes,
        dir,
        min: minVal,
        max: maxVal,
        value: parseOptionalNumber(attrs.attrs["value"]),
        step: parseOptionalNumber(attrs.attrs["step"]),
        disabled,
        name,
      } satisfies RangeNode;
    }

    case "textarea": {
      const rows = parseOptionalNumber(attrs.attrs["rows"]) ?? 3;
      return {
        id: "",
        type: "Textarea",
        class: attrs.classes,
        dir,
        rows,
        placeholder,
        value,
        required,
        disabled,
        readonly: attrs.attrs["readonly"] === true,
        name,
      } satisfies TextareaNode;
    }

    case "combobox":
      return {
        id: "",
        type: "Combobox",
        class: attrs.classes,
        dir,
        placeholder,
        disabled,
        name,
        options: [],
      } satisfies ComboboxNode;

    case "select":
      return {
        id: "",
        type: "Select",
        class: attrs.classes,
        dir,
        placeholder,
        disabled,
        name,
        options: [],
      } satisfies SelectNode;

    default:
      // 標準Input型（text, email, password 等）
      return {
        id: "",
        type: "Input",
        class: attrs.classes,
        dir,
        inputType: typeStr as InputNode["inputType"],
        required,
        placeholder,
        value,
        disabled,
        name,
        readonly: attrs.attrs["readonly"] === true,
      } satisfies InputNode;
  }
}

/**
 * 属性からDir値を抽出する
 */
function extractDir(attrs: ReturnType<typeof parseAttrBlock>): "auto" | "ltr" | "rtl" {
  const dir = attrs.attrs["dir"];
  if (dir === "ltr" || dir === "rtl" || dir === "auto") return dir;
  return "auto";
}

/**
 * 属性値を数値に変換する（変換できない場合はundefined）
 */
function parseOptionalNumber(
  val: string | true | undefined,
): number | undefined {
  if (val === undefined || val === true) return undefined;
  const n = Number(val);
  return isNaN(n) ? undefined : n;
}
