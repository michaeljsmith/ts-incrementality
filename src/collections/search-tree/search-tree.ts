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


