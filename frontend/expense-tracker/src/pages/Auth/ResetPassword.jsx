import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import AuthLayout from "../../components/AuthLayout";
import Input from "../../components/Inputs/Input";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // handle reset-password form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await axiosInstance.post(API_PATHS.AUTH.RESET_PASSWORD, {
        token,
        newPassword,
      });
      toast.success("Password reset successfully. Please log in.");
      navigate("/login");
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
        <h3 className="text-xl font-semibold text-black dark:text-white">Reset Password</h3>
        <p className="text-xs text-slate-700 dark:text-gray-400 mt-[5px] mb-6">
          Choose a new password for your account.
        </p>

        {!token ? (
          <>
            <p className="text-red-500 text-sm">
              This password reset link is invalid or incomplete. Please request
              a new one.
            </p>
            <p className="text-[13px] text-slate-800 dark:text-gray-300 mt-6">
              <Link
                className="font-medium text-primary underline"
                to="/forgot-password"
              >
                Request a new link
              </Link>
            </p>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <Input
              value={newPassword}
              onChange={({ target }) => setNewPassword(target.value)}
              label="New Password"
              placeholder="Minimum of 8 characters"
              type="password"
            />
            <Input
              value={confirmPassword}
              onChange={({ target }) => setConfirmPassword(target.value)}
              label="Confirm New Password"
              placeholder="Re-enter your new password"
              type="password"
            />

            {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
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

export default ResetPassword;
