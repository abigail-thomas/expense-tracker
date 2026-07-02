import express from "express";
import {
  getGoalCategories,
  addGoalCategory,
  updateGoalCategory,
  deleteGoalCategory,
} from "../controllers/goalCategoryController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/get", protect, getGoalCategories);
router.post("/add", protect, addGoalCategory);
router.put("/:id", protect, updateGoalCategory);
router.delete("/:id", protect, deleteGoalCategory);

export default router;
