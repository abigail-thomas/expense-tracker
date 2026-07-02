import mongoose from "mongoose";

// A user-defined expense category (e.g. "Groceries"), with a chosen icon.
const ExpenseCategorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    icon: { type: String, default: "" }, // key from the frontend expense icon palette
  },
  { timestamps: true }
);

// Prevent duplicate category names per user.
ExpenseCategorySchema.index({ userId: 1, name: 1 }, { unique: true });

export default mongoose.model("ExpenseCategory", ExpenseCategorySchema);
