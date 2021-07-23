// Immutable red-black tree.
export enum Color {R, B}

export type RBKeyValue<K, V> = {
  key: K,
  value: V,
};

export type RbNode<K, V> = {
  color: Color,
  tombstone: boolean,
  left: RbTree<K, V>,
  keyValue: RBKeyValue<K, V>,
  right: RbTree<K, V>,
};

export type RbTree<K, V> = RbNode<K, V> | null;

export type Comparator<T> = (a: T, b: T) => number;
