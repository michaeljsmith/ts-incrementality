import { expect } from "chai";
import { rbFind } from "./find.js";
import { Color, RbTree } from "./tree.js";

function compare(a: string, b: string) {
  return a < b ? -1 : (a > b ? 1 : 0);
}

function node<K>(color: Color, left: RbTree<K, void>, key: K, right: RbTree<K, void>): RbTree<K, void> {
  return {color, tombstone: false, left, keyValue: {key, value: undefined}, right};
}

function tombstone<K>(color: Color, left: RbTree<K, void>, key: K, right: RbTree<K, void>): RbTree<K, void> {
  return {color, tombstone: true, left, keyValue: {key, value: undefined}, right};
}

describe('red-black-tree', function() {
  describe('find', function() {
    it('returns undefined in empty tree', function() {
      expect(rbFind(null, 'a', compare)).undefined;
    });

    it('returns undefined when item missing', function() {
      const tree = node(Color.B, null, 'a', null);
      expect(rbFind(null, 'b', compare)).undefined;
    });

    it('returns tombstone', function() {
      const tree = tombstone(Color.B, null, 'a', null);
      expect(rbFind(tree, 'a', compare)).deep.equals(
        tombstone(Color.B, null, 'a', null));
    })

    it('recurses left', function() {
      const tree = node(
        Color.B,
        node(Color.R, null, 'a', null),
        'b',
        null);
      expect(rbFind(tree, 'a', compare)).deep.equals(
        node(Color.R, null, 'a', null));
    })

    it('finds singleton', function() {
      const tree = node(Color.B, null, 'a', null);
      expect(rbFind(tree, 'a', compare)).deep.equals(
        node(Color.B, null, 'a', null));
    })

    it('recurses right', function() {
      const tree = node(
        Color.B,
        null,
        'a',
        node(Color.R, null, 'b', null));
      expect(rbFind(tree, 'b', compare)).deep.equals(
        node(Color.R, null, 'b', null));
    })

    it('recurses past tombstone', function() {
      const tree = tombstone(
        Color.B,
        null,
        'a',
        node(Color.R, null, 'b', null));
      expect(rbFind(tree, 'b', compare)).deep.equals(
        node(Color.R, null, 'b', null));
    })
  });
});
