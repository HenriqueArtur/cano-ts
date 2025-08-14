// @ts-expect-error - We expect this to fail if imported
import { E, Pipe, PipeSync, pipe, pipeSync } from "cano-ts";
import { describe, expect, it } from "vitest";

describe("cano-ts exports", () => {
  it("should export pipe and pipeSync as functions", () => {
    expect(pipe).toBeTypeOf("function");
    expect(pipeSync).toBeTypeOf("function");
  });

  it("should not export Pipe and PipeSync from cano-ts", () => {
    expect(Pipe).toBeUndefined();
    expect(PipeSync).toBeUndefined();
  });

  it('should export "enum" functions', () => {
    expect(Object.keys(E).length).toBe(14);
    expect(E.concat).toBeTruthy();
    expect(E.every).toBeTruthy();
    expect(E.filter).toBeTruthy();
    expect(E.find).toBeTruthy();
    expect(E.flat).toBeTruthy();
    expect(E.includes).toBeTruthy();
    expect(E.join).toBeTruthy();
    expect(E.map).toBeTruthy();
    expect(E.reduce).toBeTruthy();
    expect(E.reduceRight).toBeTruthy();
    expect(E.reverse).toBeTruthy();
    expect(E.slice).toBeTruthy();
    expect(E.some).toBeTruthy();
    expect(E.sort).toBeTruthy();
  });
});

describe("E module functions (array utilities)", () => {
  describe("E.map", () => {
    it("should transform array elements", () => {
      const numbers = [1, 2, 3, 4];
      const doubled = E.map(numbers, (x) => x * 2);
      expect(doubled).toEqual([2, 4, 6, 8]);
    });

    it("should work with pipes", () => {
      const result = pipeSync([1, 2, 3])
        .next(E.map, (x) => x * 2)
        .next(E.map, (x) => x + 1)
        .result();
      expect(result).toEqual([3, 5, 7]);
    });
  });

  describe("E.filter", () => {
    it("should filter array elements", () => {
      const numbers = [1, 2, 3, 4, 5, 6];
      const evens = E.filter(numbers, (x) => x % 2 === 0);
      expect(evens).toEqual([2, 4, 6]);
    });

    it("should work with pipes", () => {
      const result = pipeSync([1, 2, 3, 4, 5, 6, 7, 8])
        .next(E.filter, (x) => x % 2 === 0)
        .next(E.map, (x) => x * 3)
        .result();
      expect(result).toEqual([6, 12, 18, 24]);
    });
  });

  describe("E.reduce", () => {
    it("should reduce array to single value", () => {
      const numbers = [1, 2, 3, 4];
      const sum = E.reduce(numbers, (acc, curr) => acc + curr, 0);
      expect(sum).toBe(10);
    });

    it("should work with pipes", () => {
      const result = pipeSync([1, 2, 3, 4, 5])
        .next(E.filter, (x) => x % 2 === 1) // [1, 3, 5]
        .next(E.map, (x) => x * 2) // [2, 6, 10]
        .next(E.reduce, (acc, curr) => acc + curr, 0) // 18
        .result();
      expect(result).toBe(18);
    });
  });

  describe("E.find", () => {
    it("should find first matching element", () => {
      const numbers = [1, 2, 3, 4, 5];
      const found = E.find(numbers, (x) => x > 3);
      expect(found).toBe(4);
    });

    it("should return undefined if not found", () => {
      const numbers = [1, 2, 3];
      const found = E.find(numbers, (x) => x > 5);
      expect(found).toBeUndefined();
    });

    it("should work with pipes", () => {
      const result = pipeSync([{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }, { id: 3, name: "Charlie" }])
        .next(E.find, (user) => user.name === "Bob")
        .result();
      expect(result).toEqual({ id: 2, name: "Bob" });
    });
  });

  describe("E.concat", () => {
    it("should concatenate arrays", () => {
      const arr1 = [1, 2, 3];
      const result = E.concat(arr1, [4, 5], [6]);
      expect(result).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it("should work with pipes", () => {
      const result = pipeSync([1, 2])
        .next(E.concat, [3, 4])
        .next(E.concat, [5, 6])
        .next(E.map, (x) => x * 2)
        .result();
      expect(result).toEqual([2, 4, 6, 8, 10, 12]);
    });
  });

  describe("E.every", () => {
    it("should return true if all elements match predicate", () => {
      const numbers = [2, 4, 6, 8];
      const allEven = E.every(numbers, (x) => x % 2 === 0);
      expect(allEven).toBe(true);
    });

    it("should return false if any element doesn't match", () => {
      const numbers = [2, 4, 5, 8];
      const allEven = E.every(numbers, (x) => x % 2 === 0);
      expect(allEven).toBe(false);
    });

    it("should work with pipes", () => {
      const result = pipeSync([1, 2, 3, 4])
        .next(E.map, (x) => x * 2) // [2, 4, 6, 8]
        .next(E.every, (x) => x % 2 === 0) // true
        .result();
      expect(result).toBe(true);
    });
  });

  describe("E.some", () => {
    it("should return true if any element matches predicate", () => {
      const numbers = [1, 3, 5, 6];
      const hasEven = E.some(numbers, (x) => x % 2 === 0);
      expect(hasEven).toBe(true);
    });

    it("should return false if no element matches", () => {
      const numbers = [1, 3, 5, 7];
      const hasEven = E.some(numbers, (x) => x % 2 === 0);
      expect(hasEven).toBe(false);
    });

    it("should work with pipes", () => {
      const result = pipeSync(["apple", "banana", "cherry"])
        .next(E.some, (fruit) => fruit.startsWith("b"))
        .result();
      expect(result).toBe(true);
    });
  });

  describe("E.join", () => {
    it("should join array elements with separator", () => {
      const words = ["hello", "world", "test"];
      const joined = E.join(words, " ");
      expect(joined).toBe("hello world test");
    });

    it("should work with pipes", () => {
      const result = pipeSync([1, 2, 3, 4])
        .next(E.filter, (x) => x % 2 === 0) // [2, 4]
        .next(E.map, (x) => `num-${x}`) // ["num-2", "num-4"]
        .next(E.join, ", ") // "num-2, num-4"
        .result();
      expect(result).toBe("num-2, num-4");
    });
  });

  describe("E.slice", () => {
    it("should extract portion of array", () => {
      const numbers = [1, 2, 3, 4, 5];
      const sliced = E.slice(numbers, 1, 4);
      expect(sliced).toEqual([2, 3, 4]);
    });

    it("should work with pipes", () => {
      const result = pipeSync([1, 2, 3, 4, 5, 6, 7, 8])
        .next(E.filter, (x) => x % 2 === 0) // [2, 4, 6, 8]
        .next(E.slice, 1, 3) // [4, 6]
        .next(E.map, (x) => x * 10) // [40, 60]
        .result();
      expect(result).toEqual([40, 60]);
    });
  });

  describe("E.sort", () => {
    it("should sort array with default comparison", () => {
      const numbers = [3, 1, 4, 1, 5];
      const sorted = E.sort([...numbers]); // spread to avoid mutation
      expect(sorted).toEqual([1, 1, 3, 4, 5]);
    });

    it("should sort with custom comparator", () => {
      const numbers = [3, 1, 4, 1, 5];
      const sorted = E.sort([...numbers], (a, b) => b - a); // descending
      expect(sorted).toEqual([5, 4, 3, 1, 1]);
    });

    it("should work with pipes", () => {
      const result = pipeSync([{ name: "Charlie", age: 25 }, { name: "Alice", age: 30 }, { name: "Bob", age: 20 }])
        .next(E.sort, (a, b) => a.age - b.age) // sort by age ascending
        .next(E.map, (person) => person.name) // extract names
        .result();
      expect(result).toEqual(["Bob", "Charlie", "Alice"]);
    });
  });

  describe("E.reverse", () => {
    it("should reverse array", () => {
      const numbers = [1, 2, 3, 4];
      const reversed = E.reverse([...numbers]); // spread to avoid mutation
      expect(reversed).toEqual([4, 3, 2, 1]);
    });

    it("should work with pipes", () => {
      const result = pipeSync(["a", "b", "c", "d"])
        .next(E.map, (char) => char.toUpperCase()) // ["A", "B", "C", "D"]
        .next(E.reverse) // ["D", "C", "B", "A"]
        .next(E.slice, 0, 2) // ["D", "C"]
        .result();
      expect(result).toEqual(["D", "C"]);
    });
  });

  describe("E.includes", () => {
    it("should check if array includes element", () => {
      const fruits = ["apple", "banana", "cherry"];
      expect(E.includes(fruits, "banana")).toBe(true);
      expect(E.includes(fruits, "grape")).toBe(false);
    });

    it("should work with pipes", () => {
      const result = pipeSync([1, 2, 3, 4, 5])
        .next(E.map, (x) => x * 2) // [2, 4, 6, 8, 10]
        .next(E.includes, 6) // true
        .result();
      expect(result).toBe(true);
    });
  });

  describe("E.flat", () => {
    it("should flatten nested arrays", () => {
      const nested = [[1, 2], [3, 4], [5]];
      const flattened = E.flat(nested);
      expect(flattened).toEqual([1, 2, 3, 4, 5]);
    });

    it("should work with pipes", () => {
      const result = pipeSync([[1, 2], [3, 4]])
        .next(E.flat) // [1, 2, 3, 4]
        .next(E.filter, (x) => x % 2 === 0) // [2, 4]
        .next(E.map, (x) => x * 3) // [6, 12]
        .result();
      expect(result).toEqual([6, 12]);
    });
  });

  describe("E.reduceRight", () => {
    it("should reduce from right to left", () => {
      const numbers = [1, 2, 3, 4];
      const result = E.reduceRight(numbers, (acc, curr) => acc - curr, 10);
      // 10 - 4 - 3 - 2 - 1 = 0
      expect(result).toBe(0);
    });

    it("should work with pipes", () => {
      const result = pipeSync(["a", "b", "c"])
        .next(E.reduceRight, (acc, curr) => acc + curr, "")
        .result();
      expect(result).toBe("cba");
    });
  });
});

describe("Complex E module pipeline scenarios", () => {
  it("should handle data processing pipeline", () => {
    const users = [
      { id: 1, name: "Alice", age: 25, active: true },
      { id: 2, name: "Bob", age: 30, active: false },
      { id: 3, name: "Charlie", age: 35, active: true },
      { id: 4, name: "Diana", age: 28, active: true },
    ];

    const result = pipeSync(users)
      .next(E.filter, (user) => user.active) // filter active users
      .next(E.sort, (a, b) => b.age - a.age) // sort by age descending
      .next(E.map, (user) => user.name) // extract names
      .next(E.slice, 0, 2) // take first 2
      .next(E.join, " & ") // join with separator
      .result();

    expect(result).toBe("Charlie & Diana");
  });

  it("should handle async data processing with E functions", async () => {
    const fetchData = async () => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const processNumbers = async (numbers: number[]) => {
      // Process each number asynchronously and wait for all
      const promises = numbers.map(async (n) => n * 2);
      return Promise.all(promises);
    };

    const result = await pipe(null)
      .next(fetchData) // fetch initial data
      .next(E.filter, (x) => x % 3 === 0) // [3, 6, 9]
      .next(processNumbers) // async processing: [6, 12, 18]
      .next(E.reduce, (acc, curr) => acc + curr, 0) // sum: 36
      .result();

    expect(result).toBe(36);
  });

  it("should handle nested array operations", () => {
    const nestedData = [
      [1, 2, 3],
      [4, 5],
      [6, 7, 8, 9],
    ];

    const result = pipeSync(nestedData)
      .next(E.flat) // [1, 2, 3, 4, 5, 6, 7, 8, 9]
      .next(E.filter, (x) => x % 2 === 1) // [1, 3, 5, 7, 9]
      .next(E.map, (x) => x ** 2) // [1, 9, 25, 49, 81]
      .next(E.slice, 1, 4) // [9, 25, 49]
      .next(E.reduce, (acc, curr) => acc + curr, 0) // 83
      .result();

    expect(result).toBe(83);
  });

  it("should validate data with E functions", () => {
    const scores = [85, 92, 78, 96, 88, 73, 91];

    const result = pipeSync(scores)
      .next(E.every, (score) => score >= 70) // check if all pass
      .result();

    expect(result).toBe(true);

    const hasExcellent = pipeSync(scores)
      .next(E.some, (score) => score >= 95) // check if any are excellent
      .result();

    expect(hasExcellent).toBe(true);
  });
});
