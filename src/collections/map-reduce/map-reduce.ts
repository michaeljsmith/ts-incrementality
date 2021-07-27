import { CacheContext, CacheReference, newCacheContext } from "../../cache.js";
import { Collection } from "../collection.js";
import { Comparator } from "../../comparison.js";
import { find, findEnclosing, MapReduceCacheNode, MapReduceCacheTree } from "./map-reduce-cache-tree.js";

type MapReduceCacheEntry<K, V, O> = {
  cacheTree: MapReduceCacheTree<K, V, O>;
};

type Mapper<K, V, O> = (cache: CacheContext, inputKey: K, inputValue: V) => O;
type Reducer<O> = (cache: CacheContext, left: O, right: O) => O;

export function mapReduce<K, V, O>(
    cacheReference: CacheReference,
    collection: Collection<K, V>,
    comparator: Comparator<K>,
    mapper: Mapper<K, V, O>,
    reducer: Reducer<O>)
: O | undefined {
  const previousEntry = cacheReference.value as MapReduceCacheEntry<K, V, O> | undefined;

  const cacheTree = mapReduceRecurse(collection, previousEntry?.cacheTree ?? null, {
    comparator,
    mapper,
    reducer,
  });
  const cacheEntry: MapReduceCacheEntry<K, V, O> = {
    cacheTree
  }
  cacheReference.value = cacheEntry;
  return cacheTree?.treeOutput;
}

type RecursionParameters<K, V, O> = {
  comparator: Comparator<K>,
  mapper: Mapper<K, V, O>,
  reducer: Reducer<O>,
};

function mapReduceRecurse<K, V, O>(
    inputTree: Collection<K, V>,
    previousCacheTree: MapReduceCacheTree<K, V, O>,
    params: RecursionParameters<K, V, O>)
: MapReduceCacheTree<K, V, O> {
  if (inputTree === null) {
    return null;
  }

  // Restrict our search in the cache tree to the smallest sub-tree containing
  // the input key range.
  const enclosingTree = findEnclosing(previousCacheTree, inputTree.keyRange, params.comparator);

  if (enclosingTree !== null) {
    // Check whether the input is unchanged, and if so, return the cached
    // result immediately.
    if (enclosingTree.inputTree === inputTree) {
      return enclosingTree;
    }
  }

  // Look for the node in the cache.
  const existingCacheNode = inputTree.keyValue === undefined ?
    enclosingTree : find(enclosingTree, inputTree.keyValue.key, params.comparator) ?? null;

  if (existingCacheNode !== null) {
    // Check whether the input is unchanged, and if so, return the cached
    // result immediately.
    if (existingCacheNode.inputTree === inputTree) {
      return existingCacheNode;
    }
  }

  // Update the root value.
  // TODO: Consider doing one-level deep equality testing to see if the result is
  // unchanged - this could significantly reduce the amount of propagation.
  const {cache: mapCache, cacheContext: mapCacheContext} = newCacheContext(previousCacheTree?.mapCache);
  const nodeOutput = inputTree.tombstone || inputTree.keyValue === undefined ? undefined :
    params.mapper(
      mapCacheContext,
      inputTree.keyValue.key,
      inputTree.keyValue.value);

  // Recurse to children.
  const left = mapReduceRecurse(inputTree.left, enclosingTree, params);
  const right = mapReduceRecurse(inputTree.right, enclosingTree, params);

  // Reduce the results.
  // TODO: Consider doing one-level deep equality testing to see if the result is
  // unchanged - this could significantly reduce the amount of propagation.
  const {cache: reduceCacheLeft, result: leftReduction} = maybeReduce(
    previousCacheTree?.reduceCacheLeft,
    params.reducer,
    left?.treeOutput,
    nodeOutput);

  const {cache: reduceCacheRight, result: treeOutput} = maybeReduce(
    previousCacheTree?.reduceCacheRight,
    params.reducer,
    leftReduction,
    right?.treeOutput);

  return {
    mapCache,
    reduceCacheLeft,
    reduceCacheRight,
    left,
    key: inputTree.keyValue?.key,
    inputTree,
    nodeOutput,
    treeOutput,
    right,
  };
}

function maybeReduce<O>(
    previousCache: {} | undefined,
    reducer: Reducer<O>,
    left: O | undefined,
    right: O | undefined) {
  const {cache, cacheContext} = newCacheContext(previousCache);
  const result = left === undefined ? right :
    right === undefined ? left :
    reducer(cacheContext, left, right);
  return {
    result,
    cache,
  }
}
