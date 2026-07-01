import express from "express";
import {
  getIncomeSources,
  addIncomeSource,
  updateIncomeSource,
  deleteIncomeSource,
} from "../controllers/incomeSourceController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/get", protect, getIncomeSources);
router.post("/add", protect, addIncomeSource);
router.put("/:id", protect, updateIncomeSource);
router.delete("/:id", protect, deleteIncomeSource);

export default router;
