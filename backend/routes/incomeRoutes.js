import express from "express";
import {
  addIncome,
  updateIncome,
  getAllIncome,
  deleteIncome,
  downloadIncomeExcel,
} from "../controllers/incomeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", protect, addIncome);
router.get("/get", protect, getAllIncome);
router.get("/downloadexcel", protect, downloadIncomeExcel);
router.put("/:id", protect, updateIncome);
router.delete("/:id", protect, deleteIncome);

export default router;
