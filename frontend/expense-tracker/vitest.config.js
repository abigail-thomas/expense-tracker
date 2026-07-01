import { defineConfig } from "vitest/config";

// Lean unit-test config for pure helpers (no DOM needed).
export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.test.{js,jsx}"],
  },
});
