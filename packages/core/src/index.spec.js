import { describe, expect, it, vi } from "vitest";
import { pipe, pipeSync } from ".";
// Sample functions (Sync)
const add = (x, y) => x + y;
const multiply = (x, factor) => x * factor;
const format = (x, prefix) => `${prefix} ${x}`;
const concatThree = (a, b, c) => `${a} ${b} ${c}`;
const complexMath = (a, b, c, d) => (a + b) * (c - d);
// Sample functions (Async)
const addAsync = async (x, y) => x + y;
const multiplyAsync = async (x, factor) => x * factor;
const formatAsync = async (x, prefix) => `${prefix} ${x}`;
const concatThreeAsync = async (a, b, c) => `${a} ${b} ${c}`;
const complexMathAsync = async (a, b, c, d) => (a + b) * (c - d);
describe("pipeSync", () => {
    describe(".next()", () => {
        it("should process a series of sync functions correctly", () => {
            const result = pipeSync(5)
                .next(add, 3) // 5 + 3 = 8
                .next(multiply, 2) // 8 * 2 = 16
                .next(format, "Result:") // "Result: 16"
                .result();
            expect(result).toBe("Result: 16");
        });
        it("should process a function with 3 arguments correctly", () => {
            const result = pipeSync("Hello").next(concatThree, "beautiful", "world").result();
            expect(result).toBe("Hello beautiful world");
        });
        it("should process a function with 4 arguments correctly", () => {
            const result = pipeSync(10)
                .next(complexMath, 5, 20, 3) // (10 + 5) * (20 - 3) = 15 * 17 = 255
                .result();
            expect(result).toBe(255);
        });
        it("should return the initial value when no transformations are applied", () => {
            const result = pipeSync(42).result();
            expect(result).toBe(42);
        });
        it("should handle different data types", () => {
            const result = pipeSync("hello")
                .next((str) => str.toUpperCase())
                .next((str) => `**${str}**`)
                .result();
            expect(result).toBe("**HELLO**");
        });
        it("should process a series of single-argument sync functions correctly", () => {
            const increment = (x) => x + 1;
            const double = (x) => x * 2;
            const toStringSync = (x) => `Value: ${x}`;
            const result = pipeSync(5)
                .next(increment) // 5 + 1 = 6
                .next(double) // 6 * 2 = 12
                .next(toStringSync) // "Value: 12"
                .result();
            expect(result).toBe("Value: 12");
        });
        it("should process a series of sync functions with no arguments", () => {
            const returnFive = () => 5;
            const toStringSync = (x) => `Value: ${x}`;
            const result = pipeSync(0)
                .next(returnFive)
                .next(returnFive)
                .next(toStringSync) // "Value: 5"
                .result();
            expect(result).toBe("Value: 5");
        });
    });
    describe(".log()", () => {
        it("should log the value with a custom message", () => {
            const consoleSpy = vi.spyOn(console, "debug");
            const result = pipeSync(10).log("Custom message:");
            expect(consoleSpy).toHaveBeenCalledWith("Custom message:", 10);
            expect(result).toBeInstanceOf(Object);
            consoleSpy.mockRestore();
        });
        it("should log the value with default format", () => {
            const consoleSpy = vi.spyOn(console, "debug");
            const result = pipeSync(42).log();
            expect(consoleSpy).toHaveBeenCalledWith("[PipeSync] INITIAL ->", 42);
            expect(result).toBeInstanceOf(Object);
            consoleSpy.mockRestore();
        });
        it("should log the intermediate value between next calls", () => {
            const consoleSpy = vi.spyOn(console, "debug");
            const result = pipeSync(5)
                .next(add, 5) // 5 + 5 = 10
                .log("Intermediate:") // Should log "Intermediate: 10"
                .next(multiply, 2) // 10 * 2 = 20
                .result();
            expect(consoleSpy).toHaveBeenCalledWith("Intermediate:", 10);
            expect(result).toBe(20);
            consoleSpy.mockRestore();
        });
        it("should log with anonymous functions between transformations", () => {
            const consoleSpy = vi.spyOn(console, "debug");
            const result = pipeSync(5)
                .next((x) => x + 5) // 5 + 5 = 10
                .log() // Should log "[PipeSync] anonymous ->", 10
                .next((x) => x * 2) // 10 * 2 = 20
                .result();
            expect(consoleSpy).toHaveBeenCalledWith("[PipeSync] anonymous ->", 10);
            expect(result).toBe(20);
            consoleSpy.mockRestore();
        });
        it("should log with anonymous functions and call result after log", () => {
            const consoleSpy = vi.spyOn(console, "debug");
            const result = pipeSync(5)
                .next((x) => x + 5) // 5 + 5 = 10
                .next((x) => x * 2) // 10 * 2 = 20
                .log() // Should log "[PipeSync] anonymous ->", 20
                .result();
            expect(consoleSpy).toHaveBeenCalledWith("[PipeSync] anonymous ->", 20);
            expect(result).toBe(20);
            consoleSpy.mockRestore();
        });
    });
});
describe("pipe (Async)", () => {
    describe(".next()", () => {
        it("should process a series of async functions correctly", async () => {
            const result = await pipe(5)
                .next(addAsync, 3) // Async: 5 + 3 = 8
                .next(multiplyAsync, 2) // Async: 8 * 2 = 16
                .next(formatAsync, "Result:") // Async: "Result: 16"
                .result();
            expect(result).toBe("Result: 16");
        });
        it("should process a mix of sync and async functions correctly", async () => {
            const result = await pipe(5)
                .next(add, 3) // Sync: 5 + 3 = 8
                .next(multiplyAsync, 2) // Async: 8 * 2 = 16
                .next(format, "Result:") // Sync: "Result: 16"
                .result();
            expect(result).toBe("Result: 16");
        });
        it("should process a function with 3 arguments correctly", async () => {
            const result = await pipe("Hello").next(concatThreeAsync, "amazing", "world").result();
            expect(result).toBe("Hello amazing world");
        });
        it("should process a function with 4 arguments correctly", async () => {
            const result = await pipe(10)
                .next(complexMathAsync, 5, 20, 3) // Async: (10 + 5) * (20 - 3) = 15 * 17 = 255
                .result();
            expect(result).toBe(255);
        });
        it("should return the initial value when no transformations are applied", async () => {
            const result = await pipe(42).result();
            expect(result).toBe(42);
        });
        it("should handle different data types", async () => {
            const result = await pipe("hello")
                .next(async (str) => str.toUpperCase())
                .next((str) => `**${str}**`)
                .result();
            expect(result).toBe("**HELLO**");
        });
        it("should process a series of single-argument async functions correctly", async () => {
            const incrementAsync = async (x) => x + 1;
            const doubleAsync = async (x) => x * 2;
            const toStringAsync = async (x) => `Value: ${x}`;
            const result = await pipe(5)
                .next(incrementAsync) // Async: 5 + 1 = 6
                .next(doubleAsync) // Async: 6 * 2 = 12
                .next(toStringAsync) // Async: "Value: 12"
                .result();
            expect(result).toBe("Value: 12");
        });
        it("should process a series of async functions with no arguments", async () => {
            const returnFiveAsync = async () => 5;
            const toStringAsync = async (x) => `Value: ${x}`;
            const result = await pipe(0)
                .next(returnFiveAsync)
                .next(returnFiveAsync)
                .next(toStringAsync)
                .result();
            expect(result).toBe("Value: 5");
        });
    });
    describe(".log()", () => {
        it("should log the async value with a custom message", async () => {
            const consoleSpy = vi.spyOn(console, "debug");
            const result = await pipe(20).log("Async message:").result();
            expect(consoleSpy).toHaveBeenCalledWith("Async message:", 20);
            expect(result).toBe(20);
            consoleSpy.mockRestore();
        });
        it("should log the async value with default format", async () => {
            const consoleSpy = vi.spyOn(console, "debug");
            const result = await pipe(99).log().result();
            expect(consoleSpy).toHaveBeenCalledWith("[PipeAsync] INITIAL ->", 99);
            expect(result).toBe(99);
            consoleSpy.mockRestore();
        });
        it("should log the intermediate async value between next calls", async () => {
            const consoleSpy = vi.spyOn(console, "debug");
            const result = await pipe(5)
                .next(addAsync, 5) // Async: 5 + 5 = 10
                .log("Async Intermediate:") // Should log "Async Intermediate: 10"
                .next(multiplyAsync, 2) // Async: 10 * 2 = 20
                .result();
            expect(consoleSpy).toHaveBeenCalledWith("Async Intermediate:", 10);
            expect(result).toBe(20);
            consoleSpy.mockRestore();
        });
        it("should log with anonymous async functions between transformations", async () => {
            const consoleSpy = vi.spyOn(console, "debug");
            const result = await pipe(5)
                .next(async (x) => x + 5) // Async: 5 + 5 = 10
                .log() // Should log "[PipeAsync] anonymous ->", 10
                .next(async (x) => x * 2) // Async: 10 * 2 = 20
                .result();
            expect(consoleSpy).toHaveBeenCalledWith("[PipeAsync] anonymous ->", 10);
            expect(result).toBe(20);
            consoleSpy.mockRestore();
        });
        it("should log with anonymous async functions and call result after log", async () => {
            const consoleSpy = vi.spyOn(console, "debug");
            const result = await pipe(5)
                .next(async (x) => x + 5) // Async: 5 + 5 = 10
                .next(async (x) => x * 2) // Async: 10 * 2 = 20
                .log() // Should log "[PipeAsync] anonymous ->", 20
                .result(); // Should return 20
            expect(consoleSpy).toHaveBeenCalledWith("[PipeAsync] anonymous ->", 20);
            expect(result).toBe(20);
            consoleSpy.mockRestore();
        });
    });
});
