import { Comparator } from "../../comparison.js";
import { KeyRange, keyRangeContains, keyRangeEncloses } from "../key-range.js";
import { SearchNode } from "../search-tree/search-tree.js";

export type MapReduceCacheNode<K, V, O> = {
  mapCache: {},
  reduceCacheLeft: {},
  reduceCacheRight: {},

  left: MapReduceCacheTree<K, V, O>,
  key?: K,
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

  // Check whether we have found the desired cache node.
  if (tree.key !== undefined && comparator(key, tree.key) === 0) {
    return tree;
  }

  // Recurse left if necessary.
  if (tree.left !== null && keyRangeContains(comparator, tree.left.inputTree.keyRange, key)) {
    return find(tree.left, key, comparator);
  }

  // Recurse right if necessary.
  if (tree.right !== null && keyRangeContains(comparator, tree.right.inputTree.keyRange, key)) {
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
