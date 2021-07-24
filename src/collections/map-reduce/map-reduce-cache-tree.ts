import { Cache } from "../../cache.js";
import { RbComparator } from "../red-black-tree/tree.js";

export type MapReduceCacheNode<K, O> = {
  cache: Cache;

  left: MapReduceCacheTree<K, O>;
  key: K;
  output: O;
  right: MapReduceCacheTree<K, O>;
};

export type MapReduceCacheTree<K, O> = MapReduceCacheNode<K, O> | null;

export function find<K, O>(tree: MapReduceCacheTree<K, O>, key: K, comparator: RbComparator<K>): MapReduceCacheNode<K, O> | undefined {
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
