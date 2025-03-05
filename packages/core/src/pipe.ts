import type { AsyncPipeFn, SyncPipeFn } from "types";

export function pipe<T>(value: T) {
  return new Pipe(value);
}
class Pipe<T> {
  private value: Promise<T>;
  private lastFnName = "INITIAL";

  constructor(initialValue: T | Promise<T>) {
    this.value = Promise.resolve(initialValue);
  }

  next<U, Args extends unknown[]>(fn: AsyncPipeFn<T, U, Args>, ...args: Args): Pipe<U> {
    const instance = new Pipe(
      this.value.then((value) => {
        const result = fn(value, ...args);
        return Promise.resolve(result);
      }),
    );
    instance.lastFnName = fn.name || "anonymous";
    return instance;
  }

  log(msg?: string) {
    return new Pipe(
      this.value.then(async (val) => {
        if (msg) console.log(msg, val);
        else console.log(`[PipeAsync] ${this.lastFnName} ->`, val);
        return val;
      }),
    );
  }

  async result(): Promise<T> {
    return this.value;
  }
}

export function pipeSync<T>(value: T) {
  return new PipeSync(value);
}

class PipeSync<T> {
  private value: T;
  private lastFnName = "INITIAL";

  constructor(initialValue: T) {
    this.value = initialValue;
  }

  next<U, Args extends unknown[]>(fn: SyncPipeFn<T, U, Args>, ...args: Args): PipeSync<U> {
    const instance = new PipeSync(fn(this.value, ...args));
    instance.lastFnName = fn.name || "anonymous";
    return instance;
  }

  log(msg?: string) {
    if (msg) console.log(msg, this.value);
    else console.log(`[PipeSync] ${this.lastFnName} ->`, this.value);
    return this;
  }

  result(): T {
    return this.value;
  }
}
