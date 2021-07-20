export interface Cache {
  (key: string): CacheEntry;

  // For detecting tracking duplicate key usage.
  incrementVisitKey(): void;
}

export interface CacheEntry {
  memoization?: unknown,
};

type Memoization<T, Args extends [unknown]> = {
  cache: Cache,

  previousFunction: (cache: Cache) => (...args: Args) => T;
  previousArgs: Args;
  previousResult: T;
}

function newCache(): Cache {
  const cache = new Map<string, {visitKey: number, entry: CacheEntry}>();
  let visitKey = 0;
  const result = (key: string) => {
    let node = cache.get(key);
    if (node === undefined) {
      node = {
        visitKey: -1,
        entry: {},
      }
      cache.set(key, node);
    }
    if (node.visitKey === visitKey) {
      throw `Referenced cache entry ${key} multiple times.`;
    }
    node.visitKey = visitKey;
    return node.entry;
  };
  result.incrementVisitKey = () => {
    ++visitKey;
  };

  return result;
}

export function host<T, I>(fn: (cacheEntry: CacheEntry, input: I) => T) {
  const rootCacheEntry: CacheEntry = {};
  return (input: I): T => {
    return fn(rootCacheEntry, input);
  }
}

export function incremental<T, Args extends [unknown]>(
  fn: (cache: Cache) => (...args: Args) => T)
: (cacheEntry: CacheEntry, ...args: Args) => T {
  return (cacheEntry, ...args) => {
    let memoization = cacheEntry.memoization as Memoization<T, Args> | undefined;
    if (memoization !== undefined) {
      // If the previous function is different to this one, then we may be passing a closure
      // to this function - in this case we can't be sure that the result of the function
      // depends solely on the passed-in arguments, so to be safe we throw an exception here.
      if (memoization.previousFunction !== fn) {
        throw 'Cached function differs from previous invocation - may be trying to cache a closure';
      }

      // If the arguments are all the same, then we can re-use the result.
      if (memoization.previousArgs.reduce((accumulator, arg, i) =>
          accumulator && arg === args[i], true)) {
        return memoization.previousResult;
      }
    }

    if (memoization === undefined) {
      const newMemoization = {} as Memoization<T, Args>;
      cacheEntry.memoization = memoization = newMemoization;
      memoization.cache = newCache();
    }
    memoization.previousFunction = fn;
    memoization.previousArgs = args;

    // Increment the visit key, so that one call to each sub-node will be allowed.
    memoization.cache.incrementVisitKey();

    const result = fn(memoization.cache)(...args);
    memoization.previousResult = result;
    return result;
  };
}
