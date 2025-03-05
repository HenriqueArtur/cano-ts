import { execSync } from "node:child_process";
import path from "node:path";

const ROOT_DIR = process.cwd();
const TEST_APP_DIR = path.join(ROOT_DIR, "packages", "test-app");

function runTestsInTestApp() {
  console.log("🧪 running test into @cano-ts/test-app...");
  execSync("npm run test", { cwd: TEST_APP_DIR, stdio: "inherit" });
}

runTestsInTestApp();
