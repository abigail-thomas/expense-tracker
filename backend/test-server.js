// Standalone backend launcher for end-to-end tests. Boots the real Express app
// against a throwaway in-memory MongoDB and does NOT start the schedulers, so
// e2e runs never touch the real Atlas database or post real charges.
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "./app.js";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "e2e-secret";

const mongo = await MongoMemoryServer.create();
await mongoose.connect(mongo.getUri());

const port = process.env.PORT || 8001;
app.listen(port, () => console.log(`E2E backend running on port ${port}`));

// Clean up the in-memory server on shutdown.
const shutdown = async () => {
  await mongoose.disconnect();
  await mongo.stop();
  process.exit(0);
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
