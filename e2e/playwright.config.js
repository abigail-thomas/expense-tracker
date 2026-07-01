import { defineConfig, devices } from "@playwright/test";

// E2E runs the full stack on dedicated ports so it never collides with a
// normal dev session (backend 8000 / frontend 5173):
//   - backend  -> test-server.js on 8001, backed by an in-memory MongoDB
//   - frontend -> vite dev on 5174, pointed at the test backend
// CLIENT_URL / VITE_API_BASE_URL are wired so CORS matches across the two.
const BACKEND_PORT = 8001;
const FRONTEND_PORT = 5174;
const FRONTEND_URL = `http://localhost:${FRONTEND_PORT}`;

export default defineConfig({
  testDir: "./tests",
  timeout: 30000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  workers: 1,
  reporter: process.env.CI ? "list" : "html",
  use: {
    baseURL: FRONTEND_URL,
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: [
    {
      command: "node test-server.js",
      cwd: "../backend",
      port: BACKEND_PORT,
      reuseExistingServer: !process.env.CI,
      timeout: 60000,
      env: {
        PORT: String(BACKEND_PORT),
        CLIENT_URL: FRONTEND_URL,
        JWT_SECRET: "e2e-secret",
      },
    },
    {
      command: `npm run dev -- --port ${FRONTEND_PORT} --strictPort`,
      cwd: "../frontend/expense-tracker",
      port: FRONTEND_PORT,
      reuseExistingServer: !process.env.CI,
      timeout: 60000,
      env: {
        VITE_API_BASE_URL: `http://localhost:${BACKEND_PORT}`,
      },
    },
  ],
});
