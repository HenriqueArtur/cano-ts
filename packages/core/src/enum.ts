const concat = <T>(list: T[], ...items: (T | ConcatArray<T>)[]): T[] => list.concat(...items);

const every = <T>(
  list: T[],
  predicate: (value: T, index?: number, array?: readonly T[]) => boolean,
): boolean => list.every(predicate);

const filter = <T>(
  list: T[],
  predicate: (value: T, index?: number, array?: readonly T[]) => boolean,
): T[] => list.filter(predicate);

const find = <T>(
  list: T[],
  predicate: (value: T, index?: number, array?: readonly T[]) => boolean,
): T | undefined => list.find(predicate);
const flat = <T>(list: T[], depth?: number) => list.flat(depth);

const includes = <T>(list: T[], searchElement: T, fromIndex?: number): boolean =>
  list.includes(searchElement, fromIndex);

const join = <T>(list: T[], separator?: string): string => list.join(separator);

function map<T, U>(
  list: T[],
  callback: (value: T, index?: number, array?: readonly T[]) => U,
): U[] {
  return list.map(callback);
}

const reduce = <T, U>(
  list: T[],
  callback: (previousValue: U, currentValue: T, currentIndex: number, array: readonly T[]) => U,
  initialValue: U,
): U => list.reduce(callback, initialValue);

const reduceRight = <T, U>(
  list: T[],
  callback: (previousValue: U, currentValue: T, currentIndex: number, array: readonly T[]) => U,
  initialValue?: U,
) => list.reduceRight(callback, initialValue);

const reverse = <T>(list: T[]): T[] => list.reverse();

const slice = <T>(list: T[], start?: number, end?: number) => list.slice(start, end);

const some = <T>(
  list: T[],
  predicate: (value: T, index: number, array: readonly T[]) => boolean,
): boolean => list.some(predicate);

const sort = <T>(list: T[], compareFn?: ((a: T, b: T) => number) | undefined): T[] =>
  list.sort(compareFn);

export default {
  concat,
  every,
  filter,
  find,
  flat,
  includes,
  join,
  map,
  reduce,
  reduceRight,
  reverse,
  slice,
  some,
  sort,
};
