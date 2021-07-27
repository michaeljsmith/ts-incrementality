import { expect } from "chai";
import { find, findEnclosing, MapReduceCacheNode, MapReduceCacheTree } from "./map-reduce-cache-tree.js";
import { natural as compare } from "../../comparison.js";
import { searchNode } from "../search-tree/search-tree.js";

function node(
    left: MapReduceCacheTree<string, void, number>,
    key: string,
    right: MapReduceCacheTree<string, void, number>)
: MapReduceCacheNode<string, void, number> {
  return {
    mapCache: {},
    reduceCacheLeft: {},
    reduceCacheRight: {},
    left,
    key: key,
    inputTree: searchNode(compare(), left?.inputTree ?? null, {key, value: undefined as void}, right?.inputTree ?? null),
    nodeOutput: 1,
    treeOutput: 1,
    right,
  };
}

describe('map-reduce-cache-tree', function() {
  describe('find', function() {
    it('returns undefined for empty tree', function() {
      expect(find(null, 'a', compare())).undefined;
    });

    it('returns undefined when item missing', function() {
      const origin = node(null, 'a', null);
      expect(find(origin, 'b', compare())).undefined;
    });

    it('finds in singleton', function() {
      const origin = node(
        null,
        'a',
        null);
      expect(find(origin, 'a', compare())).deep.equals(
        node(null, 'a', null));
    });

    it('recurses left', function() {
      const origin = node(
        node(null, 'a', null),
        'b',
        null);
      expect(find(origin, 'a', compare())).deep.equals(
        node(null, 'a', null));
    });

    it('recurses right', function() {
      const origin = node(
        null,
        'a',
        node(null, 'b', null));
      expect(find(origin, 'b', compare())).deep.equals(
        node(null, 'b', null));
    });
  });

  describe('findEnclosing', function() {
    it('returns null for empty tree', function() {
      expect(findEnclosing(null, {min: 'a', max: 'b'}, compare())).null;
    });

    it('returns root for singleton', function() {
      const tree = node(null, 'a', null);
      expect(findEnclosing(tree, {min: 'a', max: 'b'}, compare())).deep.equals(tree);
    });

    it('recurses left', function() {
      const tree = node(
        node(null, 'a', null),
        'b',
        null);
      expect(findEnclosing(tree, {min: 'a', max: 'a'}, compare())).deep.equals(node(null, 'a', null));
    });

    it('recurses right', function() {
      const tree = node(
        null,
        'a',
        node(null, 'b', null));
      expect(findEnclosing(tree, {min: 'b', max: 'b'}, compare())).deep.equals(node(null, 'b', null));
    });
  });
});
