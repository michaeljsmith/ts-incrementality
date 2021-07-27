import { expect } from "chai";
import { findEnclosing } from "./find-enclosing.js";
import { natural as compare } from "../../comparison.js";
import { searchNode, SearchTree } from "./search-tree.js";

function node(left: SearchTree<string, void>, key: string, right: SearchTree<string, void>): SearchTree<string, void> {
  return searchNode(compare(), left, {key, value: undefined as void}, right);
}

describe('search-tree', function() {
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
