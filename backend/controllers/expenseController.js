import ExcelJS from "exceljs";
import Expense from "../models/Expense.js";
import Fund from "../models/Fund.js";
import CreditCard from "../models/CreditCard.js";
import { createExpenseWithEffects } from "../services/expenseService.js";

// @desc   Add a new expense entry
// @route  POST /api/v1/expense/add
export const addExpense = async (req, res) => {
  const userId = req.user.id;

  try {
    const { icon, category, amount, method, fund, creditCard, notes, date } = req.body;

    if (!category || amount === undefined || amount === null) {
      return res.status(400).json({ message: "Category and amount are required" });
    }

    const expense = await createExpenseWithEffects({
      userId,
      icon,
      category,
      amount,
      method,
      fund,
      creditCard,
      notes,
      date,
    });

    res.status(200).json(expense);
  } catch (err) {
    res.status(500).json({ message: "Error adding expense", error: err.message });
  }
};

// @desc   Update an expense entry (reconciles fund/card balances)
// @route  PUT /api/v1/expense/:id
export const updateExpense = async (req, res) => {
  const userId = req.user.id;

  try {
    const existing = await Expense.findOne({ _id: req.params.id, userId });
    if (!existing) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const { icon, category, amount, method, fund, creditCard, notes, date } = req.body;
    if (!category || amount === undefined || amount === null) {
      return res.status(400).json({ message: "Category and amount are required" });
    }

    const payMethod = method === "credit" ? "credit" : "debit";
    const newAmount = Number(amount);

    // 1) Reverse whatever the expense currently applies.
    if (existing.method === "debit" && existing.fund) {
      await Fund.updateOne(
        { _id: existing.fund, userId },
        { $inc: { balance: existing.amount } }
      );
    } else if (existing.method === "credit" && existing.creditCard) {
      await CreditCard.updateOne(
        { _id: existing.creditCard, userId },
        { $inc: { balance: -existing.amount, rewardsEarned: -(existing.rewardEarned || 0) } }
      );
    }

    // 2) Compute + apply the new effect.
    const newFund = payMethod === "debit" ? fund || null : null;
    const newCard = payMethod === "credit" ? creditCard || null : null;
    let rewardEarned = 0;
    if (payMethod === "credit" && newCard) {
      const card = await CreditCard.findOne({ _id: newCard, userId });
      if (card) rewardEarned = (newAmount * (card.rewardRate || 0)) / 100;
    }
    if (payMethod === "debit" && newFund) {
      await Fund.updateOne({ _id: newFund, userId }, { $inc: { balance: -newAmount } });
    } else if (payMethod === "credit" && newCard) {
      await CreditCard.updateOne(
        { _id: newCard, userId },
        { $inc: { balance: newAmount, rewardsEarned: rewardEarned } }
      );
    }

    // 3) Persist the new field values.
    existing.icon = icon;
    existing.category = category;
    existing.amount = newAmount;
    existing.method = payMethod;
    existing.fund = newFund;
    existing.creditCard = newCard;
    existing.rewardEarned = rewardEarned;
    existing.notes = notes;
    if (date) existing.date = new Date(date);
    await existing.save();

    res.status(200).json(existing);
  } catch (err) {
    res.status(500).json({ message: "Error updating expense", error: err.message });
  }
};

// @desc   Get all expense entries for the logged-in user
// @route  GET /api/v1/expense/get
export const getAllExpense = async (req, res) => {
  const userId = req.user.id;

  try {
    const expense = await Expense.find({ userId })
      .populate("fund", "name icon")
      .populate("creditCard", "name icon")
      .populate("subscription", "name")
      .sort({ date: -1 });
    res.status(200).json(expense);
  } catch (err) {
    res.status(500).json({ message: "Error fetching expense", error: err.message });
  }
};

// @desc   Delete an expense entry
// @route  DELETE /api/v1/expense/:id
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user.id });
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    await expense.deleteOne();

    // Reverse whatever this expense applied when created.
    if (expense.method === "debit" && expense.fund) {
      await Fund.updateOne(
        { _id: expense.fund, userId: req.user.id },
        { $inc: { balance: expense.amount } }
      );
    } else if (expense.method === "credit" && expense.creditCard) {
      await CreditCard.updateOne(
        { _id: expense.creditCard, userId: req.user.id },
        { $inc: { balance: -expense.amount, rewardsEarned: -(expense.rewardEarned || 0) } }
      );
    }

    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting expense", error: err.message });
  }
};

// @desc   Download all expenses as an Excel file
// @route  GET /api/v1/expense/downloadexcel
export const downloadExpenseExcel = async (req, res) => {
  const userId = req.user.id;

  try {
    const expense = await Expense.find({ userId })
      .populate("fund", "name")
      .populate("creditCard", "name")
      .sort({ date: -1 });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Expense");
    sheet.columns = [
      { header: "Category", key: "category", width: 25 },
      { header: "Amount", key: "amount", width: 15 },
      { header: "Method", key: "method", width: 12 },
      { header: "Fund", key: "fund", width: 18 },
      { header: "Card", key: "card", width: 18 },
      { header: "Notes", key: "notes", width: 30 },
      { header: "Date", key: "date", width: 20 },
    ];
    expense.forEach((item) => {
      sheet.addRow({
        category: item.category,
        amount: item.amount,
        method: item.method,
        fund: item.fund?.name || "",
        card: item.creditCard?.name || "",
        notes: item.notes,
        date: item.date,
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", 'attachment; filename="expense_details.xlsx"');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ message: "Error downloading expense", error: err.message });
  }
};
