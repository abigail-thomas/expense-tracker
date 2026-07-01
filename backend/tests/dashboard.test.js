import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../app.js";
import { createUser, auth } from "./helpers.js";

describe("dashboard", () => {
  let token;
  beforeEach(async () => {
    ({ token } = await createUser());
  });

  it("aggregates total income and expense correctly", async () => {
    await request(app)
      .post("/api/v1/income/add")
      .set(auth(token))
      .send({ source: "Salary", amount: 5000 });
    await request(app)
      .post("/api/v1/income/add")
      .set(auth(token))
      .send({ source: "Bonus", amount: 1000 });
    await request(app)
      .post("/api/v1/expense/add")
      .set(auth(token))
      .send({ category: "Rent", amount: 1500 });
    await request(app)
      .post("/api/v1/expense/add")
      .set(auth(token))
      .send({ category: "Food", amount: 500 });

    const res = await request(app).get("/api/v1/dashboard").set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.totalIncome).toBe(6000);
    expect(res.body.totalExpense).toBe(2000);
    expect(Array.isArray(res.body.recentTransactions)).toBe(true);
    expect(res.body.recentTransactions.length).toBe(4);
  });

  it("returns zeroed totals for a fresh user", async () => {
    const res = await request(app).get("/api/v1/dashboard").set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.totalIncome).toBe(0);
    expect(res.body.totalExpense).toBe(0);
    expect(res.body.totalBalance).toBe(0);
  });

  it("requires auth", async () => {
    const res = await request(app).get("/api/v1/dashboard");
    expect(res.status).toBe(401);
  });
});
