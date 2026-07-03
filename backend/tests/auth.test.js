import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";
import Income from "../models/Income.js";
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

  it("updates the user's name and email", async () => {
    const { token } = await createUser();
    const res = await request(app)
      .put("/api/v1/auth/profile")
      .set(auth(token))
      .send({ fullName: "New Name", email: "new-name@example.com" });
    expect(res.status).toBe(200);
    expect(res.body.fullName).toBe("New Name");
    expect(res.body.email).toBe("new-name@example.com");
    expect(res.body.password).toBeUndefined();
  });

  it("saves UI preferences (theme + monogram) via the profile endpoint", async () => {
    const { token } = await createUser();
    const res = await request(app)
      .put("/api/v1/auth/profile")
      .set(auth(token))
      .send({
        theme: "dark",
        monogramColor: "#2563eb",
        monogramCase: "lower",
        monogramTextSize: "lg",
      });
    expect(res.status).toBe(200);
    expect(res.body.theme).toBe("dark");
    expect(res.body.monogramColor).toBe("#2563eb");
    expect(res.body.monogramCase).toBe("lower");
    expect(res.body.monogramTextSize).toBe("lg");
  });

  it("defaults UI preferences for a new user", async () => {
    const { token } = await createUser();
    const res = await request(app).get("/api/v1/auth/getUser").set(auth(token));
    expect(res.body.theme).toBe("light");
    expect(res.body.monogramCase).toBe("upper");
    expect(res.body.monogramTextSize).toBe("md");
  });

  it("rejects an invalid preference value", async () => {
    const { token } = await createUser();
    const res = await request(app)
      .put("/api/v1/auth/profile")
      .set(auth(token))
      .send({ theme: "neon" });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it("rejects a profile email change that collides with another user", async () => {
    await createUser({ email: "taken@example.com" });
    const { token } = await createUser();
    const res = await request(app)
      .put("/api/v1/auth/profile")
      .set(auth(token))
      .send({ email: "taken@example.com" });
    expect(res.status).toBe(400);
  });

  it("changes the password when the current one is correct", async () => {
    await createUser({ email: "pw@example.com", password: "password123" });
    const login = () =>
      request(app)
        .post("/api/v1/auth/login")
        .send({ email: "pw@example.com", password: "newpassword456" });

    // Old password shouldn't log in yet.
    expect((await login()).status).toBe(400);

    const token = (
      await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "pw@example.com", password: "password123" })
    ).body.token;

    const res = await request(app)
      .put("/api/v1/auth/change-password")
      .set(auth(token))
      .send({ currentPassword: "password123", newPassword: "newpassword456" });
    expect(res.status).toBe(200);

    // New password now logs in (proves it was hashed via the save hook).
    expect((await login()).status).toBe(200);
  });

  it("rejects a password change when the current password is wrong", async () => {
    const { token } = await createUser();
    const res = await request(app)
      .put("/api/v1/auth/change-password")
      .set(auth(token))
      .send({ currentPassword: "wrong-password", newPassword: "newpassword456" });
    expect(res.status).toBe(400);
  });

  it("deletes the account and cascade-deletes the user's data", async () => {
    const { token, user } = await createUser({ password: "password123" });

    // Give the user some data that must be cleaned up.
    await request(app)
      .post("/api/v1/income/add")
      .set(auth(token))
      .send({ source: "Salary", amount: 5000 });
    expect(await Income.countDocuments({ userId: user.id })).toBe(1);

    const res = await request(app)
      .delete("/api/v1/auth/account")
      .set(auth(token))
      .send({ password: "password123" });
    expect(res.status).toBe(200);

    // The user's data is gone, and the token no longer resolves to a user
    // (protect middleware rejects a token whose user no longer exists).
    expect(await Income.countDocuments({ userId: user.id })).toBe(0);
    const after = await request(app)
      .get("/api/v1/auth/getUser")
      .set(auth(token));
    expect(after.status).toBe(401);
  });

  it("rejects account deletion with a wrong password", async () => {
    const { token, user } = await createUser({ password: "password123" });
    const res = await request(app)
      .delete("/api/v1/auth/account")
      .set(auth(token))
      .send({ password: "not-the-password" });
    expect(res.status).toBe(400);

    // Account must still exist.
    const after = await request(app)
      .get("/api/v1/auth/getUser")
      .set(auth(token));
    expect(after.status).toBe(200);
    expect(after.body.email).toBe(user.email);
  });
});
