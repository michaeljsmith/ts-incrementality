import { CacheReference } from "../../cache.js";
import { expect } from "chai";
import { KeyValue } from "../collection.js";
import { mapReduce } from "./map-reduce.js";
import { testing } from "../red-black-tree/index.js";

function compare(a: string, b: string) {
  return a < b ? -1 : (a > b ? 1 : 0);
}

type Cache<T, Args> = {
  args?: Args,
  value?: T,
};

function argsEqual<Args extends unknown[]>(left: Args, right: Args) {
  return left.every((x, i) => x === right[i]);
}

function cache<T, Args extends unknown[]>(
    cacheReference: CacheReference, args: Args, evaluate: () => T): T {
  const cache = cacheReference.getOrCreate(() => ({} as Cache<T, Args>));

  if (cache.args !== undefined && cache.value !== undefined) {
    if (argsEqual(cache.args, args)) {
      return cache.value;
    }
  }

  const result = evaluate();
  cache.args = args;
  cache.value = result;
  return result;
}

let mapCount = 0;
function map(cacheReference: CacheReference, inputKey: string, inputValue: number): number[] {
  return cache(cacheReference, [inputKey, inputValue], () => {
    ++mapCount;
    return [inputValue];
  });
}

let reduceCount = 0;
function reduce(cacheReference: CacheReference, left: number[], right: number[]): number[] {
  return cache(cacheReference, [left, right], () => {
    ++reduceCount;
    return left.concat(right);
  });
}

function newCacheReference(): CacheReference {
  let cache: unknown = undefined;
  return {
    getOrCreate<T>(init: () => T): T {
      if (cache === undefined) {
        cache = init();
      }

      return cache as T;
    }
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
    expect(mapReduce(cacheReference, null, compare, map, reduce)).undefined;
  });

  it('maps singleton', function() {
    const tree = testing.node(null, {key: 'a', value: 1}, null);
    expect(mapReduce(cacheReference, tree, compare, map, reduce)).deep.equals([1]);
  });

  it('reduces with left child', function() {
    const tree = testing.node(
      testing.node(null, {key: 'a', value: 1}, null),
      {key: 'b', value: 2},
      null);
    expect(mapReduce(cacheReference, tree, compare, map, reduce)).deep.equals([1, 2]);
  });

  it('reduces with right child', function() {
    const tree = testing.node(
      null,
      {key: 'a', value: 1},
      testing.node(null, {key: 'b', value: 2}, null));
    expect(mapReduce(cacheReference, tree, compare, map, reduce)).deep.equals([1, 2]);
  });

  it('reduces with both children', function() {
    const tree = testing.node(
      testing.node(null, {key: 'a', value: 1}, null),
      {key: 'b', value: 2},
      testing.node(null, {key: 'c', value: 3}, null));
    expect(mapReduce(cacheReference, tree, compare, map, reduce)).deep.equals([1, 2, 3]);
  });

  it('ignores singleton tombstone', function() {
    const tree = testing.tombstone(null, {key: 'a', value: 1}, null);
    expect(mapReduce(cacheReference, tree, compare, map, reduce)).undefined;
  });

  it('ignores tombstone when reducing', function() {
    const tree = testing.tombstone(
      testing.node(null, {key: 'a', value: 1}, null),
      {key: 'b', value: 2},
      testing.node(null, {key: 'c', value: 3}, null));
    expect(mapReduce(cacheReference, tree, compare, map, reduce)).deep.equals([1, 3]);
  });

  it('caches tree', function() {
    const tree = testing.node(
      testing.node(null, {key: 'a', value: 1}, null),
      {key: 'b', value: 2},
      null);
    mapReduce(cacheReference, tree, compare, map, reduce);
    expect(mapCount).equals(2);
    expect(reduceCount).equals(1);
    mapReduce(cacheReference, tree, compare, map, reduce);
    expect(mapCount).equals(2);
  });

  it('re-evaluates tree', function() {
    const child = testing.node(null, { key: 'a', value: 1 }, null);
    const tree1 = testing.node(child, {key: 'b', value: 2}, null);
    mapReduce(cacheReference, tree1, compare, map, reduce);
    expect(mapCount).equals(2);
    expect(reduceCount).equals(1);
    const tree2 = testing.node(child, {key: 'b', value: 3}, null);
    expect(mapReduce(cacheReference, tree2, compare, map, reduce)).deep.equals([1, 3]);
    expect(mapCount).equals(3);
    expect(reduceCount).equals(2);
  });

  it('re-evaluates after deletion', function() {
    const child = testing.node(null, { key: 'a', value: 1 }, null);
    const tree1 = testing.node(child, {key: 'b', value: 2}, null);
    mapReduce(cacheReference, tree1, compare, map, reduce);
    expect(mapCount).equals(2);
    expect(reduceCount).equals(1);
    const tree2 = child;
    expect(mapReduce(cacheReference, tree2, compare, map, reduce)).deep.equals([1]);
    expect(mapCount).equals(2);
    expect(reduceCount).equals(1);
  });

  it('re-evaluates after tombstone', function() {
    const child = testing.node(null, { key: 'a', value: 1 }, null);
    const tree1 = testing.node(child, {key: 'b', value: 2}, null);
    mapReduce(cacheReference, tree1, compare, map, reduce);
    expect(mapCount).equals(2);
    expect(reduceCount).equals(1);
    const tree2 = testing.tombstone(child, {key: 'b', value: 3}, null);
    expect(mapReduce(cacheReference, tree2, compare, map, reduce)).deep.equals([1]);
    expect(mapCount).equals(2);
    expect(reduceCount).equals(1);
  });

  it('caches map', function() {
    const keyValue = { key: 'a', value: 1 };
    const tree1 = testing.node(null, keyValue, null);
    mapReduce(cacheReference, tree1, compare, map, reduce);
    expect(mapCount).equals(1);
    const tree2 = testing.node(null, keyValue, null);
    mapReduce(cacheReference, tree2, compare, map, reduce);
    expect(mapCount).equals(1);
  });

  it('caches reduce', function() {
    const mapResult: number[] = [];
    function mapToEmptyList(cacheReference: CacheReference, key: string, value: number) {
      return mapResult;
    }

    const child = testing.node(null, { key: 'a', value: 1 }, null);
    const tree1 = testing.node(child, { key: 'b', value: 2 }, null);
    mapReduce(cacheReference, tree1, compare, mapToEmptyList, reduce);
    expect(reduceCount).equals(1);
    const tree2 = testing.node(child, { key: 'b', value: 3 }, null);
    mapReduce(cacheReference, tree2, compare, mapToEmptyList, reduce);
    expect(reduceCount).equals(1);
  });
});
