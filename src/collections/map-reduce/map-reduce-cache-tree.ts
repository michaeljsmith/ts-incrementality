import { Cache } from "../../cache.js";
import { Collection } from "../collection.js";
import { RbComparator } from "../red-black-tree/tree.js";

export type MapReduceCacheNode<K, V, O> = {
  cache: Cache,

  left: MapReduceCacheTree<K, V, O>,
  key: K,
  inputTree: Collection<K, V>,
  nodeOutput: O,
  treeOutput: O,
  right: MapReduceCacheTree<K, V, O>,
};

export type MapReduceCacheTree<K, V, O> = MapReduceCacheNode<K, V, O> | null;

export function find<K, V, O>(
    tree: MapReduceCacheTree<K, V, O>,
    key: K,
    comparator: RbComparator<K>)
: MapReduceCacheNode<K, V, O> | undefined {

  if (tree === null) {
    return undefined;
  }

  // Check which way to recurse.
  const comparison = comparator(key, tree.key);
  if (comparison === 0) {
    // We have found the desired cache node.
    return tree;
  } else if (comparison < 0) {
    return find(tree.left, key, comparator);
  } else if (comparison > 0) {
    return find(tree.right, key, comparator);
  }
}
