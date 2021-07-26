export type Comparator<T> = (a: T, b: T) => number;

export function natural<T extends string | number>(): Comparator<T> {
  return (a, b) => a < b ? -1 : (a > b ? 1 : 0);
}

export function reverse<T>(comparator: Comparator<T>, ...args: T[]): Comparator<T> {
  return (a, b) => -comparator(a, b);
}

function min2<T>(comparator: Comparator<T>, a: T, b: T): T {
  return comparator(a, b) < 0 ? a : b;
}

export function min<T>(comparator: Comparator<T>, ...args: [T, ...T[]]): T {
  return args.reduce((a, b) => min2(comparator, a, b));
}

export function max<T>(comparator: Comparator<T>, ...args: [T, ...T[]]): T {
  const reverseComparator = reverse(comparator);
  return args.reduce((a, b) => min2(reverseComparator, a, b));
}
