import ExcelJS from "exceljs";
import Income from "../models/Income.js";
import Fund from "../models/Fund.js";

// @desc   Add a new income entry
// @route  POST /api/v1/income/add
export const addIncome = async (req, res) => {
  const userId = req.user.id;

  try {
    const { icon, source, amount, fund, notes, date } = req.body;

    if (!source || amount === undefined || amount === null) {
      return res.status(400).json({ message: "Source and amount are required" });
    }

    const income = await Income.create({
      userId,
      icon,
      source,
      amount,
      fund: fund || null,
      notes,
      date: date ? new Date(date) : Date.now(),
    });

    // Income is deposited into the selected fund, increasing its balance.
    if (fund) {
      await Fund.updateOne({ _id: fund, userId }, { $inc: { balance: amount } });
    }

    res.status(200).json(income);
  } catch (err) {
    res.status(500).json({ message: "Error adding income", error: err.message });
  }
};

// @desc   Update an income entry (reconciles fund balances)
// @route  PUT /api/v1/income/:id
export const updateIncome = async (req, res) => {
  const userId = req.user.id;

  try {
    const existing = await Income.findOne({ _id: req.params.id, userId });
    if (!existing) {
      return res.status(404).json({ message: "Income not found" });
    }

    const { icon, source, amount, fund, notes, date } = req.body;
    if (!source || amount === undefined || amount === null) {
      return res.status(400).json({ message: "Source and amount are required" });
    }

    const newAmount = Number(amount);
    const newFund = fund || null;

    // Reverse the old deposit, then apply the new one.
    if (existing.fund) {
      await Fund.updateOne(
        { _id: existing.fund, userId },
        { $inc: { balance: -existing.amount } }
      );
    }
    if (newFund) {
      await Fund.updateOne({ _id: newFund, userId }, { $inc: { balance: newAmount } });
    }

    existing.icon = icon;
    existing.source = source;
    existing.amount = newAmount;
    existing.fund = newFund;
    existing.notes = notes;
    if (date) existing.date = new Date(date);
    await existing.save();

    res.status(200).json(existing);
  } catch (err) {
    res.status(500).json({ message: "Error updating income", error: err.message });
  }
};

// @desc   Get all income entries for the logged-in user
// @route  GET /api/v1/income/get
export const getAllIncome = async (req, res) => {
  const userId = req.user.id;

  try {
    const income = await Income.find({ userId })
      .populate("fund", "name icon")
      .sort({ date: -1 });
    res.status(200).json(income);
  } catch (err) {
    res.status(500).json({ message: "Error fetching income", error: err.message });
  }
};

// @desc   Delete an income entry
// @route  DELETE /api/v1/income/:id
export const deleteIncome = async (req, res) => {
  try {
    const income = await Income.findOne({ _id: req.params.id, userId: req.user.id });
    if (!income) {
      return res.status(404).json({ message: "Income not found" });
    }
    await income.deleteOne();

    // Reverse the deposit this income made into its fund.
    if (income.fund) {
      await Fund.updateOne(
        { _id: income.fund, userId: req.user.id },
        { $inc: { balance: -income.amount } }
      );
    }

    res.status(200).json({ message: "Income deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting income", error: err.message });
  }
};

// @desc   Download all income as an Excel file
// @route  GET /api/v1/income/downloadexcel
export const downloadIncomeExcel = async (req, res) => {
  const userId = req.user.id;

  try {
    const income = await Income.find({ userId })
      .populate("fund", "name")
      .sort({ date: -1 });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Income");
    sheet.columns = [
      { header: "Source", key: "source", width: 25 },
      { header: "Amount", key: "amount", width: 15 },
      { header: "Fund", key: "fund", width: 18 },
      { header: "Notes", key: "notes", width: 30 },
      { header: "Date", key: "date", width: 20 },
    ];
    income.forEach((item) => {
      sheet.addRow({
        source: item.source,
        amount: item.amount,
        fund: item.fund?.name || "",
        notes: item.notes,
        date: item.date,
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", 'attachment; filename="income_details.xlsx"');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ message: "Error downloading income", error: err.message });
  }
};
