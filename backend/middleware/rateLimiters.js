import rateLimit from "express-rate-limit";

// Disable throttling under test so the suite isn't rate-limited.
const skipInTest = () => process.env.NODE_ENV === "test";

// Tight limiter for auth endpoints (login/register) to blunt brute-force and
// credential-stuffing attempts. Keyed by IP.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: { message: "Too many attempts. Please try again later." },
});

// Looser catch-all limiter for the rest of the API.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: { message: "Too many requests. Please slow down." },
});
