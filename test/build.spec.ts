import { exec } from "node:child_process";
import { promises } from "node:fs";
import { join } from "node:path";
import { promisify } from "node:util";
import { beforeAll, describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const execPromise = promisify(exec);
const BUILD_OUTPUT_DIR = "dist";

describe("Rollup Build", () => {
  const esm_dir = join(__dirname, `${BUILD_OUTPUT_DIR}`);
  const types_dir = join(__dirname, `${BUILD_OUTPUT_DIR}`);
  const pkg_json_dir = join(__dirname, `${BUILD_OUTPUT_DIR}`);

  beforeAll(async () => {
    await execPromise("pnpm run build:test");
  }, 10000);

  it("should create ESM files", async () => {
    const files = await promises.readdir(esm_dir);
    expect(files).toContain("index.mjs");
  });

  it("should create TypeScript declaration file", async () => {
    const files = await promises.readdir(types_dir);
    expect(files).toContain("index.d.ts");
  });

  it(`should copy "package.json" file to "${BUILD_OUTPUT_DIR}/"`, async () => {
    const files = await promises.readdir(pkg_json_dir);
    expect(files).toContain("package.json");
  });

  it(`should remove "prepare" from "scripts"`, () => {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(__dirname, BUILD_OUTPUT_DIR, "package.json"), "utf-8"),
    );
    expect(pkg.scripts.prepare).toBeUndefined();
  });
});
