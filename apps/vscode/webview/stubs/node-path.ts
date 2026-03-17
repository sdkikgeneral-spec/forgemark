// node:path ブラウザスタブ
export const sep = "/";
export const resolve = (...parts: string[]) => parts.join("/");
export const join = (...parts: string[]) => parts.join("/");
export const dirname = (p: string) => p.split("/").slice(0, -1).join("/");
export const basename = (p: string) => p.split("/").pop() ?? "";
export const extname = (p: string) => {
  const base = basename(p);
  const i = base.lastIndexOf(".");
  return i > 0 ? base.slice(i) : "";
};
export default { sep, resolve, join, dirname, basename, extname };
