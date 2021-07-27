import { natural as compare } from "../comparison.js";
import { expect } from "chai";
import { keyRangeEncloses, keyRangeEnclosing, pointKeyRange } from "./key-range.js";

describe('key-range', function() {
  describe('pointKeyRange', function() {
    it('computes enclosing range', function() {
      expect(pointKeyRange(2)).deep.equals({min: 2, max: 2});
    });
  });

  describe('keyRangeEnclosing', function() {
    it('computes enclosing range', function() {
      expect(keyRangeEnclosing(compare(), {
        min: 1, max: 2}, {min: 3, max: 4})).deep.equals({
          min: 1, max: 4});
    });
  });

  describe('keyRangeEncloses', function() {
    it('detects enclosing, low boundary', function() {
      expect(keyRangeEncloses(compare(), {min: 1, max: 3}, {min: 1, max: 2})).true;
    });

    it('detects enclosing, high boundary', function() {
      expect(keyRangeEncloses(compare(), {min: 1, max: 3}, {min: 2, max: 3})).true;
    });

    it('detects enclosing, point range', function() {
      expect(keyRangeEncloses(compare(), {min: 1, max: 1}, {min: 1, max: 1})).true;
    });

    it('detects not enclosing, low boundary', function() {
      expect(keyRangeEncloses(compare(), {min: 1, max: 3}, {min: 0, max: 2})).false;
    });

    it('detects not enclosing, high boundary', function() {
      expect(keyRangeEncloses(compare(), {min: 1, max: 3}, {min: 2, max: 4})).false;
    });
  });
});
