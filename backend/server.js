import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import incomeRoutes from "./routes/incomeRoutes.js";
import incomeSourceRoutes from "./routes/incomeSourceRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import fundRoutes from "./routes/fundRoutes.js";
import creditCardRoutes from "./routes/creditCardRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import { startInterestScheduler } from "./services/interestService.js";
import { startSubscriptionScheduler } from "./services/subscriptionService.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware to handle CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Connect to database
connectDB();

// Automatically credit monthly interest to savings funds (last day of month).
startInterestScheduler();

// Automatically post recurring subscription charges as they come due.
startSubscriptionScheduler();

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/income", incomeRoutes);
app.use("/api/v1/income-source", incomeSourceRoutes);
app.use("/api/v1/expense", expenseRoutes);
app.use("/api/v1/fund", fundRoutes);
app.use("/api/v1/credit-card", creditCardRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/subscription", subscriptionRoutes);

// Serve uploaded profile images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Simple health check
app.get("/", (req, res) => {
  res.send("Expense Tracker API is running");
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
