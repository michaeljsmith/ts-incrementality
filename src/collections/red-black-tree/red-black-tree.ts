import { KeyValue, SearchNode } from "../search-tree/index.js";

// Immutable red-black tree.
export enum Color {R, B}

export interface RbNode<K, V> extends SearchNode<K, V> {
  color: Color,
  left: RbTree<K, V>,
  right: RbTree<K, V>,
}

export type RbTree<K, V> = RbNode<K, V> | null;
