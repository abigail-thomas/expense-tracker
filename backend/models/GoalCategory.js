import mongoose from "mongoose";

// A user-defined savings-goal category (e.g. "Travel"), with a chosen icon.
const GoalCategorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    icon: { type: String, default: "" }, // key from the frontend goal icon palette
  },
  { timestamps: true }
);

// Prevent duplicate category names per user.
GoalCategorySchema.index({ userId: 1, name: 1 }, { unique: true });

export default mongoose.model("GoalCategory", GoalCategorySchema);
