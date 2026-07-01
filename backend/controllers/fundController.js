import Fund from "../models/Fund.js";
import {
  describeInterest,
  describeInterestDetail,
} from "../services/interestService.js";

// Attach display-only interest text to a fund, derived from the single source
// of truth in interestService so the UI can't drift: `interestLabel` is the
// short badge ("3.65% APY"); `interestDetail` is the verbose tooltip breakdown.
const withInterest = (fund) => {
  const obj = fund.toObject ? fund.toObject() : fund;
  return {
    ...obj,
    interestLabel: describeInterest(obj),
    interestDetail: describeInterestDetail(obj),
  };
};

// Parse a maturity date from the request body. Returns:
//   { ok: true, value: Date|null }  — null means "cleared / open-ended"
//   { ok: false }                   — a non-empty value that isn't a valid date
const parseMaturityDate = (raw) => {
  if (raw === "" || raw === null) return { ok: true, value: null };
  const d = new Date(raw);
  if (isNaN(d.getTime())) return { ok: false };
  return { ok: true, value: d };
};

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

    res.status(200).json(funds.map(withInterest));
  } catch (err) {
    res.status(500).json({ message: "Error fetching funds", error: err.message });
  }
};

// @desc   Create a new fund
// @route  POST /api/v1/fund/add
export const addFund = async (req, res) => {
  try {
    const { name, category, icon, balance, apy, maturityDate } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }
    if (apy !== undefined && apy !== "" && (isNaN(apy) || Number(apy) < 0)) {
      return res.status(400).json({ message: "APY must be a non-negative number" });
    }
    const maturity = parseMaturityDate(maturityDate ?? "");
    if (!maturity.ok) {
      return res.status(400).json({ message: "Maturity date is invalid" });
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
      apy: Number(apy) || 0,
      maturityDate: maturity.value,
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
    const { name, category, icon, balance, apy, maturityDate } = req.body;
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
    if (apy !== undefined) {
      if (apy !== "" && (isNaN(apy) || Number(apy) < 0)) {
        return res.status(400).json({ message: "APY must be a non-negative number" });
      }
      fund.apy = apy === "" ? 0 : Number(apy);
    }
    if (maturityDate !== undefined) {
      const maturity = parseMaturityDate(maturityDate);
      if (!maturity.ok) {
        return res.status(400).json({ message: "Maturity date is invalid" });
      }
      fund.maturityDate = maturity.value;
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
