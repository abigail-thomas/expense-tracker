import React from 'react'

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Login from "./pages/Auth/Login";
import SignUp from "./pages/Auth/SignUp";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import Home from "./pages/Dashboard/Home";
import Income from "./pages/Dashboard/Income";
import Expense from "./pages/Dashboard/Expense";
import Subscriptions from "./pages/Dashboard/Subscriptions";
import Insights from "./pages/Dashboard/Insights";
import IncomeVsExpense from "./pages/Dashboard/IncomeVsExpense";
import CategoryBreakdown from "./pages/Dashboard/CategoryBreakdown";
import Goals from "./pages/Dashboard/Goals";
import Profile from "./pages/Dashboard/Profile";
import Settings from "./pages/Dashboard/Settings";
import NotFound from "./pages/NotFound";

import UserProvider from "./context/UserProvider";
import ThemeProvider from "./context/ThemeProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import ScrollToTop from "./components/ScrollToTop";

const App = () => {
  return (
    <ErrorBoundary>
      <UserProvider>
      <ThemeProvider>
      <div>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Root />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Routes that require a logged-in user */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Home />} />
              <Route path="/income" element={<Income />} />
              <Route path="/expense" element={<Expense />} />
              <Route path="/subscriptions" element={<Subscriptions />} />
              <Route path="/insights" element={<Insights />} />
              <Route
                path="/insights/income-vs-expense"
                element={<IncomeVsExpense />}
              />
              <Route
                path="/insights/category-breakdown"
                element={<CategoryBreakdown />}
              />
              <Route path="/goals" element={<Goals />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Catch-all for unknown routes */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </div>

      <Toaster
        toastOptions={{
          className: "",
          style: { fontSize: "13px" },
        }}
      />
      </ThemeProvider>
      </UserProvider>
    </ErrorBoundary>
  );
};

export default App;

const Root = () => {
  // check if the token exists in localStorage
  const isAuthenticated = !!localStorage.getItem("token");

  // redirect to dashboard if authenticated, else to login
  return isAuthenticated ? (
    <Navigate to="/dashboard" />
  ) : (
    <Navigate to="/login" />
  );
};
