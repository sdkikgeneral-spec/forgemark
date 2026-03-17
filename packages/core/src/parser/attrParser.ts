/**
 * 属性ブロックパーサー
 * {.class key:value required} 形式の文字列を解析する
 * Tailwindブラケット記法（w-[320px]）や値中のクォートを正しく処理するため
 * 正規表現ではなく状態機械で実装する
 */

/** 解析済み属性 */
export interface ParsedAttrs {
  /** Tailwindクラス配列（.プレフィックスを除いた値） */
  classes: string[];
  /** キーバリュー属性（例: { type: "email", required: true }） */
  attrs: Record<string, string | true>;
  /** イベントハンドラ（例: { "on:click": "dlg.close('ok')" }） */
  events: Record<string, string>;
}

/** パーサー状態 */
type State =
  | "IDLE"         // トークン開始待ち
  | "CLASS"        // .class 読み取り中
  | "KEY"          // キー読み取り中
  | "VALUE"        // 非クォート値読み取り中
  | "QUOTED_VALUE"; // クォート値読み取り中

/**
 * 属性ブロック文字列を解析する
 * @param raw - "{.class key:value}" または ".class key:value"（波括弧は任意）
 * @returns 解析済み属性オブジェクト
 */
export function parseAttrBlock(raw: string): ParsedAttrs {
  const result: ParsedAttrs = { classes: [], attrs: {}, events: {} };

  // 波括弧を除去
  let src = raw.trim();
  if (src.startsWith("{")) src = src.slice(1);
  if (src.endsWith("}")) src = src.slice(0, -1);
  src = src.trim();

  if (!src) return result;

  let state: State = "IDLE";
  let currentKey = "";
  let currentToken = "";
  let quoteChar = "";
  // ブラケット深度（Tailwindの w-[320px] 対応）
  let bracketDepth = 0;

  const flushToken = (): void => {
    if (state === "CLASS" && currentToken) {
      result.classes.push(currentToken);
    } else if (state === "KEY" && currentToken) {
      // 値なしの属性（boolean true）
      if (currentToken.startsWith("on:")) {
        // イベントハンドラで値なしは不正だが警告せずスキップ
      } else {
        result.attrs[currentToken] = true;
      }
    }
    currentKey = "";
    currentToken = "";
    state = "IDLE";
  };

  for (let i = 0; i < src.length; i++) {
    const ch = src[i] ?? "";

    switch (state) {
      case "IDLE":
        if (ch === " " || ch === "\t") break;
        if (ch === ".") {
          state = "CLASS";
          currentToken = "";
        } else if (ch !== "") {
          state = "KEY";
          currentToken = ch;
        }
        break;

      case "CLASS":
        if (ch === " " || ch === "\t" || ch === "}") {
          flushToken();
        } else if (ch === ".") {
          // 連続クラス（.btn.primary）
          result.classes.push(currentToken);
          currentToken = "";
        } else {
          currentToken += ch;
        }
        break;

      case "KEY":
        if (ch === "=") {
          // = はキーバリュー区切り（on:click="value" 形式に対応）
          currentKey = currentToken;
          currentToken = "";
          state = "VALUE";
        } else if (ch === ":") {
          // ルックアヘッド: 後続に [識別子]= が来る場合はキーの一部（on:click= 形式）
          const rest = src.slice(i + 1);
          if (/^[^\s=]*=/.test(rest)) {
            currentToken += ch;
          } else {
            // 通常の key:value 区切り
            currentKey = currentToken;
            currentToken = "";
            state = "VALUE";
          }
        } else if (ch === " " || ch === "\t") {
          // 値なし属性
          flushToken();
        } else {
          currentToken += ch;
        }
        break;

      case "VALUE":
        if (ch === '"' || ch === "'") {
          // クォート値開始
          if (currentToken === "") {
            quoteChar = ch;
            state = "QUOTED_VALUE";
          } else {
            currentToken += ch;
          }
        } else if (ch === "[") {
          bracketDepth++;
          currentToken += ch;
        } else if (ch === "]") {
          bracketDepth--;
          currentToken += ch;
        } else if ((ch === " " || ch === "\t") && bracketDepth === 0) {
          // 値確定
          commitKeyValue(result, currentKey, currentToken);
          currentKey = "";
          currentToken = "";
          state = "IDLE";
        } else {
          currentToken += ch;
        }
        break;

      case "QUOTED_VALUE":
        if (ch === "\\" && i + 1 < src.length) {
          // エスケープシーケンス
          const next = src[i + 1] ?? "";
          if (next === "n") {
            currentToken += "\n";
          } else if (next === "t") {
            currentToken += "\t";
          } else {
            currentToken += next;
          }
          i++;
        } else if (ch === quoteChar) {
          // クォート終了
          commitKeyValue(result, currentKey, currentToken);
          currentKey = "";
          currentToken = "";
          quoteChar = "";
          state = "IDLE";
        } else {
          currentToken += ch;
        }
        break;
    }
  }

  // 末尾のトークンをフラッシュ
  if (state === "CLASS" && currentToken) {
    result.classes.push(currentToken);
  } else if (state === "KEY" && currentToken) {
    result.attrs[currentToken] = true;
  } else if (state === "VALUE" && currentKey) {
    commitKeyValue(result, currentKey, currentToken);
  }

  return result;
}

/**
 * キーバリューペアを結果オブジェクトに格納する
 */
function commitKeyValue(
  result: ParsedAttrs,
  key: string,
  value: string,
): void {
  if (!key) return;
  if (key.startsWith("on:")) {
    result.events[key] = value;
  } else {
    result.attrs[key] = value;
  }
}
