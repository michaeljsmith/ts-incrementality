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

export function searchNode<K, V>(left: SearchTree<K, V>, keyValue: KeyValue<K, V>, right: SearchTree<K, V>): SearchNode<K, V> {
  return {
    tombstone: false,
    left,
    keyValue,
    right,
  };
}

export function searchTombstone<K, V>(left: SearchTree<K, V>, keyValue: KeyValue<K, V>, right: SearchTree<K, V>): SearchNode<K, V> {
  return {
    tombstone: true,
    left,
    keyValue,
    right,
  };
}
