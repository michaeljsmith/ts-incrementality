import { expect } from "chai";
import { SearchTree } from "../search-tree/index.js";
import { find } from "./find.js";

function compare(a: string, b: string) {
  return a < b ? -1 : (a > b ? 1 : 0);
}

function node<K>(left: SearchTree<K, void>, key: K, right: SearchTree<K, void>): SearchTree<K, void> {
  return {tombstone: false, left, keyValue: {key, value: undefined}, right};
}

function tombstone<K>(left: SearchTree<K, void>, key: K, right: SearchTree<K, void>): SearchTree<K, void> {
  return {tombstone: true, left, keyValue: {key, value: undefined}, right};
}

describe('red-black-tree', function() {
  describe('find', function() {
    it('returns undefined in empty tree', function() {
      expect(find(null, 'a', compare)).undefined;
    });

    it('returns undefined when item missing', function() {
      const tree = node(null, 'a', null);
      expect(find(null, 'b', compare)).undefined;
    });

    it('returns tombstone', function() {
      const tree = tombstone(null, 'a', null);
      expect(find(tree, 'a', compare)).deep.equals(
        tombstone(null, 'a', null));
    })

    it('recurses left', function() {
      const tree = node(
        node(null, 'a', null),
        'b',
        null);
      expect(find(tree, 'a', compare)).deep.equals(
        node(null, 'a', null));
    })

    it('finds singleton', function() {
      const tree = node(null, 'a', null);
      expect(find(tree, 'a', compare)).deep.equals(
        node(null, 'a', null));
    })

    it('recurses right', function() {
      const tree = node(
        null,
        'a',
        node(null, 'b', null));
      expect(find(tree, 'b', compare)).deep.equals(
        node(null, 'b', null));
    })

    it('recurses past tombstone', function() {
      const tree = tombstone(
        null,
        'a',
        node(null, 'b', null));
      expect(find(tree, 'b', compare)).deep.equals(
        node(null, 'b', null));
    })
  });
});
