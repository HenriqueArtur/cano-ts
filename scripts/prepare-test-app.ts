import { execSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT_DIR = process.cwd();
const DIST_DIR = path.join(ROOT_DIR, "dist");
const TARGET_LIB_DIR = path.join(ROOT_DIR, "packages/test-app/libs/cano-ts");
const TEST_APP_DIR = path.join(ROOT_DIR, "packages/test-app");

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

  // Step 3: Create package.json in `packages/test-app`
  const packageJsonContent = {
    name: "@cano-ts/test-app",
    version: "1.0.0",
    dependencies: {
      "cano-ts": "file:./libs/cano-ts",
    },
    scripts: {
      test: "tsc --noEmit && node index.js",
    },
    devDependencies: {
      "@biomejs/biome": "catalog:",
      "@types/node": "catalog:",
      tslib: "catalog:",
      typescript: "catalog:",
      "vite-tsconfig-paths": "catalog:",
      vitest: "catalog:",
    },
  };

  const packageJsonPath = path.join(TEST_APP_DIR, "package.json");
  console.log("📝 Writing package.json to:", packageJsonPath);
  writeFileSync(packageJsonPath, JSON.stringify(packageJsonContent, null, 2));

  console.log("✅ Build and setup completed successfully!");
}

prepareTestApp();
