import { CacheReference } from "./cache.js";

export function host<T, I>(fn: (cacheEntry: CacheReference, input: I) => T): (input: I) => T {
  const rootCacheReference: CacheReference = {
    value: undefined,
  };
  return (input: I): T => {
    return fn(rootCacheReference, input);
  };
}
