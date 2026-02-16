import { describe, expect, it, vi } from "vitest";
import { pipe, pipeSync } from ".";

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
      const increment = (x: number) => x + 1;
      const double = (x: number) => x * 2;
      const toStringSync = (x: number) => `Value: ${x}`;

      const result = pipeSync(5)
        .next(increment) // 5 + 1 = 6
        .next(double) // 6 * 2 = 12
        .next(toStringSync) // "Value: 12"
        .result();

      expect(result).toBe("Value: 12");
    });

    it("should process a series of sync functions with no arguments", () => {
      const returnFive = () => 5;
      const toStringSync = (x: number) => `Value: ${x}`;

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

  describe(".catch()", () => {
    it("should catch errors thrown in next() and handle them", () => {
      const throwError = () => {
        throw new Error("Something went wrong");
      };

      const result = pipeSync(5)
        .next(add, 3) // 5 + 3 = 8
        .next(throwError) // Throws error
        .catch((error) => {
          expect(error).toBeInstanceOf(Error);
          expect((error as Error).message).toBe("Something went wrong");
          return -1; // Recovery value
        })
        .result();

      expect(result).toBe(-1);
    });

    it("should not call catch handler if no error occurred", () => {
      const catchHandler = vi.fn(() => -1);

      const result = pipeSync(5)
        .next(add, 3) // 5 + 3 = 8
        .next(multiply, 2) // 8 * 2 = 16
        .catch(catchHandler)
        .result();

      expect(catchHandler).not.toHaveBeenCalled();
      expect(result).toBe(16);
    });

    it("should allow continuing the pipeline after catch", () => {
      const throwError = () => {
        throw new Error("Test error");
      };

      const result = pipeSync(10)
        .next(throwError)
        .catch(() => 5) // Recover with value 5
        .next(add, 3) // 5 + 3 = 8
        .next(multiply, 2) // 8 * 2 = 16
        .result();

      expect(result).toBe(16);
    });

    it("should skip subsequent next() calls if error is not caught", () => {
      const throwError = () => {
        throw new Error("Test error");
      };
      const shouldNotBeCalled = vi.fn((x: number) => x * 2);

      expect(() => {
        pipeSync(10)
          .next(throwError)
          .next(shouldNotBeCalled) // Should not execute
          .result();
      }).toThrow("Test error");

      expect(shouldNotBeCalled).not.toHaveBeenCalled();
    });

    it("should handle errors in catch handler", () => {
      const throwError = () => {
        throw new Error("First error");
      };
      const throwErrorInCatch = () => {
        throw new Error("Second error");
      };

      expect(() => {
        pipeSync(10).next(throwError).catch(throwErrorInCatch).result();
      }).toThrow("Second error");
    });

    it("should handle multiple catch handlers", () => {
      const throwError = () => {
        throw new Error("Test error");
      };

      const result = pipeSync(10)
        .next(throwError)
        .catch(() => {
          throw new Error("Second error");
        })
        .catch((error) => {
          expect((error as Error).message).toBe("Second error");
          return 42;
        })
        .result();

      expect(result).toBe(42);
    });

    it("should catch errors from any previous step in the pipeline", () => {
      const step2Error = () => {
        throw new Error("Error in step 2");
      };
      const step1Spy = vi.fn((x: number) => x * 2);
      const step3Spy = vi.fn((x: number) => x + 5);

      const result = pipeSync(10)
        .next(step1Spy) // Should execute: 10 * 2 = 20
        .next(step2Error) // Throws error
        .next(step3Spy) // Should NOT execute
        .catch((error) => {
          expect((error as Error).message).toBe("Error in step 2");
          return 99;
        })
        .result();

      expect(step1Spy).toHaveBeenCalledWith(10);
      expect(step3Spy).not.toHaveBeenCalled();
      expect(result).toBe(99);
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
      const incrementAsync = async (x: number) => x + 1;
      const doubleAsync = async (x: number) => x * 2;
      const toStringAsync = async (x: number) => `Value: ${x}`;

      const result = await pipe(5)
        .next(incrementAsync) // Async: 5 + 1 = 6
        .next(doubleAsync) // Async: 6 * 2 = 12
        .next(toStringAsync) // Async: "Value: 12"
        .result();

      expect(result).toBe("Value: 12");
    });

    it("should process a series of async functions with no arguments", async () => {
      const returnFiveAsync = async () => 5;
      const toStringAsync = async (x: number) => `Value: ${x}`;

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

  describe(".catch()", () => {
    it("should catch errors thrown in async next() and handle them", async () => {
      const throwErrorAsync = async () => {
        throw new Error("Async error");
      };

      const result = await pipe(5)
        .next(addAsync, 3) // 5 + 3 = 8
        .next(throwErrorAsync) // Throws error
        .catch((error) => {
          expect(error).toBeInstanceOf(Error);
          expect((error as Error).message).toBe("Async error");
          return -1; // Recovery value
        })
        .result();

      expect(result).toBe(-1);
    });

    it("should not call catch handler if no error occurred in async pipe", async () => {
      const catchHandler = vi.fn(() => -1);

      const result = await pipe(5)
        .next(addAsync, 3) // 5 + 3 = 8
        .next(multiplyAsync, 2) // 8 * 2 = 16
        .catch(catchHandler)
        .result();

      expect(catchHandler).not.toHaveBeenCalled();
      expect(result).toBe(16);
    });

    it("should allow continuing the async pipeline after catch", async () => {
      const throwErrorAsync = async () => {
        throw new Error("Test error");
      };

      const result = await pipe(10)
        .next(throwErrorAsync)
        .catch(() => 5) // Recover with value 5
        .next(addAsync, 3) // 5 + 3 = 8
        .next(multiplyAsync, 2) // 8 * 2 = 16
        .result();

      expect(result).toBe(16);
    });

    it("should catch errors from sync functions in async pipe", async () => {
      const throwError = () => {
        throw new Error("Sync error in async pipe");
      };

      const result = await pipe(10)
        .next(throwError)
        .catch((error) => {
          expect((error as Error).message).toBe("Sync error in async pipe");
          return 99;
        })
        .result();

      expect(result).toBe(99);
    });

    it("should handle async catch handlers", async () => {
      const throwErrorAsync = async () => {
        throw new Error("Test error");
      };

      const result = await pipe(10)
        .next(throwErrorAsync)
        .catch(async (error) => {
          expect((error as Error).message).toBe("Test error");
          return Promise.resolve(42);
        })
        .result();

      expect(result).toBe(42);
    });

    it("should handle multiple catch handlers in async pipe", async () => {
      const throwErrorAsync = async () => {
        throw new Error("First error");
      };

      const result = await pipe(10)
        .next(throwErrorAsync)
        .catch(() => {
          throw new Error("Second error");
        })
        .catch((error) => {
          expect((error as Error).message).toBe("Second error");
          return 100;
        })
        .result();

      expect(result).toBe(100);
    });

    it("should reject if error is not caught in async pipe", async () => {
      const throwErrorAsync = async () => {
        throw new Error("Uncaught error");
      };

      await expect(
        pipe(10)
          .next(throwErrorAsync)
          .next(addAsync, 5) // Should not execute
          .result(),
      ).rejects.toThrow("Uncaught error");
    });

    it("should catch errors from any previous step in the async pipeline", async () => {
      const step2Error = async () => {
        throw new Error("Async error in step 2");
      };
      const step1Spy = vi.fn(async (x: number) => x * 2);
      const step3Spy = vi.fn(async (x: number) => x + 5);

      const result = await pipe(10)
        .next(step1Spy) // Should execute: 10 * 2 = 20
        .next(step2Error) // Throws error
        .next(step3Spy) // Should NOT execute (promise chain stops)
        .catch((error) => {
          expect((error as Error).message).toBe("Async error in step 2");
          return 99;
        })
        .result();

      expect(step1Spy).toHaveBeenCalledWith(10);
      expect(step3Spy).not.toHaveBeenCalled();
      expect(result).toBe(99);
    });
  });
});
