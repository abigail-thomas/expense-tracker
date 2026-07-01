import mongoose from "mongoose";

// A user-defined fund / account (e.g. "Checking", "Savings", "Other") that
// holds a balance. Income deposits into a fund; debit expenses withdraw from one.
const FundSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    // Optional grouping label. Funds sharing a category are combined into a
    // single slice in the Financial Overview chart. Empty = grouped by name.
    category: { type: String, default: "", trim: true },
    icon: { type: String, default: "" }, // key from the frontend fund icon palette
    balance: { type: Number, default: 0 },
    // Annual percentage yield as a *percent* (e.g. 3.65 means 3.65% APY), used
    // to auto-credit monthly interest. 0 = no interest. Set this on any fund
    // (a CD held as "Other", a high-yield savings, etc.) to earn a flat rate.
    apy: { type: Number, default: 0 },
    // Optional maturity date, mainly for CDs. Once reached, the fund stops
    // accruing interest (accrual in the maturity month is prorated to this
    // date). null = open-ended (a normal savings account never matures).
    maturityDate: { type: Date, default: null },
  },
  { timestamps: true }
);

// Prevent duplicate fund names per user.
FundSchema.index({ userId: 1, name: 1 }, { unique: true });

export default mongoose.model("Fund", FundSchema);
