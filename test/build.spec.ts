import { exec } from "node:child_process";
import { promises as fs } from "node:fs";
import { join } from "node:path";
import { promisify } from "node:util";
import { beforeAll, describe, expect, it } from "vitest";

const execPromise = promisify(exec);
const BUILD_OUTPUT_DIR = "dist";

describe("Rollup Build", () => {
  const esm_dir = join(__dirname, `${BUILD_OUTPUT_DIR}`);
  const types_dir = join(__dirname, `${BUILD_OUTPUT_DIR}`);

  beforeAll(async () => {
    await execPromise("pnpm run build:test");
  }, 10000);

  it("should create ESM files", async () => {
    const files = await fs.readdir(esm_dir);
    expect(files).toContain("index.mjs");
  });

  it("should create TypeScript declaration file", async () => {
    const files = await fs.readdir(types_dir);
    expect(files).toContain("index.d.ts");
  });
});
