import express from "express";
import {
  getExpenseCategories,
  addExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
} from "../controllers/expenseCategoryController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/get", protect, getExpenseCategories);
router.post("/add", protect, addExpenseCategory);
router.put("/:id", protect, updateExpenseCategory);
router.delete("/:id", protect, deleteExpenseCategory);

export default router;
