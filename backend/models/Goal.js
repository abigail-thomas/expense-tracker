import mongoose from "mongoose";

// A single deposit into (or, if negative, withdrawal from) a goal envelope.
const ContributionSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    note: { type: String, default: "", trim: true },
  },
  { _id: true, timestamps: true }
);

// A user-defined savings goal (e.g. "Save $4k by year-end"). A goal behaves
// like a virtual savings envelope: the user deposits money into it over time
// (see `contributions`), independent of their general income/expenses. Saved
// progress = `startingAmount` (opening balance) + the sum of all contributions.
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
    // When the goal started. Used only as the baseline for pace/projection.
    startDate: { type: Date, default: Date.now },
    // Opening balance already set aside at startDate (optional head start).
    startingAmount: { type: Number, default: 0 },
    // Deposits made toward this goal over time.
    contributions: { type: [ContributionSchema], default: [] },
    icon: { type: String, default: "" }, // key from the frontend icon palette
    note: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Goal", GoalSchema);
