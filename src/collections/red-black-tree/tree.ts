// Immutable red-black tree.
export enum Color {R, B}

export type RbNode<T> = {
  color: Color;
  left: RbTree<T>;
  value: T;
  right: RbTree<T>;
};

export type RbTree<T> = RbNode<T> | null;

export type Comparator<T> = (a: T, b: T) => number;
