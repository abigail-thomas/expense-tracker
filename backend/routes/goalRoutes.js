import express from "express";
import {
  getGoals,
  addGoal,
  updateGoal,
  deleteGoal,
  addContribution,
  deleteContribution,
} from "../controllers/goalController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/get", protect, getGoals);
router.post("/add", protect, addGoal);
router.put("/:id", protect, updateGoal);
router.delete("/:id", protect, deleteGoal);
router.post("/:id/contribution", protect, addContribution);
router.delete("/:id/contribution/:contributionId", protect, deleteContribution);

export default router;
