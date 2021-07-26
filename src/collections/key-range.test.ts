import { natural as compare } from "../comparison.js";
import { expect } from "chai";
import { keyRangeEnclosing, pointKeyRange } from "./key-range.js";

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
});
