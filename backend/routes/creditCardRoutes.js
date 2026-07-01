import express from "express";
import {
  getCreditCards,
  addCreditCard,
  updateCreditCard,
  deleteCreditCard,
  payCreditCard,
} from "../controllers/creditCardController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/get", protect, getCreditCards);
router.post("/add", protect, addCreditCard);
router.put("/:id", protect, updateCreditCard);
router.delete("/:id", protect, deleteCreditCard);
router.post("/:id/pay", protect, payCreditCard);

export default router;
