import React from "react";
import { Link } from "react-router-dom";

// Catch-all page for unknown client-side routes.
const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-3xl font-semibold">404</h1>
      <p className="text-sm text-gray-500">
        The page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white"
      >
        Go home
      </Link>
    </div>
  );
};

export default NotFound;
