import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";

import { authLimiter, apiLimiter } from "./middleware/rateLimiters.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import incomeRoutes from "./routes/incomeRoutes.js";
import incomeSourceRoutes from "./routes/incomeSourceRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import expenseCategoryRoutes from "./routes/expenseCategoryRoutes.js";
import fundRoutes from "./routes/fundRoutes.js";
import creditCardRoutes from "./routes/creditCardRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import subscriptionCategoryRoutes from "./routes/subscriptionCategoryRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import goalCategoryRoutes from "./routes/goalCategoryRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Build and return the configured Express app. Contains NO side effects
// (no DB connection, no schedulers, no listen) so tests can import it directly.
const app = express();

// Security headers.
app.use(helmet());

// Lock CORS to the configured frontend origin. In production CLIENT_URL is
// required (validateEnv enforces it); locally it defaults to the Vite dev
// server. No more silent "*" fallback.
const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";
app.use(
  cors({
    origin: allowedOrigin,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Rate limit the whole API, with a tighter limit on auth endpoints.
app.use("/api/v1/auth/login", authLimiter);
app.use("/api/v1/auth/register", authLimiter);
app.use("/api/v1/auth/forgot-password", authLimiter);
app.use("/api/v1/auth/reset-password", authLimiter);
app.use("/api/v1", apiLimiter);

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/income", incomeRoutes);
app.use("/api/v1/income-source", incomeSourceRoutes);
app.use("/api/v1/expense", expenseRoutes);
app.use("/api/v1/expense-category", expenseCategoryRoutes);
app.use("/api/v1/fund", fundRoutes);
app.use("/api/v1/credit-card", creditCardRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/subscription", subscriptionRoutes);
app.use("/api/v1/subscription-category", subscriptionCategoryRoutes);
app.use("/api/v1/goal", goalRoutes);
app.use("/api/v1/goal-category", goalCategoryRoutes);

// Serve uploaded profile images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Simple root check
app.get("/", (req, res) => {
  res.send("Personal Finance Manager API is running");
});

// Structured health check (status + DB connection state) for uptime monitors
// and keep-alive pings.
app.get("/health", (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? "ok" : "degraded",
    db: dbConnected ? "connected" : "disconnected",
    uptime: process.uptime(),
  });
});

// Unknown routes -> 404, then the global error handler (must be last).
app.use(notFound);
app.use(errorHandler);

export default app;
