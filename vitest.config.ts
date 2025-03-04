import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    preserveSymlinks: true,
  },
  plugins: [tsconfigPaths()],
  test: {
    include: ["src/**/*.spec.ts"],
    exclude: ["test/**"],
  },
});
