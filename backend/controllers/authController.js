import jwt from "jsonwebtoken";
import User from "../models/User.js";

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
    res.status(500).json({ message: "Error registering user", error: err.message });
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
    res.status(500).json({ message: "Error logging in", error: err.message });
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
    res.status(500).json({ message: "Error fetching user", error: err.message });
  }
};

// @desc   Update the authenticated user's name / email / profile image
// @route  PUT /api/v1/auth/profile
export const updateUserProfile = async (req, res) => {
  const { fullName, email, profileImageUrl } = req.body;

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

    await user.save();

    // Return the fresh doc without the password hash (matches getUser shape).
    const updated = await User.findById(user._id).select("-password");
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating profile", error: err.message });
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
    res.status(500).json({ message: "Error changing password", error: err.message });
  }
};
