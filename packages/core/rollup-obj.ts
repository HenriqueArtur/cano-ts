import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import dts from "rollup-plugin-dts";
// TypeScript 7 is native and has no JS API: esbuild compiles, and rollup-plugin-dts writes the types
// with the API of @typescript/typescript6, kept beside it.
import esbuild from "rollup-plugin-esbuild";

export function FactoryRollupConfigsObject(output_dir) {
  return [
    {
      input: "src/index.ts",
      output: [
        {
          dir: `${output_dir}/esm/`,
          format: "esm",
          entryFileNames: "[name].mjs",
          preserveModules: true,
        },
        {
          dir: `${output_dir}/cjs/`,
          format: "cjs",
          entryFileNames: "[name].cjs",
          preserveModules: true,
        },
      ],
      plugins: [
        esbuild({
          tsconfig: "./tsconfig.json",
          // The tsconfig's target: esbuild's own default (es2017) would rewrite the class fields.
          target: "es2022",
        }),
        {
          name: "copy-package-json",
          buildStart: () => copyPkg(output_dir),
        },
        {
          name: "copy-readme",
          buildEnd() {
            const readme_src = path.join("..", "..", "README.md");
            const readme_dest = path.join(output_dir, "README.md");
            fs.copyFileSync(readme_src, readme_dest);
          },
        },
      ],
    },
    {
      input: "src/index.ts",
      output: [
        {
          dir: `${output_dir}/types/`,
          format: "es",
          preserveModules: true,
        },
      ],
      plugins: [
        dts({
          tsconfig: "./tsconfig.types.json",
        }),
      ],
    },
  ];
}

function copyPkg(output_dir) {
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
  const resolved_packages = JSON.parse(execSync("pnpm list --json --recursive").toString());
  const [resolved_cano_ts] = resolved_packages.filter((p) => p.name === PKG_ORIGINAL_NAME);
  const parsed_dev_dependencies = {};
  for (const key in devDependencies) {
    parsed_dev_dependencies[key] = resolved_cano_ts.devDependencies[key].version;
  }
  const pkg_without_prepare = {
    name: PKG_NAME,
    ...pkg,
    scripts: pkg_scripts,
    devDependencies: parsed_dev_dependencies,
  };
  fs.writeFileSync(pkg_path, JSON.stringify(pkg_without_prepare, null, 2));
}
