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
  let comparison;
  // Check if the value is a tombstone.
  if (!('value' in tree) || tree.value === undefined) {
    const maxLeft = maxValue(tree.left, comparator);
    const minRight = minValue(tree.right, comparator);
    // Value is a tombstone - replace it if this is the right place in the
    // tree for the new value.
    comparison =
      // Recurse to left if the value is lte max of left.
      maxLeft !== undefined && comparator(value, maxLeft.value) <= 0 ? -1 :
      // Recurse to the right if the value is gte min of right.
        minRight !== undefined && comparator(value, minRight.value) >= 0 ? 1 :
          // Else the current node is the best place to insert.
          0;
  } else {
    // Not a tombstone - choose subtree based on value in node.
    comparison = comparator(value, tree.value);
  }

  if (comparison === 0) {
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

type Value<T> = { value: T };

function minValue<T>(tree: RbTree<T>, comparator: Comparator<T>): Value<T> | undefined {
  if (tree === null) {
    return undefined;
  }

  // Due to the possible presence of tombstones, we may need to scan other options
  // than just the left subtree.
  return minValue(tree.left, comparator) ??
    rootValue(tree) ??
    minValue(tree.right, comparator);
}

function maxValue<T>(tree: RbTree<T>, comparator: Comparator<T>): Value<T> | undefined {
  if (tree === null) {
    return undefined;
  }

  // Due to the possible presence of tombstones, we may need to scan other options
  // than just the right subtree.
  return maxValue(tree.right, comparator) ??
    rootValue(tree) ??
    maxValue(tree.left, comparator);
}

function rootValue<T>(node: RbNode<T>): Value<T> | undefined {
  return 'value' in node && node.value !== undefined ? { value: node.value } : undefined;
}
