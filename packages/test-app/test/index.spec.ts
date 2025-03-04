// @ts-expect-error - We expect this to fail if imported
import { pipe, pipeSync } from "cano-ts";
// @ts-expect-error - We expect this to fail if imported
import { Pipe, PipeSync } from "cano-ts/classes";
import { describe, expect, it } from "vitest";

describe("cano-ts exports", () => {
  it("should export pipe and pipeSync as functions", () => {
    expect(pipe).toBeTypeOf("function");
    expect(pipeSync).toBeTypeOf("function");
  });

  it("should not export Pipe and PipeSync from cano-ts/classes", () => {
    expect(() => Pipe).toThrowError();
    expect(() => PipeSync).toThrowError();
  });
});
