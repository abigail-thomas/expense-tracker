import mongoose from "mongoose";

// A user-defined savings goal (e.g. "Save $4k by year-end"). Progress is not
// stored here — it's computed on the frontend as net savings (income minus
// expenses) since `startDate`, plus any `startingAmount` already put aside.
const GoalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    // The amount the user wants to have saved by targetDate.
    targetAmount: { type: Number, required: true },
    // When the goal should be reached.
    targetDate: { type: Date, required: true },
    // When to start counting net savings from. Defaults to creation time.
    startDate: { type: Date, default: Date.now },
    // Money already set aside toward this goal at startDate (optional head start).
    startingAmount: { type: Number, default: 0 },
    icon: { type: String, default: "" }, // key from the frontend icon palette
    note: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Goal", GoalSchema);
