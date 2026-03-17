/**
 * エスケープ処理
 * ForgeMarkの特殊文字 \[ \] \{ \} \| \\ を処理する
 */

/** エスケープ済みプレースホルダ（内部処理用） */
const ESCAPE_MAP: Record<string, string> = {
  "\\[": "\x00LBRACKET\x00",
  "\\]": "\x00RBRACKET\x00",
  "\\{": "\x00LBRACE\x00",
  "\\}": "\x00RBRACE\x00",
  "\\|": "\x00PIPE\x00",
  "\\\\": "\x00BACKSLASH\x00",
};

const UNESCAPE_MAP: Record<string, string> = {
  "\x00LBRACKET\x00": "[",
  "\x00RBRACKET\x00": "]",
  "\x00LBRACE\x00": "{",
  "\x00RBRACE\x00": "}",
  "\x00PIPE\x00": "|",
  "\x00BACKSLASH\x00": "\\",
};

/**
 * テキスト内のエスケープシーケンスをプレースホルダーに置換する
 * パース前に呼び出し、パース後に restoreEscapes() で元に戻す
 */
export function replaceEscapes(text: string): string {
  let result = text;
  for (const [esc, placeholder] of Object.entries(ESCAPE_MAP)) {
    result = result.split(esc).join(placeholder);
  }
  return result;
}

/**
 * プレースホルダーを元の文字に戻す
 */
export function restoreEscapes(text: string): string {
  let result = text;
  for (const [placeholder, original] of Object.entries(UNESCAPE_MAP)) {
    result = result.split(placeholder).join(original);
  }
  return result;
}
