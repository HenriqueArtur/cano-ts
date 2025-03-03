import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";

export function FactoryRollupConfigsObject(OUTPUT_DIR_PATH) {
  return [
    {
      input: "src/index.ts",
      output: [
        {
          dir: OUTPUT_DIR_PATH,
          format: "esm",
          entryFileNames: "[name].mjs",
          preserveModules: true,
        },
      ],
      plugins: [
        typescript({
          tsconfig: "./tsconfig.json",
        }),
      ],
    },
    {
      input: "src/index.ts",
      output: [
        {
          dir: OUTPUT_DIR_PATH,
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
