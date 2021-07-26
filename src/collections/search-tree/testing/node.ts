import { KeyValue, SearchNode, SearchTree } from "../search-tree.js";

export function node<K, V>(left: SearchTree<K, V>, keyValue: KeyValue<K, V>, right: SearchTree<K, V>): SearchNode<K, V> {
  return {
    tombstone: false,
    left,
    keyValue,
    right,
  };
}

export function tombstone<K, V>(left: SearchTree<K, V>, keyValue: KeyValue<K, V>, right: SearchTree<K, V>): SearchNode<K, V> {
  return {
    tombstone: true,
    left,
    keyValue,
    right,
  };
}
