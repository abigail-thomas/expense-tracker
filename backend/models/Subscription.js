import mongoose from "mongoose";

// A recurring expense (e.g. "Netflix", "Rent"). On each billing cycle the
// scheduler posts a real Expense against the chosen account — a Fund (debit)
// or a CreditCard (credit) — exactly as a manual expense would. `name` is used
// as the posted expense's category.
const SubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    icon: { type: String, default: "" },
    amount: { type: Number, required: true },
    frequency: {
      type: String,
      enum: ["weekly", "biweekly", "monthly", "quarterly", "annually"],
      default: "monthly",
    },
    method: { type: String, enum: ["debit", "credit"], default: "debit" },
    fund: { type: mongoose.Schema.Types.ObjectId, ref: "Fund", default: null },
    creditCard: { type: mongoose.Schema.Types.ObjectId, ref: "CreditCard", default: null },
    notes: { type: String, default: "" },
    active: { type: Boolean, default: true }, // paused subscriptions don't auto-charge
    startDate: { type: Date, default: Date.now }, // first charge date / anchor
    nextChargeDate: { type: Date, required: true }, // when the next charge is due
    lastChargedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Subscription", SubscriptionSchema);
