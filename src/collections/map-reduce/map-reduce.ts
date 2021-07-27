import { Cache, CacheReference, newCache } from "../../cache.js";
import { Collection } from "../collection.js";
import { Comparator } from "../../comparison.js";
import { find, findEnclosing, MapReduceCacheNode, MapReduceCacheTree } from "./map-reduce-cache-tree.js";

type MapReduceCacheEntry<K, V, O> = {
  cacheTree: MapReduceCacheTree<K, V, O>;
};

type Mapper<K, V, O> = (cache: Cache, inputKey: K, inputValue: V) => O;
type Reducer<O> = (cache: Cache, left: O, right: O) => O;

export function mapReduce<K, V, O>(
    cacheReference: CacheReference,
    collection: Collection<K, V>,
    comparator: Comparator<K>,
    mapper: Mapper<K, V, O>,
    reducer: Reducer<O>)
: O | undefined {
  const cacheEntry = cacheReference.getOrCreate<MapReduceCacheEntry<K, V, O>>(() => ({
    cacheTree: null
  }));

  const newCacheTree = mapReduceRecurse(collection, cacheEntry.cacheTree, {
    comparator,
    mapper,
    reducer,
  });
  cacheEntry.cacheTree = newCacheTree;
  return newCacheTree?.treeOutput;
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
  const existingCacheNode = find(
    enclosingTree, inputTree.keyValue.key, params.comparator);

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
    {
      mapCache: existingCacheNode?.mapCache,
      reduceCacheLeft: existingCacheNode?.reduceCacheLeft,
      reduceCacheRight: existingCacheNode?.reduceCacheRight,
      key: inputTree.keyValue.key,
      inputTree,
    };

  // Update the root value.
  // TODO: Consider doing one-level deep equality testing to see if the result is
  // unchanged - this could significantly reduce the amount of propagation.
  cacheNode.nodeOutput = inputTree.tombstone ? undefined :
    params.mapper(
      referencedCache(cacheNode, 'mapCache'),
      inputTree.keyValue.key,
      inputTree.keyValue.value);

  // Recurse to children.
  cacheNode.left = mapReduceRecurse(inputTree.left, enclosingTree, params);
  cacheNode.right = mapReduceRecurse(inputTree.right, enclosingTree, params);

  // Reduce the results.
  // TODO: Consider doing one-level deep equality testing to see if the result is
  // unchanged - this could significantly reduce the amount of propagation.
  const leftReduction = maybeReduce(
    referencedCache(cacheNode, 'reduceCacheLeft'),
    params.reducer,
    cacheNode.left?.treeOutput,
    cacheNode.nodeOutput);

  cacheNode.treeOutput = maybeReduce(
    referencedCache(cacheNode, 'reduceCacheRight'),
    params.reducer,
    leftReduction,
    cacheNode.right?.treeOutput);

  return cacheNode as MapReduceCacheNode<K, V, O>;
}

function maybeReduce<O>(
  cache: Cache,
  reducer: Reducer<O>,
  left: O | undefined,
  right: O | undefined)
: O | undefined {
  return left === undefined ? right :
    right === undefined ? left :
    reducer(cache, left, right);
}

function referencedCache<K, V, O>(
    cacheNode: Partial<MapReduceCacheNode<K, V, O>>,
    cacheKey: 'mapCache' | 'reduceCacheLeft' | 'reduceCacheRight')
: Cache {
  if (cacheNode[cacheKey] === undefined) {
    cacheNode[cacheKey] = newCache();
  } else {
    (cacheNode[cacheKey] as Cache).incrementVisitKey();
  }
  return cacheNode[cacheKey] as Cache;
}
