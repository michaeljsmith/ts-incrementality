import { CacheReference } from "@/cache.js";
import { Collection, KeyValue } from "../collection.js";
import { RbComparator } from "../red-black-tree/tree.js";
import { find, MapReduceCacheNode, MapReduceCacheTree } from "./map-reduce-cache-tree.js";

type MapReduceCacheEntry<K, V, O> = {
  cacheTree: MapReduceCacheTree<K, V, O>;
};

type Mapper<K, V, O> = (cacheReference: CacheReference, inputKey: K, inputValue: V) => O;
type Reducer<O> = (cacheReference: CacheReference, left: O, right: O) => O;

export function mapReduce<K, V, O>(
    cacheReference: CacheReference,
    collection: Collection<K, V>,
    comparator: RbComparator<K>,
    mapper: Mapper<K, V, O>,
    reducer: Reducer<O>)
: O | undefined {
  const cacheEntry = cacheReference.getOrCreate<MapReduceCacheEntry<K, V, O>>(() => ({
    cacheTree: null
  }));

  const newCacheTree = mapReduceRecurse(collection, {
    comparator,
    mapper,
    reducer,
    previousCacheTree: cacheEntry.cacheTree,
  });
  cacheEntry.cacheTree = newCacheTree;
  return newCacheTree?.treeOutput;
}

type RecursionParameters<K, V, O> = {
  comparator: RbComparator<K>,
  mapper: Mapper<K, V, O>,
  reducer: Reducer<O>,
  previousCacheTree: MapReduceCacheTree<K, V, O>,
};

export function mapReduceRecurse<K, V, O>(
    inputTree: Collection<K, V>,
    params: RecursionParameters<K, V, O>)
: MapReduceCacheTree<K, V, O> {
  if (inputTree === null) {
    return null;
  }

  // Look for the node in the cache.
  const existingCacheNode = find(
    params.previousCacheTree, inputTree.keyValue.key, params.comparator);

  if (existingCacheNode !== undefined) {
    // Check whether the input is unchanged, and if so, return the cached
    // result immediately.
    if (existingCacheNode.inputTree === inputTree) {
      return existingCacheNode;
    }
  }

  // If the node was not found, then we have not previously evaluated this
  // node, so create a new, empty cache node for it now.
  const cacheNode: Partial<MapReduceCacheNode<K, V, O>> =
    existingCacheNode ?? {
      key: inputTree.keyValue.key,
      inputTree,
    };

  // Update the root value.
  // TODO: Consider doing one-level deep equality testing to see if the result is
  // unchanged - this could significantly reduce the amount of propagation.
  cacheNode.nodeOutput = inputTree.tombstone ? undefined :
    params.mapper(
      cacheReference(cacheNode, 'mapCache'),
      inputTree.keyValue.key,
      inputTree.keyValue.value);

  // Recurse to children.
  cacheNode.left = mapReduceRecurse(inputTree.left, params);
  cacheNode.right = mapReduceRecurse(inputTree.right, params);

  // Reduce the results.
  // TODO: Consider doing one-level deep equality testing to see if the result is
  // unchanged - this could significantly reduce the amount of propagation.
  const leftReduction = maybeReduce(
    cacheReference(cacheNode, 'reduceCacheLeft'),
    params.reducer,
    cacheNode.left?.treeOutput,
    cacheNode.nodeOutput);

  cacheNode.treeOutput = maybeReduce(
    cacheReference(cacheNode, 'reduceCacheRight'),
    params.reducer,
    leftReduction,
    cacheNode.right?.treeOutput);

  return cacheNode as MapReduceCacheNode<K, V, O>;
}

function maybeReduce<O>(
  cacheReference: CacheReference,
  reducer: Reducer<O>,
  left: O | undefined,
  right: O | undefined)
: O | undefined {
  return left === undefined ? right :
    right === undefined ? left :
    reducer(cacheReference, left, right);
}

function cacheReference<K, V, O>(
    cacheNode: Partial<MapReduceCacheNode<K, V, O>>,
    cacheKey: 'mapCache' | 'reduceCacheLeft' | 'reduceCacheRight')
: CacheReference {
  return {
    getOrCreate<T>(init: () => T) {
      if (cacheNode[cacheKey] === undefined) {
        cacheNode[cacheKey] = init();
      }

      return cacheNode[cacheKey] as T;
    },
  };
}