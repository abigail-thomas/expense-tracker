import mongoose from "mongoose";

// A user-defined subscription category (e.g. "Streaming"), with a chosen icon.
const SubscriptionCategorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    icon: { type: String, default: "" }, // key from the frontend subscription icon palette
  },
  { timestamps: true }
);

// Prevent duplicate category names per user.
SubscriptionCategorySchema.index({ userId: 1, name: 1 }, { unique: true });

export default mongoose.model("SubscriptionCategory", SubscriptionCategorySchema);
