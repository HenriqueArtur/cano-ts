export { default as E } from "./enum";

/**
 * Creates an asynchronous pipeline that allows chaining async functions.
 *
 * This function initializes a pipeline with an initial value and allows
 * chaining of asynchronous functions using `.next()`. Use `.result()` to
 * retrieve the final computed value.
 *
 * @param value - The initial value to be processed in the pipeline.
 * @returns A Pipe instance that allows chaining async operations.
 *
 * @example
 * async function double(x: number) {
 *   return x * 2;
 * }
 *
 * async function increment(x: number) {
 *   return x + 1;
 * }
 *
 * const result = await pipe(5)
 *   .next(double)
 *   .next(increment)
 *   .result();
 *
 * console.log(result); // 11
 */
export function pipe<T>(value: T) {
  return new Pipe(value);
}

type AsyncPipeFn<T, U, Args extends unknown[]> = (arg: T, ...args: Args) => U | Promise<U>;

class Pipe<T> {
  private value: Promise<T>;
  private fnHistory: string[];

  constructor(initialValue: T | Promise<T>, fnHistory: string[] = []) {
    this.value = Promise.resolve(initialValue);
    this.fnHistory = fnHistory;
  }

  next<U, Args extends unknown[]>(fn: AsyncPipeFn<T, U, Args>, ...args: Args): Pipe<U> {
    const fnName = fn.name || "anonymous";
    const newHistory = [...this.fnHistory, fnName];

    return new Pipe(
      this.value.then((value) => {
        const result = fn(value, ...args);
        return Promise.resolve(result);
      }),
      newHistory,
    );
  }

  log(msg?: string) {
    return new Pipe(
      this.value.then(async (val) => {
        if (this.fnHistory.length === 0) {
          if (msg) console.debug(msg, val);
          else console.debug("[PipeAsync] INITIAL ->", val);
          return val;
        }
        if (msg) console.debug(msg, val);
        else console.debug(`[PipeAsync] ${this.fnHistory[this.fnHistory.length - 1]} ->`, val);
        return val;
      }),
      this.fnHistory,
    );
  }

  /**
   * Catches errors that occur during the pipeline execution.
   *
   * This method allows you to handle errors gracefully and optionally
   * recover by returning a new value. If no error occurs, the catch
   * handler is not called.
   *
   * @param handler - A function that receives the error and returns a recovery value
   * @returns A new Pipe instance with the error handled
   *
   * @example
   * async function divide(x: number, y: number) {
   *   if (y === 0) throw new Error("Division by zero");
   *   return x / y;
   * }
   *
   * const result = await pipe(10)
   *   .next(divide, 0) // Throws error
   *   .catch((error) => {
   *     console.error(error);
   *     return 0; // Recovery value
   *   })
   *   .result();
   *
   * console.log(result); // 0
   */
  catch<U>(handler: (error: unknown) => U | Promise<U>): Pipe<T | U> {
    return new Pipe(
      this.value.catch((error) => Promise.resolve(handler(error))),
      this.fnHistory,
    );
  }

  async result(): Promise<T> {
    return this.value;
  }
}

/**
 * Creates a synchronous pipeline that allows chaining synchronous functions.
 *
 * This function initializes a pipeline with an initial value and allows
 * chaining of synchronous functions using `.next()`. Use `.result()` to
 * retrieve the final computed value.
 *
 * @param value - The initial value to be processed in the pipeline.
 * @returns A PipeSync instance that allows chaining synchronous operations.
 *
 * @example
 * function double(x: number) {
 *   return x * 2;
 * }
 *
 * function increment(x: number) {
 *   return x + 1;
 * }
 *
 * const result = pipeSync(5)
 *   .next(double)
 *   .next(increment)
 *   .result();
 *
 * console.log(result); // 11
 */
export function pipeSync<T>(value: T) {
  return new PipeSync(value);
}

type SyncPipeFn<T, U, Args extends unknown[]> = (arg: T, ...args: Args) => U;

type PipeSyncResult<T> = { success: true; value: T } | { success: false; error: unknown };

class PipeSync<T> {
  private state: PipeSyncResult<T>;
  private fnHistory: string[];

  constructor(initialValue: T | PipeSyncResult<T>, fnHistory: string[] = []) {
    if (typeof initialValue === "object" && initialValue !== null && "success" in initialValue) {
      this.state = initialValue as PipeSyncResult<T>;
    } else {
      this.state = { success: true, value: initialValue as T };
    }
    this.fnHistory = fnHistory;
  }

  next<U, Args extends unknown[]>(fn: SyncPipeFn<T, U, Args>, ...args: Args): PipeSync<U> {
    const newHistory = [...this.fnHistory, fn.name || "anonymous"];

    if (!this.state.success) {
      return new PipeSync<U>(this.state as PipeSyncResult<U>, newHistory);
    }

    try {
      const newValue = fn(this.state.value, ...args) as U;
      return new PipeSync<U>(newValue, newHistory);
    } catch (error) {
      return new PipeSync<U>({ success: false, error }, newHistory);
    }
  }

  log(msg?: string) {
    if (!this.state.success) {
      return this;
    }

    if (this.fnHistory.length === 0) {
      if (msg) console.debug(msg, this.state.value);
      else console.debug("[PipeSync] INITIAL ->", this.state.value);
      return this;
    }
    if (msg) console.debug(msg, this.state.value);
    else {
      console.debug(`[PipeSync] ${this.fnHistory[this.fnHistory.length - 1]} ->`, this.state.value);
    }
    return this;
  }

  /**
   * Catches errors that occur during the synchronous pipeline execution.
   *
   * This method allows you to handle errors gracefully and optionally
   * recover by returning a new value. If no error occurs, the catch
   * handler is not called.
   *
   * @param handler - A function that receives the error and returns a recovery value
   * @returns A new PipeSync instance with the error handled
   *
   * @example
   * function divide(x: number, y: number) {
   *   if (y === 0) throw new Error("Division by zero");
   *   return x / y;
   * }
   *
   * const result = pipeSync(10)
   *   .next(divide, 0) // Throws error
   *   .catch((error) => {
   *     console.error(error);
   *     return 0; // Recovery value
   *   })
   *   .result();
   *
   * console.log(result); // 0
   */
  catch<U>(handler: (error: unknown) => U): PipeSync<T | U> {
    if (!this.state.success) {
      try {
        const recoveredValue = handler(this.state.error);
        return new PipeSync<T | U>(recoveredValue, this.fnHistory);
      } catch (error) {
        return new PipeSync<T | U>({ success: false, error }, this.fnHistory);
      }
    }
    return this as PipeSync<T | U>;
  }

  result(): T {
    if (!this.state.success) {
      throw this.state.error;
    }
    return this.state.value;
  }
}
