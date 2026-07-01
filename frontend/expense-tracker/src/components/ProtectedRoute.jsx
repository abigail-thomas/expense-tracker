import React from "react";
import { Navigate, Outlet } from "react-router-dom";

// Guards nested routes: only renders them if a token is present, else redirects to /login.
const ProtectedRoute = () => {
  const isAuthenticated = !!localStorage.getItem("token");
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
