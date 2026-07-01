import mongoose from "mongoose";

// A user's credit card. Unlike a Fund (a cash asset), this is a liability:
// `balance` is the amount currently owed. Credit purchases increase it (up to
// `limit`); cash-back accrues in dollars via a flat `rewardRate`.
const CreditCardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    icon: { type: String, default: "" },
    limit: { type: Number, default: 0 }, // credit limit
    balance: { type: Number, default: 0 }, // amount currently owed
    rewardRate: { type: Number, default: 0 }, // flat cash-back %, e.g. 1.5
    rewardsEarned: { type: Number, default: 0 }, // accrued cash back, in dollars
    dueDay: { type: Number, min: 1, max: 31, default: null }, // day of month payment is due, e.g. 15
  },
  { timestamps: true }
);

// Prevent duplicate card names per user.
CreditCardSchema.index({ userId: 1, name: 1 }, { unique: true });

export default mongoose.model("CreditCard", CreditCardSchema);
