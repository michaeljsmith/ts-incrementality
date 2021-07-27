import { CacheContext, CacheReference } from "../../cache.js";
import { expect } from "chai";
import { mapReduce } from "./map-reduce.js";
import { natural as compare } from "../../comparison.js";
import { KeyValue, SearchNode, searchNode, searchTombstone, SearchTree } from "../search-tree/index.js";

function node(left: SearchTree<string, number>, keyValue: KeyValue<string, number>, right: SearchTree<string, number>): SearchNode<string, number> {
  return searchNode(compare(), left, keyValue, right);
}

function tombstone(left: SearchTree<string, number>, keyValue: KeyValue<string, number>, right: SearchTree<string, number>): SearchNode<string, number> {
  return searchTombstone(compare(), left, keyValue, right);
}

type CacheEntry<T, Args> = {
  args: Args,
  value: T,
};

function argsEqual<Args extends unknown[]>(left: Args, right: Args) {
  return left.every((x, i) => x === right[i]);
}

function cached<T, Args extends unknown[]>(
    parentCache: CacheContext, args: Args, evaluate: () => T): T {
  const rootCacheContext = parentCache('root');
  const previousCache = rootCacheContext.value as CacheEntry<T, Args>;

  if (previousCache !== undefined) {
    if (argsEqual(previousCache.args, args)) {
      return previousCache.value;
    }
  }

  const result = evaluate();
  rootCacheContext.value = {
    args,
    value: result,
  }
  return result;
}

let mapCount = 0;
function map(cache: CacheContext, inputKey: string, inputValue: number): number[] {
  return cached(cache, [inputKey, inputValue], () => {
    ++mapCount;
    return [inputValue];
  });
}

let reduceCount = 0;
function reduce(cache: CacheContext, left: number[], right: number[]): number[] {
  return cached(cache, [left, right], () => {
    ++reduceCount;
    return left.concat(right);
  });
}

function newCacheReference(): CacheReference {
  return {
    value: undefined,
  };
}

let cacheReference: CacheReference;

describe('map-reduce', function() {
  beforeEach(() => {
    mapCount = 0;
    reduceCount = 0;
    cacheReference = newCacheReference();
  });

  it('returns undefined for empty tree', function() {
    expect(mapReduce(cacheReference, null, compare(), map, reduce)).undefined;
  });

  it('maps singleton', function() {
    const tree = node(null, {key: 'a', value: 1}, null);
    expect(mapReduce(cacheReference, tree, compare(), map, reduce)).deep.equals([1]);
  });

  it('reduces with left child', function() {
    const tree = node(
      node(null, {key: 'a', value: 1}, null),
      {key: 'b', value: 2},
      null);
    expect(mapReduce(cacheReference, tree, compare(), map, reduce)).deep.equals([1, 2]);
  });

  it('reduces with right child', function() {
    const tree = node(
      null,
      {key: 'a', value: 1},
      node(null, {key: 'b', value: 2}, null));
    expect(mapReduce(cacheReference, tree, compare(), map, reduce)).deep.equals([1, 2]);
  });

  it('reduces with both children', function() {
    const tree = node(
      node(null, {key: 'a', value: 1}, null),
      {key: 'b', value: 2},
      node(null, {key: 'c', value: 3}, null));
    expect(mapReduce(cacheReference, tree, compare(), map, reduce)).deep.equals([1, 2, 3]);
  });

  it('ignores singleton tombstone', function() {
    const tree = tombstone(null, {key: 'a', value: 1}, null);
    expect(mapReduce(cacheReference, tree, compare(), map, reduce)).undefined;
  });

  it('ignores tombstone when reducing', function() {
    const tree = tombstone(
      node(null, {key: 'a', value: 1}, null),
      {key: 'b', value: 2},
      node(null, {key: 'c', value: 3}, null));
    expect(mapReduce(cacheReference, tree, compare(), map, reduce)).deep.equals([1, 3]);
  });

  it('caches tree', function() {
    const tree = node(
      node(null, {key: 'a', value: 1}, null),
      {key: 'b', value: 2},
      null);
    mapReduce(cacheReference, tree, compare(), map, reduce);
    expect(mapCount).equals(2);
    expect(reduceCount).equals(1);
    mapReduce(cacheReference, tree, compare(), map, reduce);
    expect(mapCount).equals(2);
  });

  it('re-evaluates tree', function() {
    const child = node(null, { key: 'a', value: 1 }, null);
    const tree1 = node(child, {key: 'b', value: 2}, null);
    mapReduce(cacheReference, tree1, compare(), map, reduce);
    expect(mapCount).equals(2);
    expect(reduceCount).equals(1);
    const tree2 = node(child, {key: 'b', value: 3}, null);
    expect(mapReduce(cacheReference, tree2, compare(), map, reduce)).deep.equals([1, 3]);
    expect(mapCount).equals(3);
    expect(reduceCount).equals(2);
  });

  it('re-evaluates after deletion', function() {
    const child = node(null, { key: 'a', value: 1 }, null);
    const tree1 = node(child, {key: 'b', value: 2}, null);
    mapReduce(cacheReference, tree1, compare(), map, reduce);
    expect(mapCount).equals(2);
    expect(reduceCount).equals(1);
    const tree2 = child;
    expect(mapReduce(cacheReference, tree2, compare(), map, reduce)).deep.equals([1]);
    expect(mapCount).equals(2);
    expect(reduceCount).equals(1);
  });

  it('re-evaluates after tombstone', function() {
    const child = node(null, { key: 'a', value: 1 }, null);
    const tree1 = node(child, {key: 'b', value: 2}, null);
    mapReduce(cacheReference, tree1, compare(), map, reduce);
    expect(mapCount).equals(2);
    expect(reduceCount).equals(1);
    const tree2 = tombstone(child, {key: 'b', value: 3}, null);
    expect(mapReduce(cacheReference, tree2, compare(), map, reduce)).deep.equals([1]);
    expect(mapCount).equals(2);
    expect(reduceCount).equals(1);
  });

  it('caches map', function() {
    const keyValue = { key: 'a', value: 1 };
    const tree1 = node(null, keyValue, null);
    mapReduce(cacheReference, tree1, compare(), map, reduce);
    expect(mapCount).equals(1);
    const tree2 = node(null, keyValue, null);
    mapReduce(cacheReference, tree2, compare(), map, reduce);
    expect(mapCount).equals(1);
  });

  it('caches reduce', function() {
    const mapResult: number[] = [];
    function mapToEmptyList(cache: CacheContext, key: string, value: number) {
      return mapResult;
    }

    const child = node(null, { key: 'a', value: 1 }, null);
    const tree1 = node(child, { key: 'b', value: 2 }, null);
    mapReduce(cacheReference, tree1, compare(), mapToEmptyList, reduce);
    expect(reduceCount).equals(1);
    const tree2 = node(child, { key: 'b', value: 3 }, null);
    mapReduce(cacheReference, tree2, compare(), mapToEmptyList, reduce);
    expect(reduceCount).equals(1);
  });
});
