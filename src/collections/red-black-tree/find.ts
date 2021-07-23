import { RbComparator, RbNode, RbTree } from "./tree.js";

export function rbFind<K, V>(tree: RbTree<K, V>, key: K, comparator: RbComparator<K>): RbNode<K, V> | undefined {
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
    return rbFind(tree.left, key, comparator);
  } else {
    // Recurse to the right.
    return rbFind(tree.right, key, comparator);
  }
}
