const map = <T, U>(
  list: T[],
  callback: (value: T, index?: number, array?: readonly T[]) => U,
): U[] => list.map(callback);

const filter = <T, S extends T>(
  list: T[],
  predicate: (value: T, index?: number, array?: readonly T[]) => value is S,
): S[] => list.filter(predicate);

const concat = <T>(list: T[], ...items: (T | ConcatArray<T>)[]): T[] => list.concat(...items);

const every = <T>(
  list: T[],
  predicate: (value: T, index?: number, array?: readonly T[]) => boolean,
): boolean => list.every(predicate);

const find = <T>(
  list: T[],
  predicate: (value: T, index?: number, array?: readonly T[]) => boolean,
): T | unknown => list.find(predicate);

const flat = <T>(list: T[], depth?: number) => list.flat(depth);

const includes = <T>(list: T[], searchElement: T, fromIndex?: number): boolean =>
  list.includes(searchElement, fromIndex);

const join = <T>(list: T[], separator?: string): string => list.join(separator);

const reduce = <T, U>(
  list: T[],
  callback: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U,
  initialValue?: U,
) => list.reduce(callback, initialValue);

const reduceRight = <T, U>(
  list: T[],
  callback: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U,
  initialValue?: U,
) => list.reduceRight(callback, initialValue);

export const E = {
  map,
  filter,
  concat,
  every,
  find,
  flat,
  includes,
  join,
  reduce,
  reduceRight,
};
