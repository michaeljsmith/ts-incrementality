export interface KeyValue<K, V> {
  key: K,
  value: V,
}

export interface SearchNode<K, V> {
  tombstone: boolean,
  left: SearchTree<K, V>,
  keyValue: KeyValue<K, V>,
  right: SearchTree<K, V>,
}

export type SearchTree<K, V> = SearchNode<K, V> | null;

export function searchNode<K, V, N extends SearchNode<K, V>>(left: N | null, keyValue: KeyValue<K, V>, right: N | null) {
  return searchGeneralNode(left, keyValue, right, false);
}

export function searchTombstone<K, V, N extends SearchNode<K, V>>(left: N | null, keyValue: KeyValue<K, V>, right: N | null) {
  return searchGeneralNode(left, keyValue, right, true);
}

export function searchGeneralNode<K, V, N extends SearchNode<K, V>>(left: N | null, keyValue: KeyValue<K, V>, right: N | null, tombstone: boolean) {
  return {
    tombstone,
    left,
    keyValue,
    right,
  };
}
