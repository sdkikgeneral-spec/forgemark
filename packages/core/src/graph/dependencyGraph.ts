/**
 * 依存グラフ
 * includeによるファイル間の依存関係を有向グラフで管理する
 * 差分レンダリングのためのgetAffected()とトポロジカルソートを提供する
 */

/** グラフノード（ファイル単位） */
export interface GraphNode {
  /** ワークスペース相対パス（正規化済み） */
  filePath: string;
  /** このファイルがincludeしているファイルパス */
  dependencies: Set<string>;
  /** このファイルをincludeしているファイルパス */
  dependents: Set<string>;
  /** 最終解析タイムスタンプ（差分更新判定用） */
  lastParsed: number;
}

/**
 * includeの依存グラフ
 * ファイル保存時に update() を呼び出してグラフを更新する
 */
export class DependencyGraph {
  private readonly nodes = new Map<string, GraphNode>();

  /**
   * ファイルの依存関係を更新する
   * @param filePath - 更新するファイルのパス
   * @param dependencies - このファイルがincludeしているファイルパス配列
   */
  update(filePath: string, dependencies: string[]): void {
    // 既存ノードの古いdependenciesを取得
    const existing = this.nodes.get(filePath);
    if (existing) {
      // 古い依存エッジを削除
      for (const dep of existing.dependencies) {
        this.nodes.get(dep)?.dependents.delete(filePath);
      }
    }

    // 新しいノードを作成/更新
    const node: GraphNode = {
      filePath,
      dependencies: new Set(dependencies),
      dependents: existing?.dependents ?? new Set(),
      lastParsed: Date.now(),
    };
    this.nodes.set(filePath, node);

    // 新しい依存エッジを追加
    for (const dep of dependencies) {
      if (!this.nodes.has(dep)) {
        this.nodes.set(dep, {
          filePath: dep,
          dependencies: new Set(),
          dependents: new Set(),
          lastParsed: 0,
        });
      }
      this.nodes.get(dep)!.dependents.add(filePath);
    }
  }

  /**
   * ファイルをグラフから削除する
   * @param filePath - 削除するファイルのパス
   */
  remove(filePath: string): void {
    const node = this.nodes.get(filePath);
    if (!node) return;

    // 依存元ノードからエッジを削除
    for (const dep of node.dependencies) {
      this.nodes.get(dep)?.dependents.delete(filePath);
    }

    // 依存先ノードからエッジを削除
    for (const dependent of node.dependents) {
      this.nodes.get(dependent)?.dependencies.delete(filePath);
    }

    this.nodes.delete(filePath);
  }

  /**
   * 変更ファイルから影響を受ける全ファイルを返す（逆向き探索）
   * @param filePath - 変更されたファイルのパス
   * @returns 影響を受けるファイルパスのセット（変更ファイル自身を含む）
   */
  getAffected(filePath: string): Set<string> {
    const affected = new Set<string>();
    const queue = [filePath];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (affected.has(current)) continue;
      affected.add(current);

      const node = this.nodes.get(current);
      if (node) {
        for (const dependent of node.dependents) {
          if (!affected.has(dependent)) {
            queue.push(dependent);
          }
        }
      }
    }

    return affected;
  }

  /**
   * グラフ内の全ノードを返す
   */
  getNodes(): Map<string, GraphNode> {
    return new Map(this.nodes);
  }

  /**
   * ファイルパスのノードを返す
   */
  getNode(filePath: string): GraphNode | undefined {
    return this.nodes.get(filePath);
  }

  /**
   * グラフが指定ファイルを含むか確認する
   */
  has(filePath: string): boolean {
    return this.nodes.has(filePath);
  }

  /**
   * グラフのノード数を返す
   */
  get size(): number {
    return this.nodes.size;
  }
}
