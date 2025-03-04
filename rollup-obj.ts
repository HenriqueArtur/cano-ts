import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import copy from "rollup-plugin-copy";

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
        copy({
          targets: [{ src: "package.json", dest: output_dir }],
        }),
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
