import { expect } from "chai";
import { SearchTree } from "../search-tree/index.js";
import { find } from "./find.js";
import { natural as compare } from "../../comparison.js";
import { searchNode, searchTombstone } from "./search-tree.js";

function node(left: SearchTree<string, void>, key: string, right: SearchTree<string, void>): SearchTree<string, void> {
  return searchNode(compare(), left, {key, value: undefined as void}, right);
}

function tombstone(left: SearchTree<string, void>, key: string, right: SearchTree<string, void>): SearchTree<string, void> {
  return searchTombstone(compare(), left, {key, value: undefined as void}, right);
}

describe('red-black-tree', function() {
  describe('find', function() {
    it('returns undefined in empty tree', function() {
      expect(find(null, 'a', compare())).undefined;
    });

    it('returns undefined when item missing', function() {
      const tree = node(null, 'a', null);
      expect(find(null, 'b', compare())).undefined;
    });

    it('returns tombstone', function() {
      const tree = tombstone(null, 'a', null);
      expect(find(tree, 'a', compare())).deep.equals(
        tombstone(null, 'a', null));
    })

    it('recurses left', function() {
      const tree = node(
        node(null, 'a', null),
        'b',
        null);
      expect(find(tree, 'a', compare())).deep.equals(
        node(null, 'a', null));
    })

    it('finds singleton', function() {
      const tree = node(null, 'a', null);
      expect(find(tree, 'a', compare())).deep.equals(
        node(null, 'a', null));
    })

    it('recurses right', function() {
      const tree = node(
        null,
        'a',
        node(null, 'b', null));
      expect(find(tree, 'b', compare())).deep.equals(
        node(null, 'b', null));
    })

    it('recurses past tombstone', function() {
      const tree = tombstone(
        null,
        'a',
        node(null, 'b', null));
      expect(find(tree, 'b', compare())).deep.equals(
        node(null, 'b', null));
    })
  });
});
