import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";

export function FactoryRollupConfigsObject(output_dir) {
  return [
    {
      input: "src/index.ts",
      output: [
        {
          dir: output_dir,
          format: "esm",
          entryFileNames: "[name].mjs",
          preserveModules: true,
        },
      ],
      plugins: [
        typescript({
          tsconfig: "./tsconfig.json",
        }),
        {
          name: "copy-package-json",
          buildStart() {
            const PKG_NAME = "cano-ts";
            const PKG_ORIGINAL_NAME = "@cano-ts/core";
            if (!fs.existsSync(output_dir)) {
              fs.mkdirSync(output_dir, { recursive: true });
            }
            const pkg_path = path.join(output_dir, "package.json");
            const {
              name,
              scripts: { prepare, ...pkg_scripts },
              devDependencies,
              ...pkg
            } = JSON.parse(fs.readFileSync("package.json", "utf-8"));
            const resolved_packages = JSON.parse(
              execSync("pnpm list --json --recursive").toString(),
            );
            const [resolved_cano_ts] = resolved_packages.filter(
              (p) => p.name === PKG_ORIGINAL_NAME,
            );
            const parsed_dev_dependencies = {};
            for (const key in devDependencies) {
              parsed_dev_dependencies[key] = resolved_cano_ts.devDependencies[key].version;
            }
            const pkg_widout_prepare = {
              name: PKG_NAME,
              ...pkg,
              scripts: pkg_scripts,
              devDependencies: parsed_dev_dependencies,
            };
            fs.writeFileSync(pkg_path, JSON.stringify(pkg_widout_prepare, null, 2));
          },
        },
      ],
    },
    {
      input: "src/index.ts",
      output: [
        {
          dir: output_dir,
          format: "es",
          preserveModules: true,
        },
      ],
      plugins: [
        dts(),
        typescript({
          tsconfig: "./tsconfig.types.json",
        }),
      ],
    },
  ];
}
