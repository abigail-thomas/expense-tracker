import express from "express";
import {
  getSubscriptions,
  addSubscription,
  updateSubscription,
  deleteSubscription,
  chargeNowSubscription,
} from "../controllers/subscriptionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/get", protect, getSubscriptions);
router.post("/add", protect, addSubscription);
router.post("/:id/charge", protect, chargeNowSubscription);
router.put("/:id", protect, updateSubscription);
router.delete("/:id", protect, deleteSubscription);

export default router;
