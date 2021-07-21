import { expect } from "chai";
import { insert } from "./insert.js";
import { Color, RbTree } from "./tree.js";

function compare(a: string, b: string) {
  return a < b ? -1 : (a > b ? 1 : 0);
}

function node<T>(color: Color, left: RbTree<T>, value: T, right: RbTree<T>) {
  return {color, left, value, right};
}

describe('red-black-tree', function() {
  describe('insert', function() {
    it('inserts into empty tree', function() {
      expect(insert(null, 'a', compare)).deep.equals(node(Color.B, null, 'a', null));
    })

    it('inserts to left', function() {
      const original = node(Color.B, null, 'b', null);
      const final = insert(original, 'a', compare);
      expect(final).deep.equals(
        node(
          Color.B,
          node(Color.R, null, 'a', null),
          'b',
          null));
    });

    it('inserts to right', function() {
      const original = node(Color.B, null, 'a', null);
      const final = insert(original, 'b', compare);
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
      const final = insert(original, 'c', compare);
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
      const final = insert(original, 'a', compare);
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
      const final = insert(original, 'b', compare);
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
      const final = insert(original, 'b', compare);
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
      const final = insert(original, 'c', compare);
      expect(final).deep.equals(
        node(
          Color.B,
          node(Color.B, null, 'a', null),
          'b',
          node(Color.B, null, 'c', null)));
    });

    it('replaces existing item', function() {
      type Entry = {key: string, value: number};
      const compareKey = (a: Entry, b: Entry) => compare(a.key, b.key);
      const entry = (key: string, value: number) => ({key, value,});

      const original = node(
        Color.B,
        null,
        entry('a', 1),
        node(Color.R, null, entry('b', 1), null));
      const final = insert(original, entry('b', 2), compareKey);
      expect(final).deep.equals(
        node(
          Color.B,
          null,
          entry('a', 1),
          node(Color.R, null, entry('b', 2), null)));
    });
  });
});
