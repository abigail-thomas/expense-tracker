import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";
import { createUser, auth } from "./helpers.js";

describe("auth", () => {
  it("registers a new user and returns a token", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      fullName: "Ada Lovelace",
      email: "ada@example.com",
      password: "password123",
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe("ada@example.com");
    // Password must never be returned.
    expect(res.body.user.password).toBeUndefined();
  });

  it("rejects registration with missing fields", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ email: "x@example.com" });
    expect(res.status).toBe(400);
  });

  it("rejects a password shorter than 8 characters", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      fullName: "Short Pw",
      email: "short@example.com",
      password: "1234567",
    });
    expect(res.status).toBe(400);
  });

  it("rejects a duplicate email", async () => {
    await createUser({ email: "dup@example.com" });
    const res = await request(app).post("/api/v1/auth/register").send({
      fullName: "Dup",
      email: "dup@example.com",
      password: "password123",
    });
    expect(res.status).toBe(400);
  });

  it("logs in with correct credentials", async () => {
    await createUser({ email: "login@example.com", password: "password123" });
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "login@example.com", password: "password123" });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
  });

  it("rejects login with a wrong password", async () => {
    await createUser({ email: "wrong@example.com", password: "password123" });
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "wrong@example.com", password: "nope-wrong" });
    expect(res.status).toBe(400);
  });

  it("blocks a protected route without a token", async () => {
    const res = await request(app).get("/api/v1/auth/getUser");
    expect(res.status).toBe(401);
  });

  it("allows a protected route with a valid token", async () => {
    const { token } = await createUser();
    const res = await request(app).get("/api/v1/auth/getUser").set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.email).toBeTruthy();
  });
});
