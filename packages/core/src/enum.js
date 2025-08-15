const concat = (list, ...items) => list.concat(...items);
const every = (list, predicate) => list.every(predicate);
const filter = (list, predicate) => list.filter(predicate);
const find = (list, predicate) => list.find(predicate);
const flat = (list, depth) => list.flat(depth);
const includes = (list, searchElement, fromIndex) => list.includes(searchElement, fromIndex);
const join = (list, separator) => list.join(separator);
function map(list, callback) {
    return list.map(callback);
}
const reduce = (list, callback, initialValue) => list.reduce(callback, initialValue);
const reduceRight = (list, callback, initialValue) => list.reduceRight(callback, initialValue);
const reverse = (list) => list.reverse();
const slice = (list, start, end) => list.slice(start, end);
const some = (list, predicate) => list.some(predicate);
const sort = (list, compareFn) => list.sort(compareFn);
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
