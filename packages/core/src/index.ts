/**
 * @forgemark/core パブリックAPI
 */

// ASTノード型
export * from "./ast/index.js";

// パーサー
export { parseMarkdown } from "./parser/index.js";
export type { ParseResult } from "./parser/index.js";

// include
export { normalizeSugarIncludes, sugarToCanonical } from "./include/normalizer.js";
export { parseCanonicalInclude, parseCanonicalIncludeWithWarnings } from "./include/canonicalParser.js";
export { parseSugarInclude } from "./include/sugarParser.js";
export { resolvePath, normalizePath } from "./include/pathResolver.js";

// 依存グラフ
export { DependencyGraph } from "./graph/dependencyGraph.js";
export type { GraphNode } from "./graph/dependencyGraph.js";
export { detectCycles, formatCyclePath } from "./graph/cycleDetector.js";
export type { CycleResult } from "./graph/cycleDetector.js";
export { topoSort } from "./graph/topoSort.js";

// lint
export * from "./lint/index.js";
