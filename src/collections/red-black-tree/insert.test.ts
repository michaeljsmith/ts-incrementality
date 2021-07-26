import { expect } from "chai";
import { KeyValue } from "../search-tree/index.js";
import { rbInsert } from "./insert.js";
import { Color, RbNode, RbTree } from "./tree.js";
import { natural as compare } from "../../comparison.js";

function node<K>(color: Color, left: RbTree<K, void>, key: K, right: RbTree<K, void>): RbNode<K, void> {
  return {color, tombstone: false, left, keyValue: {key, value: undefined}, right};
}

function tombstone(color: Color, left: RbTree<string, void>, right: RbTree<string, void>): RbNode<string, void> {
  return {color, tombstone: true, left, keyValue: {key: '', value: undefined}, right};
}

function keyValue<K>(key: K): KeyValue<K, void> {
  return {key, value: undefined};
}

describe('red-black-tree', function() {
  describe('insert', function() {
    it('inserts into empty tree', function() {
      expect(rbInsert(null, keyValue('a'), compare())).deep.equals(node(Color.B, null, 'a', null));
    })

    it('inserts to left', function() {
      const original = node(Color.B, null, 'b', null);
      const final = rbInsert(original, keyValue('a'), compare());
      expect(final).deep.equals(
        node(
          Color.B,
          node(Color.R, null, 'a', null),
          'b',
          null));
    });

    it('inserts to right', function() {
      const original = node(Color.B, null, 'a', null);
      const final = rbInsert(original, keyValue('b'), compare());
      expect(final).deep.equals(
        node(
          Color.B,
          null,
          'a',
          node(Color.R, null, 'b', null)));
    });

    it('inserts into tree when no balancing required', function() {
      const original = node(
        Color.B,
        node(Color.R, null, 'a', null),
        'b',
        null);
      const final = rbInsert(original, keyValue('c'), compare());
      expect(final).deep.equals(
        node(
          Color.B,
          node(Color.R, null, 'a', null),
          'b',
          node(Color.R, null, 'c', null)));
    });

    it('rebalances left-left', function() {
      const original = node(
        Color.B,
        node(Color.R, null, 'b', null),
        'c',
        null);
      const final = rbInsert(original, keyValue('a'), compare());
      expect(final).deep.equals(
        node(
          Color.B,
          node(Color.B, null, 'a', null),
          'b',
          node(Color.B, null, 'c', null)));
    });

    it('rebalances left-right', function() {
      const original = node(
        Color.B,
        node(Color.R, null, 'a', null),
        'c',
        null);
      const final = rbInsert(original, keyValue('b'), compare());
      expect(final).deep.equals(
        node(
          Color.B,
          node(Color.B, null, 'a', null),
          'b',
          node(Color.B, null, 'c', null)));
    });

    it('rebalances right-left', function() {
      const original = node(
        Color.B,
        null,
        'a',
        node(Color.R, null, 'c', null));
      const final = rbInsert(original, keyValue('b'), compare());
      expect(final).deep.equals(
        node(
          Color.B,
          node(Color.B, null, 'a', null),
          'b',
          node(Color.B, null, 'c', null)));
    });

    it('rebalances right-right', function() {
      const original = node(
        Color.B,
        null,
        'a',
        node(Color.R, null, 'b', null));
      const final = rbInsert(original, keyValue('c'), compare());
      expect(final).deep.equals(
        node(
          Color.B,
          node(Color.B, null, 'a', null),
          'b',
          node(Color.B, null, 'c', null)));
    });

    it('replaces existing item', function() {
      const original = {
        color: Color.B,
        tombstone: false,
        left: null,
        keyValue: {key: 'a', value: 1},
        right: {
          color: Color.R,
          tombstone: false,
          left: null,
          keyValue: {key: 'b', value: 1},
          right: null
        }
      };
      const final = rbInsert(original, {key: 'b', value: 2}, compare());
      expect(final).deep.equals({
        color: Color.B,
        tombstone: false,
        left: null,
        keyValue: {key: 'a', value: 1},
        right: {
          color: Color.R,
          tombstone: false,
          left: null,
          keyValue: {key: 'b', value: 2},
          right: null
        }
      });
    });

    it('replaces singleton tombstone', function() {
      const original = tombstone(
        Color.B,
        null,
        null);
      const final = rbInsert(original, keyValue('a'), compare());
      expect(final).deep.equals(
        node(
          Color.B,
          null,
          'a',
          null));
    });

    it('replaces root tombstone in graveyard', function() {
      const original = tombstone(
        Color.B,
        tombstone(Color.B, null, null),
        tombstone(Color.B, null, null));
      const final = rbInsert(original, keyValue('a'), compare());
      expect(final).deep.equals(
        node(
          Color.B,
          tombstone(Color.B, null, null),
          'a',
          tombstone(Color.B, null, null)));
    });

    it('recurses right past tombstone when left present', function() {
      const original = tombstone(
        Color.B,
        node(Color.B, null, 'a', null),
        node(Color.B, null, 'b', null));
      const final = rbInsert(original, keyValue('c'), compare());
      expect(final).deep.equals(
        tombstone(
          Color.B,
          node(Color.B, null, 'a', null),
          node(
            Color.B,
            null,
            'b',
            node(Color.R, null, 'c', null))));
    });

    it('recurses right past tombstone when left missing', function() {
      const original = tombstone(
        Color.B,
        tombstone(Color.B, null, null),
        node(Color.B, null, 'b', null));
      const final = rbInsert(original, keyValue('c'), compare());
      expect(final).deep.equals(
        tombstone(
          Color.B,
          tombstone(Color.B, null, null),
          node(
            Color.B,
            null,
            'b',
            node(Color.R, null, 'c', null))));
    });

    it('recurses left past tombstone when right present', function() {
      const original = tombstone(
        Color.B,
        node(Color.B, null, 'b', null),
        node(Color.B, null, 'c', null));
      const final = rbInsert(original, keyValue('a'), compare());
      expect(final).deep.equals(
        tombstone(
          Color.B,
          node(
            Color.B,
            node(Color.R, null, 'a', null),
            'b',
            null),
          node(Color.B, null, 'c', null)));
    });

    it('recurses left past tombstone when right missing', function() {
      const original = tombstone(
        Color.B,
        node(Color.B, null, 'b', null),
        tombstone(Color.B, null, null));
      const final = rbInsert(original, keyValue('a'), compare());
      expect(final).deep.equals(
        tombstone(
          Color.B,
          node(
            Color.B,
            node(Color.R, null, 'a', null),
            'b',
            null),
          tombstone(Color.B, null, null)));
    });
  });
});
