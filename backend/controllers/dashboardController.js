import mongoose from "mongoose";
import Income from "../models/Income.js";
import Expense from "../models/Expense.js";
import Fund from "../models/Fund.js";

// @desc   Aggregated dashboard data for the logged-in user
// @route  GET /api/v1/dashboard
export const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    const userObjectId = new mongoose.Types.ObjectId(String(userId));

    // Total income
    const totalIncomeAgg = await Income.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalIncome = totalIncomeAgg[0]?.total || 0;

    // Total expense
    const totalExpenseAgg = await Expense.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalExpense = totalExpenseAgg[0]?.total || 0;

    // Funds hold the user's real available cash. Total balance is their sum.
    const funds = await Fund.find({ userId: userObjectId }).sort({ createdAt: 1 });
    const fundsTotal = funds.reduce((sum, f) => sum + (f.balance || 0), 0);

    // Last 5 income + last 5 expense transactions, combined & sorted
    const recentIncome = await Income.find({ userId: userObjectId })
      .sort({ date: -1 })
      .limit(5);
    const recentExpense = await Expense.find({ userId: userObjectId })
      .sort({ date: -1 })
      .limit(5);

    const recentTransactions = [
      ...recentIncome.map((i) => ({ ...i.toObject(), type: "income" })),
      ...recentExpense.map((e) => ({ ...e.toObject(), type: "expense" })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({
      totalBalance: fundsTotal,
      totalIncome,
      totalExpense,
      funds,
      recentTransactions,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching dashboard data", error: err.message });
  }
};
