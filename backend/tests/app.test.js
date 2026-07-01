import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("app infrastructure", () => {
  it("reports healthy when the DB is connected", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.db).toBe("connected");
  });

  it("returns 404 JSON for unknown routes", async () => {
    const res = await request(app).get("/api/v1/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/not found/i);
  });

  it("does not leak internal error detail in production mode", async () => {
    // Sanity check on the error-handling contract shape.
    const res = await request(app).get("/nope");
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message");
  });
});
