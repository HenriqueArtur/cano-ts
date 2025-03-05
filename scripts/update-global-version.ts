import path from "node:path";
import fs from "node:fs"

const ROOT_DIR = process.cwd();
const ROOT_PKG_PATH = path.join(ROOT_DIR, "package.json");
const PIPE_PKG_PATH = path.join(ROOT_DIR, "packages", "core", "package.json");

function updateGlobalVersion() {
  const { name, version: root_version, ...root_pkg } = JSON.parse(
    fs.readFileSync(ROOT_PKG_PATH, "utf-8"),
  );
  const { version } = JSON.parse(
    fs.readFileSync(PIPE_PKG_PATH, "utf-8"),
  );
  fs.writeFileSync(ROOT_PKG_PATH, JSON.stringify({ name, version, ...root_pkg }, null, 2), "utf-8");
}

updateGlobalVersion()
