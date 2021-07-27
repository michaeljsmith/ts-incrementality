import { Comparator } from "../../comparison.js";
import { KeyValue, searchGeneralNode, SearchNode, searchNodeFrom, StrictSearchNode } from "../search-tree/index.js";

// Immutable red-black tree.
export enum Color {R, B}

export interface RbNode<K, V> extends SearchNode<K, V> {
  color: Color,
  left: RbTree<K, V>,
  keyValue: KeyValue<K, V>,
  right: RbTree<K, V>,
}

export type RbTree<K, V> = RbNode<K, V> | null;

export function rbNode<K, V>(
    comparator: Comparator<K>,
    color: Color,
    left: RbTree<K, V>,
    keyValue: KeyValue<K, V>,
    right: RbTree<K, V>)
: RbNode<K, V> {
  return rbGeneralNode(comparator, color, left, keyValue, right, false);
}

export function rbTombstone<K, V>(
    comparator: Comparator<K>,
    color: Color,
    left: RbTree<K, V>,
    keyValue: KeyValue<K, V>,
    right: RbTree<K, V>)
: RbNode<K, V> {
  return rbGeneralNode(comparator, color, left, keyValue, right, true);
}

export function rbGeneralNode<K, V>(
    comparator: Comparator<K>,
    color: Color,
    left: RbTree<K, V>,
    keyValue: KeyValue<K, V>,
    right: RbTree<K, V>,
    tombstone: boolean)
: RbNode<K, V> {
  const baseNode = searchGeneralNode(comparator, left, keyValue, right, tombstone);
  if (baseNode.keyValue === undefined) {
    throw "undefined node";
  }

  return {
    ...baseNode as StrictSearchNode<K, V>,
    color,
  } as RbNode<K, V>;
}

export function rbNodeFrom<K, V>(comparator: Comparator<K>, node: Omit<RbNode<K, V>, 'keyRange'>): RbNode<K, V> {
  const baseNode = searchNodeFrom(comparator, node);
  if (baseNode.keyValue === undefined) {
    throw "undefined node";
  }

  return {
    ...baseNode,
    color: node.color,
  };
}
