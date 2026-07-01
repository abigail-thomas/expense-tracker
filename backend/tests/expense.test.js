import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../app.js";
import { createUser, auth } from "./helpers.js";

describe("expense", () => {
  let token;
  beforeEach(async () => {
    ({ token } = await createUser());
  });

  it("adds an expense entry (defaults to debit)", async () => {
    const res = await request(app)
      .post("/api/v1/expense/add")
      .set(auth(token))
      .send({ category: "Groceries", amount: 75.5 });
    expect(res.status).toBe(200);
    expect(res.body.category).toBe("Groceries");
    expect(res.body.amount).toBe(75.5);
    expect(res.body.method).toBe("debit");
  });

  it("rejects an expense missing category or amount", async () => {
    const res = await request(app)
      .post("/api/v1/expense/add")
      .set(auth(token))
      .send({ category: "Groceries" });
    expect(res.status).toBe(400);
  });

  it("updates an expense", async () => {
    const add = await request(app)
      .post("/api/v1/expense/add")
      .set(auth(token))
      .send({ category: "Rent", amount: 1000 });
    const upd = await request(app)
      .put(`/api/v1/expense/${add.body._id}`)
      .set(auth(token))
      .send({ category: "Rent", amount: 1200 });
    expect(upd.status).toBe(200);
    expect(upd.body.amount).toBe(1200);
  });

  it("deletes an expense", async () => {
    const add = await request(app)
      .post("/api/v1/expense/add")
      .set(auth(token))
      .send({ category: "Coffee", amount: 5 });
    const del = await request(app)
      .delete(`/api/v1/expense/${add.body._id}`)
      .set(auth(token));
    expect(del.status).toBe(200);

    const list = await request(app).get("/api/v1/expense/get").set(auth(token));
    expect(list.body).toHaveLength(0);
  });

  it("404s when updating an expense that isn't yours", async () => {
    const add = await request(app)
      .post("/api/v1/expense/add")
      .set(auth(token))
      .send({ category: "Mine", amount: 10 });

    const { token: other } = await createUser();
    const res = await request(app)
      .put(`/api/v1/expense/${add.body._id}`)
      .set(auth(other))
      .send({ category: "Hijack", amount: 999 });
    expect(res.status).toBe(404);
  });

  it("requires auth", async () => {
    const res = await request(app).get("/api/v1/expense/get");
    expect(res.status).toBe(401);
  });
});
