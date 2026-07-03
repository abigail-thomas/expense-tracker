import express from "express";
import {
  registerUser,
  loginUser,
  getUserInfo,
  updateUserProfile,
  changePassword,
  deleteAccount,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/getUser", protect, getUserInfo);
router.put("/profile", protect, updateUserProfile);
router.put("/change-password", protect, changePassword);
router.delete("/account", protect, deleteAccount);

// Upload a profile image and return its public URL (authenticated only)
router.post("/upload-image", protect, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.status(200).json({ imageUrl });
});

export default router;
