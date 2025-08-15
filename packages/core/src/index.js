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
export function pipe(value) {
    return new Pipe(value);
}
class Pipe {
    value;
    fnHistory;
    constructor(initialValue, fnHistory = []) {
        this.value = Promise.resolve(initialValue);
        this.fnHistory = fnHistory;
    }
    next(fn, ...args) {
        const fnName = fn.name || "anonymous";
        const newHistory = [...this.fnHistory, fnName];
        return new Pipe(this.value.then((value) => {
            const result = fn(value, ...args);
            return Promise.resolve(result);
        }), newHistory);
    }
    log(msg) {
        return new Pipe(this.value.then(async (val) => {
            if (this.fnHistory.length === 0) {
                if (msg)
                    console.debug(msg, val);
                else
                    console.debug("[PipeAsync] INITIAL ->", val);
                return val;
            }
            if (msg)
                console.debug(msg, val);
            else
                console.debug(`[PipeAsync] ${this.fnHistory[this.fnHistory.length - 1]} ->`, val);
            return val;
        }), this.fnHistory);
    }
    async result() {
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
export function pipeSync(value) {
    return new PipeSync(value);
}
class PipeSync {
    value;
    fnHistory;
    constructor(initialValue, fnHistory = []) {
        this.value = initialValue;
        this.fnHistory = fnHistory;
    }
    next(fn, ...args) {
        const newHistory = [...this.fnHistory, fn.name || "anonymous"];
        return new PipeSync(fn(this.value, ...args), newHistory);
    }
    log(msg) {
        if (this.fnHistory.length === 0) {
            if (msg)
                console.debug(msg, this.value);
            else
                console.debug("[PipeSync] INITIAL ->", this.value);
            return this;
        }
        if (msg)
            console.debug(msg, this.value);
        else
            console.debug(`[PipeSync] ${this.fnHistory[this.fnHistory.length - 1]} ->`, this.value);
        return this;
    }
    result() {
        return this.value;
    }
}
