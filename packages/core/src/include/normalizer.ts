/**
 * include正規化モジュール
 * 糖衣形のincludeを正規形に変換する純粋文字列変換関数
 * VS Code の onWillSaveTextDocument から直接呼び出すことを前提とする
 *
 * 出力キー順序: path → as → dir → class（差分ノイズを最小化）
 */

/** 糖衣形includeを検出するパターン */
// 糖衣形: バッククォート3個 + include + 水平スペース + 属性 + バッククォート3個（同一行）
// \s+ ではなく [ \t]+ で改行を除外し、正規形フェンスとの誤一致を防ぐ
const SUGAR_INCLUDE_PATTERN = /^(`{3}include[ \t]+)([^`\n]+?)(`{3})\s*$/gm;

/** 糖衣属性パターン */
const SUGAR_ATTR_PATTERN = /(\w+)="([^"]*)"/g;

/**
 * Markdownテキスト内の全糖衣includeを正規形に変換する
 * @param source - 変換前テキスト
 * @returns 変換後テキスト（変換がなければ入力と同一文字列）
 */
export function normalizeSugarIncludes(source: string): string {
  return source.replace(
    SUGAR_INCLUDE_PATTERN,
    (_match, _open, attrs) => {
      return sugarToCanonical(attrs.trim());
    },
  );
}

/**
 * 糖衣形の属性文字列を正規形フェンスブロックに変換する
 * @param sugarAttrs - 糖衣形属性文字列（例: 'path="./foo.md" as="inline"'）
 * @returns 正規形フェンスブロック文字列
 */
export function sugarToCanonical(sugarAttrs: string): string {
  const attrs: Record<string, string> = {};

  SUGAR_ATTR_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = SUGAR_ATTR_PATTERN.exec(sugarAttrs)) !== null) {
    const key = match[1] ?? "";
    const value = match[2] ?? "";
    if (key) attrs[key] = value;
  }

  if (!attrs["path"]) return `\`\`\`include ${sugarAttrs}\`\`\``;

  const lines: string[] = [];

  // 固定順序: path → as → dir → class
  lines.push(`path: ${attrs["path"]}`);
  lines.push(`as: ${attrs["as"] ?? "block"}`);
  lines.push(`dir: ${attrs["dir"] ?? "auto"}`);

  if (attrs["class"]) {
    lines.push(`class: ${attrs["class"]}`);
  }

  return "```include\n" + lines.join("\n") + "\n```";
}
