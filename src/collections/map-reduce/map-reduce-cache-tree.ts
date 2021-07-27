import { Comparator } from "../../comparison.js";
import { KeyRange, keyRangeEncloses } from "../key-range.js";
import { SearchNode } from "../search-tree/search-tree.js";

export type MapReduceCacheNode<K, V, O> = {
  mapCache?: unknown,
  reduceCacheLeft?: unknown,
  reduceCacheRight?: unknown,

  left: MapReduceCacheTree<K, V, O>,
  key: K,
  inputTree: SearchNode<K, V>,
  nodeOutput: O | undefined,
  treeOutput: O | undefined,
  right: MapReduceCacheTree<K, V, O>,
};

export type MapReduceCacheTree<K, V, O> = MapReduceCacheNode<K, V, O> | null;

export function find<K, V, O>(
    tree: MapReduceCacheTree<K, V, O>,
    key: K,
    comparator: Comparator<K>)
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

export function findEnclosing<K, V, O>(
    tree: MapReduceCacheTree<K, V, O>,
    keyRange: KeyRange<K>,
    comparator: Comparator<K>)
: MapReduceCacheTree<K, V, O> {
  if (tree === null) {
    return null;
  }

  // Check whether to recurse left.
  if (tree.left != null &&
      keyRangeEncloses(comparator, tree.left.inputTree.keyRange, keyRange)) {
    return findEnclosing(tree.left, keyRange, comparator);
  }

  // Check whether to recurse right.
  if (tree.right != null &&
      keyRangeEncloses(comparator, tree.right.inputTree.keyRange, keyRange)) {
    return findEnclosing(tree.right, keyRange, comparator);
  }

  // Otherwise stick with the root tree.
  return tree;
}
