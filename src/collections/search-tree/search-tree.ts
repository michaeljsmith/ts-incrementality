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
  keyValue?: KeyValue<K, V>,
  right: SearchTree<K, V>,
}

export type SearchTree<K, V> = SearchNode<K, V> | null;

export interface StrictSearchNode<K, V> extends SearchNode<K, V> {
  left: StrictSearchTree<K, V>,
  keyValue: KeyValue<K, V>,
  right: StrictSearchTree<K, V>,
}

export type StrictSearchTree<K, V> = StrictSearchNode<K, V> | null;

export function searchNode<K, V, N extends SearchNode<K, V>>(
    comparator: Comparator<K>,
    left: N | null,
    keyValue: KeyValue<K, V> | undefined,
    right: N | null) {
  return searchGeneralNode(comparator, left, keyValue, right, false);
}

export function searchTombstone<K, V, N extends SearchNode<K, V>>(
    comparator: Comparator<K>,
    left: N | null,
    keyValue: KeyValue<K, V> | undefined,
    right: N | null) {
  return searchGeneralNode(comparator, left, keyValue, right, true);
}

export function searchGeneralNode<K, V, N extends SearchNode<K, V>>(
    comparator: Comparator<K>,
    left: N | null,
    keyValue: KeyValue<K, V> | undefined,
    right: N | null,
    tombstone: boolean) {
  checkKeyRanges<K, V, N>(left, keyValue?.key, right);

  return {
    tombstone,
    keyRange: keyRangeFor<K, V, N>(comparator, left, keyValue?.key, right),
    left,
    keyValue,
    right,
  };
}

export function searchNodeFrom<K, V, N extends StrictSearchNode<K, V>>(comparator: Comparator<K>, node: Omit<N, 'keyRange'>) {
  checkKeyRanges(node.left, node.keyValue?.key, node.right);
  return {
    ...node,
    keyRange: keyRangeFor(comparator, node.left, node.keyValue.key, node.right),
  };
}

function keyRangeFor<K, V, N extends SearchNode<K, V>>(comparator: Comparator<K>, left: N | null, key: K | undefined, right: N | null): KeyRange<K> {
  let keyRange = key === undefined ? undefined : pointKeyRange(key);
  keyRange = maybeKeyRangeEnclosing(comparator, keyRange, left?.keyRange);
  keyRange = maybeKeyRangeEnclosing(comparator, keyRange, right?.keyRange);
  if (keyRange === undefined) {
    throw "no range for completely null node";
  }
  return keyRange;
}

function maybeKeyRangeEnclosing<K>(comparator: Comparator<K>, a: KeyRange<K> | undefined, b: KeyRange<K> | undefined): KeyRange<K> | undefined {
  if (a !== undefined && b !== undefined) {
    return keyRangeEnclosing(comparator, a, b);
  }

  return a !== undefined ? a : b;
}

function checkKeyRanges<K, V, N extends SearchNode<K, V>>(left: N | null, key: K | undefined, right: N | null) {
  if (left === null && key === undefined && right === null) {
    throw "completely null node";
  }
  if (left !== null && key !== undefined && left.keyRange.max >= key) {
    throw 'left range invalid';
  }
  if (right !== null && key !== undefined && right.keyRange.min <= key) {
    throw 'right range invalid';
  }
}
