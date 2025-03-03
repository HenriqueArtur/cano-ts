import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    preserveSymlinks: true,
  },
  test: {
    globals: true,
    include: ["src/**/*.spec.ts"],
    exclude: ["test/**"],
  },
});
