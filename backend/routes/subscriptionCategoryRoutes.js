import express from "express";
import {
  getSubscriptionCategories,
  addSubscriptionCategory,
  updateSubscriptionCategory,
  deleteSubscriptionCategory,
} from "../controllers/subscriptionCategoryController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/get", protect, getSubscriptionCategories);
router.post("/add", protect, addSubscriptionCategory);
router.put("/:id", protect, updateSubscriptionCategory);
router.delete("/:id", protect, deleteSubscriptionCategory);

export default router;
