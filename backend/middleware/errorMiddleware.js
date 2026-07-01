// Centralised error handling. Keeps internal error details out of client
// responses in production while still logging them server-side.

const isProd = () => process.env.NODE_ENV === "production";

// Helper for controller catch blocks: log the real error, return a generic
// message to the client, and only include `error` details outside production.
export const serverError = (res, err, message = "Something went wrong") => {
  console.error(`${message}:`, err);
  const body = { message };
  if (!isProd()) body.error = err?.message;
  return res.status(500).json(body);
};

// 404 handler for unknown routes — must be registered after all routes.
export const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

// Global error-handling middleware — must be the LAST app.use. Catches errors
// passed via next(err) and anything thrown in async handlers that reaches here.
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  console.error("Unhandled error:", err);
  const status = err.statusCode || err.status || 500;
  const body = { message: err.publicMessage || "Something went wrong" };
  if (!isProd()) body.error = err.message;
  res.status(status).json(body);
};
