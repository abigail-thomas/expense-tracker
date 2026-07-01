import mongoose from "mongoose";

const IncomeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    icon: { type: String, default: "" },
    source: { type: String, required: true }, // e.g. Salary, Freelance
    amount: { type: Number, required: true },
    fund: { type: mongoose.Schema.Types.ObjectId, ref: "Fund", default: null },
    notes: { type: String, default: "" }, // optional free-text description
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Income", IncomeSchema);
