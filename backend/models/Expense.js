import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    icon: { type: String, default: "" },
    name: { type: String, default: "" }, // free-text label for this expense, e.g. "Aubrey's Birthday Gift"
    category: { type: String, required: true }, // grouping the icon belongs to, e.g. Groceries, Gift
    amount: { type: Number, required: true },
    method: { type: String, enum: ["debit", "credit"], default: "debit" },
    fund: { type: mongoose.Schema.Types.ObjectId, ref: "Fund", default: null },
    creditCard: { type: mongoose.Schema.Types.ObjectId, ref: "CreditCard", default: null },
    rewardEarned: { type: Number, default: 0 }, // cash back accrued for this purchase
    // Set when this expense was auto-posted by a recurring subscription.
    subscription: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription", default: null },
    notes: { type: String, default: "" }, // optional free-text description
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Expense", ExpenseSchema);
