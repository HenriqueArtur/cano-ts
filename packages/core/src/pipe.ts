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

  async log(): Promise<this> {
    console.log(`[PipeAsync] ${this.lastFnName} ->`, await this.value);
    return this;
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

  log(): this {
    console.log(`[PipeSync] ${this.lastFnName} ->`, this.value);
    return this;
  }

  result(): T {
    return this.value;
  }
}
