import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./tests/setup.js"],
    // Run test files sequentially: each spins up its own in-memory MongoDB,
    // which keeps memory/startup cost predictable in CI.
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
