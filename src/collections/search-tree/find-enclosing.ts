import { Comparator } from "../../comparison.js";
import { KeyRange, keyRangeEncloses } from "../key-range.js";
import { SearchTree } from "./search-tree.js";

export function findEnclosing<K, V, O>(
  tree: SearchTree<K, V>,
  keyRange: KeyRange<K>,
  comparator: Comparator<K>)
: SearchTree<K, V> {
if (tree === null) {
  return null;
}

// Check whether to recurse left.
if (tree.left != null &&
    keyRangeEncloses(comparator, tree.left.keyRange, keyRange)) {
  return findEnclosing(tree.left, keyRange, comparator);
}

// Check whether to recurse right.
if (tree.right != null &&
    keyRangeEncloses(comparator, tree.right.keyRange, keyRange)) {
  return findEnclosing(tree.right, keyRange, comparator);
}

// Otherwise stick with the root tree.
return tree;
}
