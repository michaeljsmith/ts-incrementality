import { SearchNode, SearchTree } from "../search-tree/index.js";
import { Comparator } from "../../comparison.js";
import { keyRangeContains } from "../key-range.js";

export function find<K, V>(tree: SearchTree<K, V>, key: K, comparator: Comparator<K>): SearchNode<K, V> | undefined {
  if (tree === null) {
    return undefined;
  }

  // Check if we have found the node.
  if (tree.keyValue !== undefined && comparator(key, tree.keyValue.key) === 0) {
    return tree;
  }

  // Recurse left if necessary.
  if (tree.left !== null && keyRangeContains(comparator, tree.left.keyRange, key)) {
    return find(tree.left, key, comparator);
  }

  // Recurse right if necessary.
  if (tree.right !== null && keyRangeContains(comparator, tree.right.keyRange, key)) {
    return find(tree.right, key, comparator);
  }

  return undefined;
}
