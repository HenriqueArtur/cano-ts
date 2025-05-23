import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    preserveSymlinks: true,
  },
  plugins: [tsconfigPaths()],
  test: {
    include: ["test/**/*.spec.ts"],
    exclude: ["test/dist/**"],
  },
});
