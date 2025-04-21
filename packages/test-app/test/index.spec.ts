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
