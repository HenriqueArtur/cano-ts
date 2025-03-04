import { pipe, pipeSync } from "pipe";
import { describe, expect, it } from "vitest";

// Sample functions (Sync)
const add = (x: number, y: number) => x + y;
const multiply = (x: number, factor: number) => x * factor;
const format = (x: number, prefix: string) => `${prefix} ${x}`;
const concatThree = (a: string, b: string, c: string) => `${a} ${b} ${c}`;
const complexMath = (a: number, b: number, c: number, d: number) => (a + b) * (c - d);

// Sample functions (Async)
const addAsync = async (x: number, y: number) => x + y;
const multiplyAsync = async (x: number, factor: number) => x * factor;
const formatAsync = async (x: number, prefix: string) => `${prefix} ${x}`;
const concatThreeAsync = async (a: string, b: string, c: string) => `${a} ${b} ${c}`;
const complexMathAsync = async (a: number, b: number, c: number, d: number) => (a + b) * (c - d);

describe("pipeSync", () => {
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
});

describe("pipe (Async)", () => {
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

  it("should handle async errors", async () => {
    const failingAsyncFn = async (_x: number) => {
      throw Error("Test Error");
    };

    await expect(pipe(5).next(failingAsyncFn).result()).rejects.toThrow("Test Error");
  });
});
