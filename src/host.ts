import { CacheReference } from "./cache.js";

export function host<T, I>(fn: (cacheEntry: CacheReference, input: I) => T): (input: I) => T {
  let rootCacheEntry: {} | undefined = undefined;
  const rootCacheReference: CacheReference = {
    getOrCreate<T extends {}>(init: () => T): T {
      if (rootCacheEntry === undefined) {
        rootCacheEntry = init();
      }
      return rootCacheEntry as T;
    }
  };
  return (input: I): T => {
    return fn(rootCacheReference, input);
  };
}
