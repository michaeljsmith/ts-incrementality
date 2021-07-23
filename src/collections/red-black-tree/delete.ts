// Deletion from red-black trees is quite involved. For now, we just leave a
// tombstone instead of properly deleting and re-balancing, even though this
// potentially introduces some performance degradation over time.
//
// TODO: Implement deletion, e.g. following [1].
//
// [1]: https://matt.might.net/papers/germane2014deletion.pdf

import { Comparator, RbNode, RbTree } from "./tree.js";

export function rbDelete<K, V>(tree: RbTree<K, V>, key: K, comparator: Comparator<K>): RbTree<K, V> {
  if (tree === null) {
    throw `item '${key}' not found in tree.`;
  }

  // Check which way to recurse.
  const comparison = comparator(key, tree.keyValue.key);
  if (comparison == 0) {
    // We have found the node to delete.
    // Check whether it is a tombstone, otherwise delete it.
    if (tree.tombstone) {
      throw `item '${key}' is already deleted.`;
    }

    return {
      ...tree,
      tombstone: true,
    };
  } else if (comparison < 0) {
    // Recurse to the left.
    return {
      ...tree,
      left: rbDelete(tree.left, key, comparator),
    };
  } else {
    // Recurse to the right.
    return {
      ...tree,
      right: rbDelete(tree.right, key, comparator),
    }
  }
}
