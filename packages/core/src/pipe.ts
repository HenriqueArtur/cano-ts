import { PipeError } from "error";
import type { AsyncPipeFn, PipeConfig, PipeConfigArg, SyncPipeFn } from "types";

// Sync //

export function pipe<T>(value: T, config?: PipeConfigArg) {
  return new Pipe(value, setConfig(config));
}

class Pipe<T> {
  private value: Promise<T>;
  private fnHistory: string[];
  private config: PipeConfig;

  constructor(initialValue: T | Promise<T>, config: PipeConfig, fnHistory: string[] = []) {
    this.value = Promise.resolve(initialValue);
    this.config = config;
    this.fnHistory = fnHistory;
  }

  next<U, Args extends unknown[]>(fn: AsyncPipeFn<T, U, Args>, ...args: Args): Pipe<U> {
    const fnName = fn.name || "anonymous";
    const newHistory = [...this.fnHistory, fnName];
    return new Pipe(
      this.value
        .then((value) => {
          const result = fn(value, ...args);
          return Promise.resolve(result);
        })
        .catch((err) => {
          if (this.config.usePipeError) throw new PipeError(err, newHistory);
          throw err;
        }),
      this.config,
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
      this.config,
      this.fnHistory,
    );
  }

  async result(): Promise<T> {
    return this.value;
  }
}

// Async //

export function pipeSync<T>(value: T, config?: PipeConfigArg) {
  return new PipeSync(value, setConfig(config));
}

class PipeSync<T> {
  private value: T;
  private fnHistory: string[];
  private config: PipeConfig;

  constructor(initialValue: T, config: PipeConfig, fnHistory: string[] = []) {
    this.value = initialValue;
    this.config = config;
    this.fnHistory = fnHistory;
  }

  next<U, Args extends unknown[]>(fn: SyncPipeFn<T, U, Args>, ...args: Args): PipeSync<U> {
    const newHistory = [...this.fnHistory, fn.name || "anonymous"];
    try {
      return new PipeSync(fn(this.value, ...args), this.config, newHistory);
    } catch (err) {
      if (this.config.usePipeError) throw new PipeError(err, newHistory);
      throw err;
    }
  }

  log(msg?: string) {
    if (this.fnHistory.length === 0) {
      if (msg) console.debug(msg, this.value);
      else console.debug("[PipeSync] INITIAL ->", this.value);
      return this;
    }
    if (msg) console.debug(msg, this.value);
    else console.debug(`[PipeSync] ${this.fnHistory[this.fnHistory.length - 1]} ->`, this.value);
    return this;
  }

  result(): T {
    return this.value;
  }
}

// CONFIG //
function setConfig(config?: PipeConfigArg): PipeConfig {
  if (!config) return { usePipeError: true };
  return {
    usePipeError: config.usePipeError ?? true,
  };
}
