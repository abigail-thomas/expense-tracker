import request from "supertest";
import app from "../app.js";

// Register a user and return { token, user } for authenticated requests.
export const createUser = async (overrides = {}) => {
  const payload = {
    fullName: "Test User",
    email: `user${Math.round(Math.random() * 1e9)}@example.com`,
    password: "password123",
    ...overrides,
  };
  const res = await request(app).post("/api/v1/auth/register").send(payload);
  return { token: res.body.token, user: res.body.user, res };
};

// Authorization header for a token.
export const auth = (token) => ({ Authorization: `Bearer ${token}` });
