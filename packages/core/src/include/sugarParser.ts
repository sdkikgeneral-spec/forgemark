/**
 * include糖衣形パーサー
 * ```include path="./foo.md" as="inline" dir="rtl"``` の1行形式を解析する
 */

import type { IncludeNode } from "../ast/types.js";

/** 糖衣形のキーバリュー属性パターン */
const SUGAR_ATTR_PATTERN = /(\w+)="([^"]*)"/g;

/**
 * 糖衣形includeのメタ文字列を解析してIncludeNodeを返す
 * @param meta - コードフェンスのmetaプロパティ（例: 'path="./foo.md" as="inline"'）
 */
export function parseSugarInclude(meta: string): IncludeNode | null {
  const attrs: Record<string, string> = {};

  let match: RegExpExecArray | null;
  SUGAR_ATTR_PATTERN.lastIndex = 0;
  while ((match = SUGAR_ATTR_PATTERN.exec(meta)) !== null) {
    const key = match[1] ?? "";
    const value = match[2] ?? "";
    if (key) attrs[key] = value;
  }

  if (!attrs["path"]) return null;

  const path = attrs["path"];
  const asVal = attrs["as"];
  const dirVal = attrs["dir"];
  const classVal = attrs["class"];

  const as: "block" | "inline" =
    asVal === "inline" ? "inline" : "block";
  const dir: "auto" | "ltr" | "rtl" =
    dirVal === "ltr" ? "ltr" : dirVal === "rtl" ? "rtl" : "auto";

  const classes = classVal
    ? classVal
        .split(/\s+/)
        .filter((c) => c.startsWith("."))
        .map((c) => c.slice(1))
    : [];

  return {
    id: "",
    type: "Include",
    class: classes,
    dir,
    path,
    as,
    resolved: false,
  };
}
