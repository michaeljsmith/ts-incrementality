export interface Cache {
  (key: string): CacheReference;

  // For detecting tracking duplicate key usage.
  incrementVisitKey(): void;
}

export interface CacheReference {
  getOrCreate<T extends {}>(init: () => T): T;
}

function newCache(): Cache {
  const cache = new Map<string, {visitKey: number, entry: {}}>();
  let visitKey = 0;
  const result = (key: string) => ({
    getOrCreate<T extends {}>(init: () => T) {
      let node = cache.get(key);
      if (node === undefined) {
        node = {
          visitKey: -1,
          entry: init(),
        }
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

export function host<T, I>(fn: (cacheEntry: CacheReference, input: I) => T) {
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
  }
}

type Memoization<T, Args extends [unknown]> = {
  previousFunction: (cache: Cache) => (...args: Args) => T;
  previousArgs: Args;
  previousResult: T;
};

type IncrementalFunctionEntry<T, Args extends [unknown]> = {
  cache: Cache,

  memoization?: Memoization<T, Args>;
}

export function incremental<T, Args extends [unknown]>(
  fn: (cache: Cache) => (...args: Args) => T)
: (cacheReference: CacheReference, ...args: Args) => T {
  return (cacheReference, ...args) => {
    const entry: IncrementalFunctionEntry<T, Args> = cacheReference.getOrCreate(() => ({
      cache: newCache(),
    }));
    if (entry.memoization !== undefined) {
      // If the previous function is different to this one, then we may be passing a closure
      // to this function - in this case we can't be sure that the result of the function
      // depends solely on the passed-in arguments, so to be safe we throw an exception here.
      if (entry.memoization.previousFunction !== fn) {
        throw 'Cached function differs from previous invocation - may be trying to cache a closure';
      }

      // If the arguments are all the same, then we can re-use the result.
      if (entry.memoization.previousArgs.reduce((accumulator, arg, i) =>
          accumulator && arg === args[i], true)) {
        return entry.memoization.previousResult;
      }
    }

    if (entry.memoization === undefined) {
      const newMemoization = {} as Memoization<T, Args>;
      entry.memoization = newMemoization;
    }
    entry.memoization.previousFunction = fn;
    entry.memoization.previousArgs = args;

    // Increment the visit key, so that one call to each sub-node will be allowed.
    entry.cache.incrementVisitKey();

    const result = fn(entry.cache)(...args);
    entry.memoization.previousResult = result;
    return result;
  };
}
