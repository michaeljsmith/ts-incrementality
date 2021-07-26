import { Comparator, find, SearchTree } from "./search-tree/index.js";

export type Insertion<K, V> = {
  diffType: 'insertion',
  key: K,
  value: V,
};

export type Deletion<K> = {
  diffType: 'deletion',
  key: K,
};

export type Update<K, V> = {
  diffType: 'update',
  key: K,
  value: V,
};

export type Diff<K, V> = Insertion<K, V> | Deletion<K> | Update<K, V>;

export function* diff<K, V>(
    orig: SearchTree<K, V>,
    dest: SearchTree<K, V>,
    comparator: Comparator<K>)
: Generator<Diff<K, V>> {
  yield* findDeletionsRecurse(orig, dest, comparator);
  yield* findUpdatesRecurse(orig, dest, comparator);
}

function* findDeletionsRecurse<K, V>(
    orig: SearchTree<K, V>,
    destRoot: SearchTree<K, V>,
    comparator: Comparator<K>)
: Generator<Deletion<K>> {
  if (orig === null || orig.tombstone) {
    return;
  }

  // See if the node still exists in dest.
  const dest = find(destRoot, orig.keyValue.key, comparator);
  if (dest === undefined || dest.tombstone) {
    // The node has been deleted.
    yield {
      diffType: 'deletion',
      key: orig.keyValue.key,
    };
    return;
  }

  // If the value is unchanged, then we can prune this subtree.
  if (dest === orig) {
    return;
  }

  // Otherwise recurse to children.
  yield* findDeletionsRecurse(orig.left, destRoot, comparator);
  yield* findDeletionsRecurse(orig.right, destRoot, comparator);
}

function* findUpdatesRecurse<K, V>(
  origRoot: SearchTree<K, V>,
  dest: SearchTree<K, V>,
  comparator: Comparator<K>)
: Generator<Insertion<K, V> | Update<K, V>> {
  if (dest === null || dest.tombstone) {
    return;
  }

  // See if the node existed in orig.
  const orig = find(origRoot, dest.keyValue.key, comparator);
  if (orig === undefined || orig.tombstone) {
    // The node has been added.
    yield {
      diffType: 'insertion',
      ...dest.keyValue,
    };
    return;
  }

  // If the value is unchanged, then we can prune this subtree.
  if (dest === orig) {
    return;
  }

  // See whether the root value has changed.
  if (dest.keyValue.value !== orig.keyValue.value) {
    yield {
      diffType: 'update',
      ...dest.keyValue,
    };
  }

  // Recurse to children.
  yield* findUpdatesRecurse(origRoot, dest.left, comparator);
  yield* findUpdatesRecurse(origRoot, dest.right, comparator);
}
