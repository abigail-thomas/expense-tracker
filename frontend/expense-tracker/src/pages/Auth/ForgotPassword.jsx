import React, { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout";
import Input from "../../components/Inputs/Input";
import { validateEmail } from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // handle forgot-password form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await axiosInstance.post(API_PATHS.AUTH.FORGOT_PASSWORD, { email });
      // The backend always responds the same way (it won't reveal whether the
      // email is registered), so we just show a generic confirmation.
      setSubmitted(true);
    } catch (err) {
      if (err.response && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="lg:w-[70%] h-3/4 md:h-full flex flex-col justify-center">
        <h3 className="text-xl font-semibold text-black dark:text-white">Forgot Password</h3>
        <p className="text-xs text-slate-700 dark:text-gray-400 mt-[5px] mb-6">
          Enter your email and we'll send you a link to reset your password.
        </p>

        {submitted ? (
          <>
            <p className="text-sm text-slate-700 dark:text-gray-400">
              If an account with that email exists, a password reset link has
              been sent. The link is valid for 1 hour.
            </p>
            <p className="text-[13px] text-slate-800 dark:text-gray-300 mt-6">
              <Link className="font-medium text-primary underline" to="/login">
                Back to Login
              </Link>
            </p>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <Input
              value={email}
              onChange={({ target }) => setEmail(target.value)}
              label="Email Address"
              placeholder="john@example.com"
              type="text"
            />

            {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <p className="text-[13px] text-slate-800 dark:text-gray-300 mt-3">
              Remember your password?{"  "}
              <Link className="font-medium text-primary underline" to="/login">
                Back to Login
              </Link>
            </p>
          </form>
        )}
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
