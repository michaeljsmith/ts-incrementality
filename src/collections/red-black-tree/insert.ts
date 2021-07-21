import { Color, Comparator, RbNode, RbTree } from "./tree.js";

export function insert<T>(
    tree: RbTree<T>, value: T, comparator: Comparator<T>): RbTree<T> {
  const resultWithPossibleTopLevelRedViolation =
    insertWithPossibleTopLevelRedViolation(tree, value, comparator);

  // Paint the top level black, resolving any top-level red violation.
  // This mechanism allows the black depth of the tree to be increased
  // where necessary.
  return {
    ...resultWithPossibleTopLevelRedViolation,
    color: Color.B,
  };
}

function insertWithPossibleTopLevelRedViolation<T>(
   tree: RbTree<T>, value: T, comparator: Comparator<T>): RbNode<T> {
  // The tree returned by this function may include a red violation. This
  // must be resolved by the caller.

  // If the tree is empty, return a new red leaf node containing the value.
  // We return red so as not to increase the black depth and cause a black
  // violation - if increasing the black depth is necessary then it is the
  // responsibility of the root caller to do so.
  if (tree === null) {
    return {
      color: Color.R,
      left: null,
      value,
      right: null,
    }
  }

  // Check whether the item belongs in the left or right subtree.
  const comparison = comparator(value, tree.value);
  if (comparison == 0) {
    // This is the correct position for the value, but there is already a value
    // here - update it.
    return {
      ...tree,
      value,
    };
  } else if (comparison < 0) {
    // Insert in left subtree.
    return balanceWithPossibleTopLevelRedViolation({
      ...tree,
      left: insertWithPossibleTopLevelRedViolation(tree.left, value, comparator),
    });
  } else {
    // Insert in right subtree.
    return balanceWithPossibleTopLevelRedViolation({
      ...tree,
      right: insertWithPossibleTopLevelRedViolation(tree.right, value, comparator),
    });
  }
}

function balanceWithPossibleTopLevelRedViolation<T>(tree: RbNode<T>): RbNode<T> {
  // TODO: Is this necessary? I don't think it should ever happen, that the root is
  // red but we have doubled red children, but if it did, is this the right
  // behaviour?
  if (tree.color !== Color.B) {
    return tree;
  }

  // Check for the four possible red violations (not including violations at the
  // top level - we can't resolve those adequately, the caller will need to do
  // that)
  if (tree.left?.color === Color.R && tree.left.left?.color === Color.R) {
    //     Z(B)              Y(R)
    //     /  \             /    \
    //   Y(R)       =>    X(B)   Z(B)
    //   /  \            /   \  /   \
    // X(R)
    return {
      ...tree.left,
      left: {
        ...tree.left.left,
        color: Color.B,
      },
      right: {
        ...tree,
        left: tree.left.right,
      },
    };
  } else if (tree.left?.color === Color.R && tree.left.right?.color === Color.R) {
    //       Z(B)            Y(R)
    //      /    \          /    \
    //   X(R)       =>    X(B)   Z(B)
    //   /  \            /   \  /   \
    //      Y(R)
    return {
      ...tree.left.right,
      left: {
        ...tree.left,
        color: Color.B,
        right: tree.left.right.left,
      },
      right: {
        ...tree,
        left: tree.left.right.right,
      },
    };
  } else if (tree.right?.color === Color.R && tree.right.left?.color === Color.R) {
    //     X(B)               Y(R)
    //     /  \              /    \
    //        Z(R)   =>    X(B)   Z(B)
    //        / \         /   \  /   \
    //      Y(R)
    return {
      ...tree.right.left,
      left: {
        ...tree,
        right: tree.right.left.left,
      },
      right: {
        ...tree.right,
        color: Color.B,
        left: tree.right.left.right,
      },
    };
  } else if (tree.right?.color === Color.R && tree.right.right?.color === Color.R) {
    //     X(B)               Y(R)
    //     /  \              /    \
    //        Y(R)   =>    X(B)   Z(B)
    //        / \         /   \  /   \
    //          Z(R)
    return {
      ...tree.right,
      left: {
        ...tree,
        right: tree.right.left,
      },
      right: {
        ...tree.right.right,
        color: Color.B,
      }
    };
  }

  return tree;
}
