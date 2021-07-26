import { Comparator, SearchNode, SearchTree } from "../search-tree/index.js";

export function find<K, V>(tree: SearchTree<K, V>, key: K, comparator: Comparator<K>): SearchNode<K, V> | undefined {
  if (tree === null) {
    return undefined;
  }

  // Check which way to recurse.
  const comparison = comparator(key, tree.keyValue.key);
  if (comparison == 0) {
    // We have found the node to delete.
    return tree;
  } else if (comparison < 0) {
    // Recurse to the left.
    return find(tree.left, key, comparator);
  } else {
    // Recurse to the right.
    return find(tree.right, key, comparator);
  }
}
