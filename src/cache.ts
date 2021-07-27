export interface CacheStore {
  [key: string]: {};
}

export interface CacheContext {
  (key: string): CacheReference;
}

export interface CacheReference {
  value: {} | unknown;
}

export function newCacheContext(previousCache: CacheStore | undefined) {
  const cache = {} as CacheStore;

  return {
    cache,
    cacheContext: (key: string) => ({
      get value(): {} | undefined {
        if (key in cache) {
          throw `Referenced cache entry ${key} multiple times.`;
        }
        if (previousCache === undefined) {
          return undefined;
        }
        cache[key] = previousCache[key];
        return previousCache[key];
      },
      set value(newValue: {} | undefined) {
        if (newValue === undefined) {
          delete cache[key];
        } else {
          cache[key] = newValue;
        }
      },
    }),
  };
}
