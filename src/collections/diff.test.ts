import { expect } from "chai";
import { diff } from "./diff.js";
import { testing } from "./red-black-tree/index.js";

function compare(a: string, b: string) {
  return a < b ? -1 : (a > b ? 1 : 0);
}

describe('diff', function() {
  it('finds no differences for empty sets', function() {
    expect([...diff(null, null, compare)]).empty;
  });

  it('finds no differences for identical sets', function() {
    const orig = testing.node(null, {key: 'a', value: 1}, null);
    const dest = orig;
    expect([...diff(orig, dest, compare)]).empty;
  });

  it('finds no differences for equal singletons', function() {
    const orig = testing.node(null, {key: 'a', value: 1}, null);
    const dest = testing.node(null, {key: 'a', value: 1}, null);
    expect([...diff(orig, dest, compare)]).empty;
  });

  it('finds addition in singleton', function() {
    const orig = null;
    const dest = testing.node(null, {key: 'a', value: 1}, null);
    expect([...diff(orig, dest, compare)]).deep.equals([{
      diffType: 'insertion',
      key: 'a',
      value: 1,
    }]);
  });

  it('finds addition in singleton, replacing tombstone', function() {
    const orig = testing.tombstone(null, {key: 'a', value: 1}, null);
    const dest = testing.node(null, {key: 'a', value: 1}, null);
    expect([...diff(orig, dest, compare)]).deep.equals([{
      diffType: 'insertion',
      key: 'a',
      value: 1,
    }]);
  });

  it('finds update in singleton', function() {
    const orig = testing.node(null, {key: 'a', value: 1}, null);
    const dest = testing.node(null, {key: 'a', value: 2}, null);
    expect([...diff(orig, dest, compare)]).deep.equals([{
      diffType: 'update',
      key: 'a',
      value: 2,
    }]);
  });

  it('finds deletion in singleton', function() {
    const orig = testing.node(null, {key: 'a', value: 1}, null);
    const dest = null;
    expect([...diff(orig, dest, compare)]).deep.equals([{
      diffType: 'deletion',
      key: 'a',
    }]);
  });

  it('finds deletion in singleton, becoming tombstone', function() {
    const orig = testing.node(null, {key: 'a', value: 1}, null);
    const dest = testing.tombstone(null, {key: 'a', value: 1}, null);
    expect([...diff(orig, dest, compare)]).deep.equals([{
      diffType: 'deletion',
      key: 'a',
    }]);
  });

  it('finds insertion to left', function() {
    const orig = testing.node(null, {key: 'b', value: 2}, null);
    const dest = testing.node(
      testing.node(null, {key: 'a', value: 1}, null),
      {key: 'b', value: 2},
      null);
    expect([...diff(orig, dest, compare)]).deep.equals([{
      diffType: 'insertion',
      key: 'a',
      value: 1,
    }]);
  });

  it('finds insertion to right', function() {
    const orig = testing.node(null, {key: 'a', value: 1}, null);
    const dest = testing.node(
      null,
      {key: 'a', value: 1},
      testing.node(null, {key: 'b', value: 2}, null));
    expect([...diff(orig, dest, compare)]).deep.equals([{
      diffType: 'insertion',
      key: 'b',
      value: 2,
    }]);
  });

  it('finds deletion to left', function() {
    const orig = testing.node(
      testing.node(null, {key: 'a', value: 1}, null),
      {key: 'b', value: 2},
      null);
    const dest = testing.node(null, {key: 'b', value: 2}, null);
    expect([...diff(orig, dest, compare)]).deep.equals([{
      diffType: 'deletion',
      key: 'a',
    }]);
  });

  it('finds deletion to right', function() {
    const orig = testing.node(
      null,
      {key: 'a', value: 1},
      testing.node(null, {key: 'b', value: 2}, null));
    const dest = testing.node(null, {key: 'a', value: 1}, null);
    expect([...diff(orig, dest, compare)]).deep.equals([{
      diffType: 'deletion',
      key: 'b',
    }]);
  });

  it('finds multiple diffs', function() {
    const orig = testing.node(
      testing.node(null, {key: 'a', value: 1}, null),
      {key: 'b', value: 2},
      null);
    const dest = testing.node(
      null,
      {key: 'b', value: 2},
      testing.node(null, {key: 'c', value: 3}, null));
    expect([...diff(orig, dest, compare)]).deep.equals([{
      diffType: 'deletion',
      key: 'a',
    }, {
      diffType: 'insertion',
      key: 'c',
      value: 3,
    }]);
  });
});
