import dotenv from "dotenv";

import app from "./app.js";
import connectDB from "./config/db.js";
import { validateEnv } from "./config/env.js";
import { startInterestScheduler } from "./services/interestService.js";
import { startSubscriptionScheduler } from "./services/subscriptionService.js";

dotenv.config();

// Fail fast if required config is missing (see config/env.js).
validateEnv();

// Connect to database
connectDB();

// Automatically credit monthly interest to savings funds (last day of month).
startInterestScheduler();

// Automatically post recurring subscription charges as they come due.
startSubscriptionScheduler();

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
