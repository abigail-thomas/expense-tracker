import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Income from "../models/Income.js";
import IncomeSource from "../models/IncomeSource.js";
import Expense from "../models/Expense.js";
import ExpenseCategory from "../models/ExpenseCategory.js";
import Fund from "../models/Fund.js";
import Subscription from "../models/Subscription.js";
import SubscriptionCategory from "../models/SubscriptionCategory.js";
import Goal from "../models/Goal.js";
import GoalCategory from "../models/GoalCategory.js";
import CreditCard from "../models/CreditCard.js";
import { serverError } from "../middleware/errorMiddleware.js";
import { sendEmail } from "../utils/sendEmail.js";

// Generate a signed JWT for a user id (valid for 7 days)
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @desc   Register a new user
// @route  POST /api/v1/auth/register
export const registerUser = async (req, res) => {
  const { fullName, email, password, profileImageUrl } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (password.length < 8) {
    return res
      .status(400)
      .json({ message: "Password must be at least 8 characters" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const user = await User.create({
      fullName,
      email,
      password,
      profileImageUrl,
    });

    res.status(201).json({
      id: user._id,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
      },
      token: generateToken(user._id),
    });
  } catch (err) {
    serverError(res, err, "Error registering user");
  }
};

// @desc   Authenticate a user & return a token
// @route  POST /api/v1/auth/login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    res.status(200).json({
      id: user._id,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
      },
      token: generateToken(user._id),
    });
  } catch (err) {
    serverError(res, err, "Error logging in");
  }
};

// @desc   Get the currently authenticated user's profile
// @route  GET /api/v1/auth/getUser
export const getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    serverError(res, err, "Error fetching user");
  }
};

// @desc   Update the authenticated user's name / email / profile image / prefs
// @route  PUT /api/v1/auth/profile
export const updateUserProfile = async (req, res) => {
  const {
    fullName,
    email,
    profileImageUrl,
    theme,
    monogramColor,
    monogramCase,
    monogramTextSize,
  } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If the email is changing, make sure it isn't already taken.
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email;
    }

    if (fullName !== undefined) user.fullName = fullName;
    if (profileImageUrl !== undefined) user.profileImageUrl = profileImageUrl;

    // UI preferences — only assign when provided; the schema enum validates the
    // allowed values (and rejects anything else on save).
    if (theme !== undefined) user.theme = theme;
    if (monogramColor !== undefined) user.monogramColor = monogramColor;
    if (monogramCase !== undefined) user.monogramCase = monogramCase;
    if (monogramTextSize !== undefined) user.monogramTextSize = monogramTextSize;

    await user.save();

    // Return the fresh doc without the password hash (matches getUser shape).
    const updated = await User.findById(user._id).select("-password");
    res.status(200).json(updated);
  } catch (err) {
    serverError(res, err, "Error updating profile");
  }
};

// @desc   Change the authenticated user's password
// @route  PUT /api/v1/auth/change-password
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Current and new password are required" });
  }
  if (newPassword.length < 8) {
    return res
      .status(400)
      .json({ message: "New password must be at least 8 characters" });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Assigning + save() triggers the pre-save hook, which re-hashes the
    // password. (findByIdAndUpdate would skip the hook and store plaintext.)
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    serverError(res, err, "Error changing password");
  }
};

// @desc   Start a password reset: email the user a time-limited reset link
// @route  POST /api/v1/auth/forgot-password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  // Respond identically whether or not the email has an account, so this
  // endpoint can't be used to discover which emails are registered.
  const genericResponse = {
    message:
      "If an account with that email exists, a password reset link has been sent.",
  };

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json(genericResponse);
    }

    // Store only a hash of the token; the raw token goes in the emailed link.
    const rawToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${clientUrl}/reset-password?token=${rawToken}`;

    await sendEmail({
      to: user.email,
      subject: "Reset your password",
      text:
        "You requested a password reset.\n\n" +
        `Open this link to choose a new password (valid for 1 hour):\n${resetUrl}\n\n` +
        "If you didn't request this, you can safely ignore this email.",
      html:
        "<p>You requested a password reset.</p>" +
        `<p><a href="${resetUrl}">Click here to choose a new password</a> (valid for 1 hour).</p>` +
        "<p>If you didn't request this, you can safely ignore this email.</p>",
    });

    res.status(200).json(genericResponse);
  } catch (err) {
    serverError(res, err, "Error starting password reset");
  }
};

// @desc   Complete a password reset using the token from the emailed link
// @route  POST /api/v1/auth/reset-password
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res
      .status(400)
      .json({ message: "Token and new password are required" });
  }
  if (newPassword.length < 8) {
    return res
      .status(400)
      .json({ message: "New password must be at least 8 characters" });
  }

  try {
    // Match the stored hash and require the token to be unexpired.
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Password reset link is invalid or has expired" });
    }

    // Assigning + save() triggers the pre-save hook, which re-hashes the
    // password. Clear the reset fields so the link can't be reused.
    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (err) {
    serverError(res, err, "Error resetting password");
  }
};

// Every collection that stores documents keyed to a user. Deleting an account
// must clear all of these or we orphan the user's data in Mongo.
const USER_OWNED_MODELS = [
  Income,
  IncomeSource,
  Expense,
  ExpenseCategory,
  Fund,
  Subscription,
  SubscriptionCategory,
  Goal,
  GoalCategory,
  CreditCard,
];

// @desc   Permanently delete the authenticated user's account and all their data
// @route  DELETE /api/v1/auth/account
export const deleteAccount = async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res
      .status(400)
      .json({ message: "Password is required to delete your account" });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Re-confirm identity before an irreversible action.
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password is incorrect" });
    }

    // Cascade-delete every collection keyed to this user, then the user.
    await Promise.all(
      USER_OWNED_MODELS.map((Model) => Model.deleteMany({ userId: user._id }))
    );
    await user.deleteOne();

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (err) {
    serverError(res, err, "Error deleting account");
  }
};
