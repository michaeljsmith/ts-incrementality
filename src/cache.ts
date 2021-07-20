export interface Cache {
  (key: string): CacheReference;

  // For detecting tracking duplicate key usage.
  incrementVisitKey(): void;
}

export interface CacheReference {
  getOrCreate<T extends {}>(init: () => T): T;
}

export function newCache(): Cache {
  const cache = new Map<string, { visitKey: number; entry: {}; }>();
  let visitKey = 0;
  const result = (key: string) => ({
    getOrCreate<T extends {}>(init: () => T) {
      let node = cache.get(key);
      if (node === undefined) {
        node = {
          visitKey: -1,
          entry: init(),
        };
        cache.set(key, node);
      }
      if (node.visitKey === visitKey) {
        throw `Referenced cache entry ${key} multiple times.`;
      }
      node.visitKey = visitKey;
      return node.entry as T;
    }
  });
  result.incrementVisitKey = () => {
    ++visitKey;
  };

  return result;
}
