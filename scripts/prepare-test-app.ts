import { execSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";

const ROOT_DIR = process.cwd();
const DIST_DIR = path.join(ROOT_DIR, "dist");
const TEST_APP_DIR = path.join(ROOT_DIR, "packages", "test-app");
const TARGET_LIB_DIR = path.join(ROOT_DIR, "packages", "test-app", "libs", "cano-ts");

function prepareTestApp() {
  // Step 1: Run `pnpm run build`
  console.log("🔨 Running build command...");
  execSync("pnpm run build", { stdio: "inherit" });

  // Step 2: Ensure target directory exists and move dist
  if (existsSync(TARGET_LIB_DIR)) {
    console.log("🗑️ Cleaning existing library directory...");
    rmSync(TARGET_LIB_DIR, { recursive: true, force: true });
  }

  mkdirSync(TARGET_LIB_DIR, { recursive: true });

  // Function to copy files recursively
  function copyRecursive(src: string, dest: string) {
    mkdirSync(dest, { recursive: true });

    for (const file of readdirSync(src)) {
      const srcPath = path.join(src, file);
      const destPath = path.join(dest, file);

      if (existsSync(srcPath) && !existsSync(destPath)) {
        copyFileSync(srcPath, destPath);
      }
    }
  }

  console.log("📦 Copying dist to:", TARGET_LIB_DIR);
  copyRecursive(DIST_DIR, TARGET_LIB_DIR);

  // Step 3: Run `pnpm install --filter=@cano-ts/test-app`
  console.log("📥 Installing dependencies for @cano-ts/test-app...");
  process.chdir(TEST_APP_DIR);
  execSync("npm i", { cwd: TEST_APP_DIR, stdio: "inherit" });
  process.chdir(ROOT_DIR);

  console.log("✅ Build and setup completed successfully!");
}

prepareTestApp();
