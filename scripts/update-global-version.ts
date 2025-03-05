import path from "node:path";
import fs from "node:fs"
import { execSync } from "node:child_process";

const ROOT_DIR = process.cwd();
const ROOT_PKG_PATH = path.join(ROOT_DIR, "package.json");
const PIPE_PKG_PATH = path.join(ROOT_DIR, "packages", "core", "package.json");

function updateGlobalVersion() {
  console.log("⏳ Reading package.json files...");

  const { name, version: root_version, ...root_pkg } = JSON.parse(
    fs.readFileSync(ROOT_PKG_PATH, "utf-8"),
  );
  const { version } = JSON.parse(
    fs.readFileSync(PIPE_PKG_PATH, "utf-8"),
  );

  console.log(`📦 Current version in root package.json: ${root_version}`);
  console.log(`📦 Version from core package.json: ${version}`);

  console.log("✍️ Updating root package.json with new version...");
  fs.writeFileSync(ROOT_PKG_PATH, JSON.stringify({ name, version, ...root_pkg }, null, 2), "utf-8");

  console.log("⚡ Running linting...");
  execSync("pnpm run lint", { stdio: "inherit" });

  console.log("✅ Staging changes for commit...");
  execSync("git add .", { stdio: "inherit" });

  console.log(`✏️ Committing changes with message: "🔖 \`v${version}\`"`);
  execSync(`git commit -m "🔖 \`v${version}\`"`, { stdio: "inherit" });

  console.log("✔️ Version update completed successfully.");
}

updateGlobalVersion()
