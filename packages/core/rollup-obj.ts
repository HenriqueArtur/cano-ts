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
            if (!fs.existsSync(output_dir)) {
              fs.mkdirSync(output_dir, { recursive: true });
            }
            const pkg_path = path.join(output_dir, "package.json");
            const {
              name,
              scripts: { prepare, ...pkg_scripts },
              ...pkg
            } = JSON.parse(fs.readFileSync("package.json", "utf-8"));
            const pkg_widout_prepare = {
              name: PKG_NAME,
              ...pkg,
              scripts: pkg_scripts,
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
