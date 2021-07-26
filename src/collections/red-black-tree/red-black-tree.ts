import { KeyValue, searchGeneralNode, SearchNode } from "../search-tree/index.js";

// Immutable red-black tree.
export enum Color {R, B}

export interface RbNode<K, V> extends SearchNode<K, V> {
  color: Color,
  left: RbTree<K, V>,
  right: RbTree<K, V>,
}

export type RbTree<K, V> = RbNode<K, V> | null;

export function rbNode<K, V>(color: Color, left: RbTree<K, V>, keyValue: KeyValue<K, V>, right: RbTree<K, V>): RbNode<K, V> {
  return rbGeneralNode(color, left, keyValue, right, false);
}

export function rbTombstone<K, V>(color: Color, left: RbTree<K, V>, keyValue: KeyValue<K, V>, right: RbTree<K, V>): RbNode<K, V> {
  return rbGeneralNode(color, left, keyValue, right, true);
}

export function rbGeneralNode<K, V>(color: Color, left: RbTree<K, V>, keyValue: KeyValue<K, V>, right: RbTree<K, V>, tombstone: boolean): RbNode<K, V> {
  return {
    ...searchGeneralNode(left, keyValue, right, tombstone),
    color,
  };
}
