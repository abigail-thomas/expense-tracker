import Fund from "../models/Fund.js";

// Funds seeded for a user the first time they load their funds.
const DEFAULT_FUNDS = [
  { name: "Checking", icon: "landmark", category: "Checking" },
  { name: "Savings", icon: "piggybank", category: "Savings" },
  { name: "Other", icon: "wallet", category: "Other" },
];

// @desc   List the logged-in user's funds (seeding defaults on first use)
// @route  GET /api/v1/fund/get
export const getFunds = async (req, res) => {
  try {
    let funds = await Fund.find({ userId: req.user.id }).sort({ createdAt: 1 });

    if (funds.length === 0) {
      funds = await Fund.insertMany(
        DEFAULT_FUNDS.map((f) => ({ ...f, userId: req.user.id, balance: 0 }))
      );
    }

    res.status(200).json(funds);
  } catch (err) {
    res.status(500).json({ message: "Error fetching funds", error: err.message });
  }
};

// @desc   Create a new fund
// @route  POST /api/v1/fund/add
export const addFund = async (req, res) => {
  try {
    const { name, category, icon, balance } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    const exists = await Fund.findOne({ userId: req.user.id, name: name.trim() });
    if (exists) {
      return res.status(400).json({ message: "A fund with that name already exists" });
    }

    const fund = await Fund.create({
      userId: req.user.id,
      name: name.trim(),
      category: (category || "").trim(),
      icon: icon || "",
      balance: Number(balance) || 0,
    });
    res.status(201).json(fund);
  } catch (err) {
    res.status(500).json({ message: "Error creating fund", error: err.message });
  }
};

// @desc   Update a fund (rename / change icon / set balance)
// @route  PUT /api/v1/fund/:id
export const updateFund = async (req, res) => {
  try {
    const { name, category, icon, balance } = req.body;
    const fund = await Fund.findOne({ _id: req.params.id, userId: req.user.id });
    if (!fund) {
      return res.status(404).json({ message: "Fund not found" });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ message: "Name cannot be empty" });
      }
      // Guard against renaming into an existing name.
      const clash = await Fund.findOne({
        userId: req.user.id,
        name: name.trim(),
        _id: { $ne: fund._id },
      });
      if (clash) {
        return res.status(400).json({ message: "A fund with that name already exists" });
      }
      fund.name = name.trim();
    }
    if (category !== undefined) fund.category = (category || "").trim();
    if (icon !== undefined) fund.icon = icon;
    if (balance !== undefined) {
      if (isNaN(balance)) {
        return res.status(400).json({ message: "Balance must be a number" });
      }
      fund.balance = Number(balance);
    }

    await fund.save();
    res.status(200).json(fund);
  } catch (err) {
    res.status(500).json({ message: "Error updating fund", error: err.message });
  }
};

// @desc   Delete a fund
// @route  DELETE /api/v1/fund/:id
export const deleteFund = async (req, res) => {
  try {
    const fund = await Fund.findOne({ _id: req.params.id, userId: req.user.id });
    if (!fund) {
      return res.status(404).json({ message: "Fund not found" });
    }
    await fund.deleteOne();
    res.status(200).json({ message: "Fund deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting fund", error: err.message });
  }
};
