// import { Cache, CacheReference } from "../cache.js";
// import { mapReduce } from "./map-reduce/map-reduce.js";

// export function filter<K, V>(
//     cacheReference: CacheReference,
//     tree: RbTree<K, V>,
//     comparator: RbComparator<K>,
//     predicate: (cache: Cache, key: K, value: V) => boolean)
// : RbTree<K, V> {
//   return mapReduce(cacheReference, tree, comparator,
//     (cache: Cache, key: K, value: V) => predicate(cacheReference) ? rbInsert(null, {key, value}, comparator));
// }
