import { Color, RBKeyValue, RbNode, RbTree } from "../tree.js";

export function node<K, V>(left: RbTree<K, V>, keyValue: RBKeyValue<K, V>, right: RbTree<K, V>): RbNode<K, V> {
  return {
    color: Color.B,
    tombstone: false,
    left,
    keyValue,
    right,
  };
}

export function tombstone<K, V>(left: RbTree<K, V>, keyValue: RBKeyValue<K, V>, right: RbTree<K, V>): RbNode<K, V> {
  return {
    color: Color.B,
    tombstone: true,
    left,
    keyValue,
    right,
  };
}
