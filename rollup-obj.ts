import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import fs from "node:fs";
import path from "node:path";

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
            if (!fs.existsSync(output_dir)) {
              fs.mkdirSync(output_dir, { recursive: true });
            }
            const {
              scripts: { prepare, ...pkg_scripts },
              ...pkg
            } = JSON.parse(fs.readFileSync("package.json", "utf-8"));
            const pkg_widout_prepare = {
              ...pkg,
              scripts: pkg_scripts,
            };
            fs.writeFileSync(
              path.join(output_dir, "package.json"),
              JSON.stringify(pkg_widout_prepare, null, 2),
            );
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
