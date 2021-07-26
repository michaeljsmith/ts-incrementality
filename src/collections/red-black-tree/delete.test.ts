import { expect } from "chai";
import { rbDelete } from "./delete.js";
import { Color, rbNode, rbTombstone, RbTree } from "./red-black-tree.js";
import { natural as compare } from "../../comparison.js";

function node(color: Color, left: RbTree<string, void>, key: string, right: RbTree<string, void>): RbTree<string, void> {
  return rbNode(compare(), color, left, {key, value: undefined}, right);
}

function tombstone(color: Color, left: RbTree<string, void>, key: string, right: RbTree<string, void>): RbTree<string, void> {
  return rbTombstone(compare(), color, left, {key, value: undefined}, right);
}

describe('red-black-tree', function() {
  describe('delete', function() {
    it('throws for empty tree', function() {
      expect(() => rbDelete(null, 'a', compare())).throws();
    });

    it('throws when item not found', function() {
      const original = node(Color.B, null, 'a', null);
      expect(() => rbDelete(original, 'b', compare())).throws();
    });

    it('throws when item already deleted', function() {
      const original = tombstone(Color.B, null, 'a', null);
      expect(() => rbDelete(original, 'a', compare())).throws();
    })

    it('recurses left', function() {
      const original = node(
        Color.B,
        node(Color.R, null, 'a', null),
        'b',
        null);
      expect(rbDelete(original, 'a', compare())).deep.equals(
        node(
          Color.B,
          tombstone(Color.R, null, 'a', null),
          'b',
          null));
    })

    it('deletes singleton', function() {
      const original = node(Color.B, null, 'a', null);
      expect(rbDelete(original, 'a', compare())).deep.equals(
        tombstone(Color.B, null, 'a', null));
    })

    it('recurses right', function() {
      const original = node(
        Color.B,
        null,
        'a',
        node(Color.R, null, 'b', null));
      expect(rbDelete(original, 'b', compare())).deep.equals(
        node(
          Color.B,
          null,
          'a',
          tombstone(Color.R, null, 'b', null)));
    })

    it('recurses past tombstone', function() {
      const original = tombstone(
        Color.B,
        null,
        'a',
        node(Color.R, null, 'b', null));
      expect(rbDelete(original, 'b', compare())).deep.equals(
        tombstone(
          Color.B,
          null,
          'a',
          tombstone(Color.R, null, 'b', null)));
    })
  });
});
