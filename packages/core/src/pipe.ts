import { Pipe, PipeSync } from "classes";

export function pipe<T>(value: T) {
  return new Pipe(value);
}

export function pipeSync<T>(value: T) {
  return new PipeSync(value);
}
