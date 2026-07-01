import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../app.js";
import { createUser, auth } from "./helpers.js";

describe("income", () => {
  let token;
  beforeEach(async () => {
    ({ token } = await createUser());
  });

  it("adds an income entry", async () => {
    const res = await request(app)
      .post("/api/v1/income/add")
      .set(auth(token))
      .send({ source: "Salary", amount: 5000 });
    expect(res.status).toBe(200);
    expect(res.body.source).toBe("Salary");
    expect(res.body.amount).toBe(5000);
  });

  it("rejects income missing source or amount", async () => {
    const res = await request(app)
      .post("/api/v1/income/add")
      .set(auth(token))
      .send({ source: "Salary" });
    expect(res.status).toBe(400);
  });

  it("lists only the current user's income, newest first", async () => {
    await request(app)
      .post("/api/v1/income/add")
      .set(auth(token))
      .send({ source: "Old", amount: 100, date: "2020-01-01" });
    await request(app)
      .post("/api/v1/income/add")
      .set(auth(token))
      .send({ source: "New", amount: 200, date: "2024-01-01" });

    const res = await request(app).get("/api/v1/income/get").set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].source).toBe("New"); // sorted by date desc
  });

  it("does not leak another user's income", async () => {
    await request(app)
      .post("/api/v1/income/add")
      .set(auth(token))
      .send({ source: "Mine", amount: 100 });

    const { token: other } = await createUser();
    const res = await request(app).get("/api/v1/income/get").set(auth(other));
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });

  it("deletes an income entry", async () => {
    const add = await request(app)
      .post("/api/v1/income/add")
      .set(auth(token))
      .send({ source: "Temp", amount: 50 });
    const del = await request(app)
      .delete(`/api/v1/income/${add.body._id}`)
      .set(auth(token));
    expect(del.status).toBe(200);

    const list = await request(app).get("/api/v1/income/get").set(auth(token));
    expect(list.body).toHaveLength(0);
  });

  it("requires auth", async () => {
    const res = await request(app).get("/api/v1/income/get");
    expect(res.status).toBe(401);
  });
});
