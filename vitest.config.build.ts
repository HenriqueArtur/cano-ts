import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    preserveSymlinks: true,
  },
  test: {
    include: ["test/**/*.spec.ts"],
    exclude: ["test/dist/**"],
  },
});
