import { CacheReference, CacheContext, newCacheContext, CacheStore } from "./cache.js";

type IncrementalFunctionEntry<T, Args extends [unknown]> = {
  cache: CacheStore,

  fn: (cache: CacheContext) => (...args: Args) => T;
  args: Args;
  result: T;
}

export function incremental<T, Args extends [unknown]>(
  fn: (cache: CacheContext) => (...args: Args) => T)
: (cacheReference: CacheReference, ...args: Args) => T {
  return (cacheReference, ...args) => {
    const previousEntry = cacheReference.value as IncrementalFunctionEntry<T, Args> | undefined;
    if (previousEntry !== undefined) {
      // If the previous function is different to this one, then we may be passing a closure
      // to this function - in this case we can't be sure that the result of the function
      // depends solely on the passed-in arguments, so to be safe we throw an exception here.
      if (previousEntry.fn !== fn) {
        throw 'Cached function differs from previous invocation - may be trying to cache a closure';
      }

      // If the arguments are all the same, then we can re-use the result.
      if (previousEntry.args.reduce((accumulator, arg, i) =>
          accumulator && arg === args[i], true)) {
        return previousEntry.result;
      }
    }

    // TODO: Consider doing one-level deep equality testing to see if the result is
    // unchanged - this could significantly reduce the amount of propagation.
    const {cache, cacheContext} = newCacheContext(previousEntry?.cache);
    const result = fn(cacheContext)(...args);
    const entry: IncrementalFunctionEntry<T, Args> = {
      cache,
      fn,
      args,
      result,
    };
    cacheReference.value = entry;

    return result;
  };
}
