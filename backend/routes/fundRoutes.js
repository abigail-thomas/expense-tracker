import express from "express";
import {
  getFunds,
  addFund,
  updateFund,
  deleteFund,
} from "../controllers/fundController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/get", protect, getFunds);
router.post("/add", protect, addFund);
router.put("/:id", protect, updateFund);
router.delete("/:id", protect, deleteFund);

export default router;
