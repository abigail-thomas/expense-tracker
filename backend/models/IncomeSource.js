import mongoose from "mongoose";

// A user-defined income source (e.g. "Pressed Books & Coffee"), with a chosen icon.
const IncomeSourceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    icon: { type: String, default: "" }, // key from the frontend income icon palette
  },
  { timestamps: true }
);

// Prevent duplicate source names per user.
IncomeSourceSchema.index({ userId: 1, name: 1 }, { unique: true });

export default mongoose.model("IncomeSource", IncomeSourceSchema);
