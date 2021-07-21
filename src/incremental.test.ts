import { expect } from "chai";
import { incremental } from "./incremental.js";
import { host } from "./host.js";

type FullName = {
  first: string;
  second: string;
};

let nodesExecuted = 0;

const totalNameLength = incremental(cache =>
  (fullName: FullName) => {
    ++nodesExecuted;
    return nameLength(cache('first'), fullName.first) + nameLength(cache('second'), fullName.second);
  });

const nameLength = incremental(cache =>
  (name: string) => {
    ++nodesExecuted;
    return name.length;
  });

describe('incremental', function() {
  it('evaluates result', function() {
    const fullName = {first: 'Sue', second: 'Sanderson'};
    const update = host(totalNameLength);
    expect(update(fullName)).equals(3 + 9);
  });

  it('caches result', function() {
    nodesExecuted = 0;
    let fullName = {first: 'Sue', second: 'Sanderson'};
    const update = host(totalNameLength);
    update(fullName);
    const firstNodesExecuted = nodesExecuted;
    expect(update(fullName)).equals(3 + 9);
    expect(nodesExecuted).equals(firstNodesExecuted);
  });

  it('re-evaluates incrementally', function() {
    const fullName1 = {first: 'Sue', second: 'Sanderson'};
    const update = host(totalNameLength);
    update(fullName1);
    expect(update(fullName1)).equals(3 + 9);
    const fullName2 = {first: fullName1.first, second: 'Jenkins'};
    expect(update(fullName2)).equals(3 + 7);
  });

  it('throws if function changes', function() {
    const executesClosure = incremental(cache => 
      (x: number) => {
        const invalidIncrementalClosure = incremental(cache2 =>
          (x2: number) => x2 + 1);
        return invalidIncrementalClosure(cache('closure'), x * 2);
      });

    const update = host(executesClosure);
    update(2);
    expect(() => update(3)).throws();
  });

  it('throws if cache key re-used', function() {
    const reusesCacheKey = incremental(cache => 
      (fullName: FullName) => {
        const length0 = nameLength(cache('first'), fullName.first);
        const length1 = nameLength(cache('first'), fullName.second);
        return length0 + length1;
      });

    const update = host(reusesCacheKey);
    const fullName = {first: 'Sue', second: 'Sanderson'};
    expect(() => update(fullName)).throws();
  });

  it('throws if cache key re-used on subsequent call', function() {
    const doubles = incremental(cache => 
      (x: number) => {
        return x * 2;
      });
    const reusesCacheKeyOnSubsequentCall = incremental(cache => 
      (callIndex: number) => {
        const x0 = doubles(cache('first'), 1);
        if (callIndex == 0) {
          return x0;
        }
        return x0 + doubles(cache('first'), 2);
      });

    const update = host(reusesCacheKeyOnSubsequentCall);

    // Due to how test function above is written, error will not be apparent
    // on the first call.
    update(0);
    expect(() => update(1)).throws();
  });
});
