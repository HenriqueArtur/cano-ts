import E from "./enum";
import { pipe, pipeSync } from "./index";
import { beforeEach, describe, expect, it, vi } from "vitest";
describe("um Utility Functions", () => {
    let numbers;
    let words;
    beforeEach(() => {
        numbers = [1, 2, 3, 4, 5];
        words = ["apple", "banana", "cherry"];
    });
    it("concat should merge arrays", () => {
        expect(E.concat(numbers, [6, 7])).toEqual([1, 2, 3, 4, 5, 6, 7]);
        expect(E.concat(words, "date")).toEqual(["apple", "banana", "cherry", "date"]);
    });
    it("every should return true if all match predicate", () => {
        expect(E.every(numbers, (n) => n > 0)).toBe(true);
        expect(E.every(numbers, (n) => n > 2)).toBe(false);
    });
    it("filter should return a filtered array", () => {
        expect(E.filter(numbers, (n) => n > 3)).toEqual([4, 5]);
    });
    it("find should return the first matching element", () => {
        expect(E.find(numbers, (n) => n > 3)).toBe(4);
        expect(E.find(numbers, (n) => n > 10)).toBeUndefined();
    });
    it("flat should flatten nested arrays", () => {
        const nested = [1, [2, [3, 4]], 5];
        expect(E.flat(nested, 1)).toEqual([1, 2, [3, 4], 5]);
        expect(E.flat(nested, 2)).toEqual([1, 2, 3, 4, 5]);
    });
    it("includes should check element existence", () => {
        expect(E.includes(numbers, 3)).toBe(true);
        expect(E.includes(numbers, 10)).toBe(false);
    });
    it("join should return a string", () => {
        expect(E.join(words, ", ")).toBe("apple, banana, cherry");
    });
    it("map should apply a function to each element", () => {
        expect(E.map(numbers, (n) => n * 2)).toEqual([2, 4, 6, 8, 10]);
    });
    it("reduce should accumulate values", () => {
        expect(E.reduce(numbers, (acc, n) => acc + n, 0)).toBe(15);
    });
    it("reduceRight should accumulate values in reverse", () => {
        expect(E.reduceRight(numbers, (acc, n) => acc + n, 0)).toBe(15);
    });
    it("reverse should return reversed array", () => {
        expect(E.reverse([...numbers])).toEqual([5, 4, 3, 2, 1]);
    });
    it("slice should return a portion of array", () => {
        expect(E.slice(numbers, 1, 3)).toEqual([2, 3]);
    });
    it("some should return true if at least one matches", () => {
        expect(E.some(numbers, (n) => n > 4)).toBe(true);
        expect(E.some(numbers, (n) => n > 10)).toBe(false);
    });
    it("sort should sort an array", () => {
        expect(E.sort([...numbers], (a, b) => b - a)).toEqual([5, 4, 3, 2, 1]);
        expect(E.sort([...words])).toEqual(["apple", "banana", "cherry"]);
    });
});
describe("Pipe Integration with um Functions", () => {
    it("pipe should process an array asynchronously with map and filter", async () => {
        const result = await pipe([1, 2, 3, 4, 5])
            .next(E.map, (n) => n * 2) // [2, 4, 6, 8, 10]
            .next(E.filter, (n) => n > 5) // [6, 8, 10]
            .result();
        expect(result).toEqual([6, 8, 10]);
    });
    it("pipe should process an array synchronously", () => {
        const result = pipeSync([1, 2, 3, 4, 5])
            .next(E.map, (n) => n * 2) // [2, 4, 6, 8, 10]
            .next(E.filter, (n) => n > 5) // [6, 8, 10]
            .result();
        expect(result).toEqual([6, 8, 10]);
    });
    it("pipe should handle async map and reduce", async () => {
        const asyncDouble = async (n) => n * 2;
        const result = await pipe([1, 2, 3])
            .next(E.map, asyncDouble) // [2, 4, 6]
            .next(E.reduce, async (acc, n) => {
            const accResolved = await acc;
            const nResolved = await n;
            return accResolved + nResolved;
        }, Promise.resolve(0)) // 12
            .result();
        expect(result).toBe(12);
    });
    it("pipeSync should work with slice and join", () => {
        const result = pipeSync(["alpha", "beta", "gamma", "delta"])
            .next(E.slice, 1, 3) // ["beta", "gamma"]
            .next(E.join, ", ") // "beta, gamma"
            .result();
        expect(result).toBe("beta, gamma");
    });
    it("pipe should handle sorting and reversing", async () => {
        const result = await pipe([5, 3, 8, 1])
            .next(E.sort, (a, b) => a - b) // [1, 3, 5, 8]
            .next(E.reverse) // [8, 5, 3, 1]
            .result();
        expect(result).toEqual([8, 5, 3, 1]);
    });
    it("pipeSync should correctly use includes", () => {
        const result = pipeSync(["apple", "banana", "cherry"])
            .next(E.includes, "banana") // true
            .result();
        expect(result).toBe(true);
    });
    it("pipe should log intermediate results", async () => {
        const spy = vi.spyOn(console, "debug");
        await pipe([1, 2, 3])
            .log("Initial Array") // Log initial value
            .next(E.map, (n) => n * 2)
            .log("After Doubling") // Log after map
            .next(E.reduce, (acc, n) => acc + n, 0)
            .log("Final Result")
            .result();
        expect(spy).toHaveBeenCalledWith("Initial Array", [1, 2, 3]);
        expect(spy).toHaveBeenCalledWith("After Doubling", [2, 4, 6]);
        expect(spy).toHaveBeenCalledWith("Final Result", 12);
    });
});
