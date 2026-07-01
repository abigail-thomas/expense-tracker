// Validate required environment variables on startup so the app fails fast with
// a clear message instead of silently mis-configuring (open CORS, broken JWT).
const REQUIRED = ["MONGO_URI", "JWT_SECRET"];

export const validateEnv = () => {
  const missing = REQUIRED.filter((key) => !process.env[key]);

  // In production the frontend origin MUST be pinned; without it CORS would
  // otherwise fall open to every origin. Required only in production so local
  // dev can rely on the localhost default.
  if (process.env.NODE_ENV === "production" && !process.env.CLIENT_URL) {
    missing.push("CLIENT_URL");
  }

  if (missing.length) {
    console.error(
      `Missing required environment variable(s): ${missing.join(", ")}.\n` +
        "Copy .env.example to .env (or set them in your host's dashboard) and restart."
    );
    process.exit(1);
  }
};
