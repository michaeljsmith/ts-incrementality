// Deletion from red-black trees is quite involved. For now, we just leave a
// tombstone instead of properly deleting and re-balancing, even though this
// potentially introduces some performance degradation over time.
//
// TODO: Implement deletion, e.g. following [1].
//
// [1]: https://matt.might.net/papers/germane2014deletion.pdf

import { Comparator, RbNode, RbTree } from "./tree.js";

export function rbDelete<T>(tree: RbTree<T>, value: T, comparator: Comparator<T>): RbTree<T> {
  if (tree === null) {
    throw `item '${value}' not found in tree.`;
  }

  // Check which way to recurse.
  const comparison = comparator(value, tree.value);
  if (comparison == 0) {
    // We have found the node to delete.
    // Check whether it is a tombstone, otherwise delete it.
    if (tree.tombstone) {
      throw `item '${value}' is already deleted.`;
    }

    return {
      ...tree,
      tombstone: true,
    };
  } else if (comparison < 0) {
    // Recurse to the left.
    return {
      ...tree,
      left: rbDelete(tree.left, value, comparator),
    };
  } else {
    // Recurse to the right.
    return {
      ...tree,
      right: rbDelete(tree.right, value, comparator),
    }
  }
}
