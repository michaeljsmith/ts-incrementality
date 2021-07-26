import { expect } from "chai";
import { max, min, natural, reverse } from "./comparison.js";

describe('comparison', function() {
  describe('natural', function() {
    it('compares equal', function() {
      expect(natural<string>()('a', 'a')).equals(0);
    });

    it('compares lt', function() {
      expect(natural<string>()('a', 'b')).equals(-1);
    });

    it('compares gt', function() {
      expect(natural<string>()('b', 'a')).equals(1);
    });
  });

  describe('reverse', function() {
    it('compares equal', function() {
      expect(reverse(natural<string>())('a', 'a')).equals(0);
    });

    it('compares lt', function() {
      expect(reverse(natural<string>())('b', 'a')).equals(-1);
    });

    it('compares gt', function() {
      expect(reverse(natural<string>())('a', 'b')).equals(1);
    });
  });

  describe('min', function() {
    it('computes min', function() {
      expect(min(natural<string>(), 'b', 'a', 'c')).equals('a');
    });
  });

  describe('max', function() {
    it('computes max', function() {
      expect(max(natural<string>(), 'b', 'a', 'c')).equals('c');
    });
  });
});
