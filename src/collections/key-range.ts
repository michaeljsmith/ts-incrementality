import { Comparator, max, min } from "../comparison.js";

export interface KeyRange<T> {
  min: T;
  max: T;
};

export function pointKeyRange<T>(key: T) {
  return {
    min: key,
    max: key,
  };
}

export function keyRangeEnclosing<T>(comparator: Comparator<T>, range1: KeyRange<T>, range2: KeyRange<T>): KeyRange<T> {
  return {
    min: min(comparator, range1.min, range2.min),
    max: max(comparator, range1.max, range2.max),
  };
}

export function keyRangeContains<T>(comparator: Comparator<T>, keyRange: KeyRange<T>, key: T): boolean {
  return comparator(keyRange.min, key) <= 0 && comparator(keyRange.max, key) >= 0;
}

export function keyRangeEncloses<T>(comparator: Comparator<T>, a: KeyRange<T>, b: KeyRange<T>): boolean {
  return comparator(a.min, b.min) <= 0 && comparator(a.max, b.max) >= 0;
}
