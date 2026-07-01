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
  },
  { timestamps: true }
);

// Prevent duplicate fund names per user.
FundSchema.index({ userId: 1, name: 1 }, { unique: true });

export default mongoose.model("Fund", FundSchema);
