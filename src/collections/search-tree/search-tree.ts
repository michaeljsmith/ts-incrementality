import { KeyRange } from "../key-range.js";
import { keyRangeEnclosing, pointKeyRange } from "../key-range.js";
import { Comparator } from "../../comparison.js";

export interface KeyValue<K, V> {
  key: K,
  value: V,
}

export interface SearchNode<K, V> {
  tombstone: boolean,
  keyRange: KeyRange<K>,

  left: SearchTree<K, V>,
  keyValue: KeyValue<K, V>,
  right: SearchTree<K, V>,
}

export type SearchTree<K, V> = SearchNode<K, V> | null;

export function searchNode<K, V, N extends SearchNode<K, V>>(
    comparator: Comparator<K>,
    left: N | null,
    keyValue: KeyValue<K, V>,
    right: N | null) {
  return searchGeneralNode(comparator, left, keyValue, right, false);
}

export function searchTombstone<K, V, N extends SearchNode<K, V>>(
    comparator: Comparator<K>,
    left: N | null,
    keyValue: KeyValue<K, V>,
    right: N | null) {
  return searchGeneralNode(comparator, left, keyValue, right, true);
}

export function searchGeneralNode<K, V, N extends SearchNode<K, V>>(
    comparator: Comparator<K>,
    left: N | null,
    keyValue: KeyValue<K, V>,
    right: N | null,
    tombstone: boolean) {
  return {
    tombstone,
    keyRange: keyRangeFor<K, V, N>(comparator, left, keyValue.key, right),
    left,
    keyValue,
    right,
  };
}

export function searchNodeFrom<K, V, N extends SearchNode<K, V>>(comparator: Comparator<K>, node: Omit<N, 'keyRange'>) {
  return {
    ...node,
    keyRange: keyRangeFor(comparator, node.left, node.keyValue.key, node.right),
  };
}

function keyRangeFor<K, V, N extends SearchNode<K, V>>(comparator: Comparator<K>, left: N | null, key: K, right: N | null) {
  let keyRange = pointKeyRange(key);
  keyRange = left === null ? keyRange : keyRangeEnclosing(comparator, keyRange, left.keyRange);
  keyRange = right === null ? keyRange : keyRangeEnclosing(comparator, keyRange, right.keyRange);
  return keyRange;
}
