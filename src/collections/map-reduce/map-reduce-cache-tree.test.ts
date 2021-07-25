import { expect } from "chai";
import { find, MapReduceCacheNode, MapReduceCacheTree } from "./map-reduce-cache-tree.js";

function node(
    left: MapReduceCacheTree<string, void, number>,
    key: string,
    right: MapReduceCacheTree<string, void, number>)
: MapReduceCacheNode<string, void, number> {
  return {
    left,
    key: key,
    inputTree: null,
    nodeOutput: 1,
    treeOutput: 1,
    right,
  };
}

function compare(a: string, b: string) {
  return a < b ? -1 : (a > b ? 1 : 0);
}

describe('map-reduce-cache-tree', function() {
  describe('find', function() {
    it('returns undefined for empty tree', function() {
      expect(find(null, 'a', compare)).undefined;
    });

    it('returns undefined when item missing', function() {
      const origin = node(null, 'a', null);
      expect(find(origin, 'b', compare)).undefined;
    });

    it('finds in singleton', function() {
      const origin = node(
        null,
        'a',
        null);
      expect(find(origin, 'a', compare)).deep.equals(
        node(null, 'a', null));
    });

    it('recurses left', function() {
      const origin = node(
        node(null, 'a', null),
        'b',
        null);
      expect(find(origin, 'a', compare)).deep.equals(
        node(null, 'a', null));
    });

    it('recurses right', function() {
      const origin = node(
        null,
        'a',
        node(null, 'b', null));
      expect(find(origin, 'b', compare)).deep.equals(
        node(null, 'b', null));
    });
  });
});
