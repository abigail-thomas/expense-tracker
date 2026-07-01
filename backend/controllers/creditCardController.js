import CreditCard from "../models/CreditCard.js";
import Fund from "../models/Fund.js";

// Sentinel returned when a due-day value is present but out of range.
const INVALID_DUE_DAY = Symbol("invalid-due-day");

// Normalize an incoming dueDay: empty/null -> null (unset); a whole number
// 1-31 -> that number; anything else -> INVALID_DUE_DAY.
const parseDueDay = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const day = Number(value);
  if (!Number.isInteger(day) || day < 1 || day > 31) return INVALID_DUE_DAY;
  return day;
};

// @desc   List the logged-in user's credit cards
// @route  GET /api/v1/credit-card/get
export const getCreditCards = async (req, res) => {
  try {
    const cards = await CreditCard.find({ userId: req.user.id }).sort({
      createdAt: 1,
    });
    res.status(200).json(cards);
  } catch (err) {
    res.status(500).json({ message: "Error fetching credit cards", error: err.message });
  }
};

// @desc   Create a new credit card
// @route  POST /api/v1/credit-card/add
export const addCreditCard = async (req, res) => {
  try {
    const { name, icon, limit, balance, rewardRate, dueDay } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }
    const parsedDueDay = parseDueDay(dueDay);
    if (parsedDueDay === INVALID_DUE_DAY) {
      return res.status(400).json({ message: "Due day must be between 1 and 31" });
    }

    const exists = await CreditCard.findOne({
      userId: req.user.id,
      name: name.trim(),
    });
    if (exists) {
      return res.status(400).json({ message: "A card with that name already exists" });
    }

    const card = await CreditCard.create({
      userId: req.user.id,
      name: name.trim(),
      icon: icon || "",
      limit: Number(limit) || 0,
      balance: Number(balance) || 0,
      rewardRate: Number(rewardRate) || 0,
      dueDay: parsedDueDay,
    });
    res.status(201).json(card);
  } catch (err) {
    res.status(500).json({ message: "Error creating credit card", error: err.message });
  }
};

// @desc   Update a credit card (name / icon / limit / balance / reward rate)
// @route  PUT /api/v1/credit-card/:id
export const updateCreditCard = async (req, res) => {
  try {
    const { name, icon, limit, balance, rewardRate, dueDay } = req.body;
    const card = await CreditCard.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!card) {
      return res.status(404).json({ message: "Credit card not found" });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ message: "Name cannot be empty" });
      }
      const clash = await CreditCard.findOne({
        userId: req.user.id,
        name: name.trim(),
        _id: { $ne: card._id },
      });
      if (clash) {
        return res.status(400).json({ message: "A card with that name already exists" });
      }
      card.name = name.trim();
    }
    if (icon !== undefined) card.icon = icon;
    if (dueDay !== undefined) {
      const parsedDueDay = parseDueDay(dueDay);
      if (parsedDueDay === INVALID_DUE_DAY) {
        return res.status(400).json({ message: "Due day must be between 1 and 31" });
      }
      card.dueDay = parsedDueDay;
    }
    for (const field of ["limit", "balance", "rewardRate"]) {
      if (req.body[field] !== undefined) {
        if (isNaN(req.body[field])) {
          return res.status(400).json({ message: `${field} must be a number` });
        }
        card[field] = Number(req.body[field]);
      }
    }

    await card.save();
    res.status(200).json(card);
  } catch (err) {
    res.status(500).json({ message: "Error updating credit card", error: err.message });
  }
};

// @desc   Delete a credit card
// @route  DELETE /api/v1/credit-card/:id
export const deleteCreditCard = async (req, res) => {
  try {
    const card = await CreditCard.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!card) {
      return res.status(404).json({ message: "Credit card not found" });
    }
    await card.deleteOne();
    res.status(200).json({ message: "Credit card deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting credit card", error: err.message });
  }
};

// @desc   Pay down a card from a fund (moves cash from fund to card)
// @route  POST /api/v1/credit-card/:id/pay
export const payCreditCard = async (req, res) => {
  try {
    const { amount, fundId } = req.body;
    const payAmount = Number(amount);

    if (!payAmount || isNaN(payAmount) || payAmount <= 0) {
      return res.status(400).json({ message: "Enter a payment amount greater than 0" });
    }

    const card = await CreditCard.findOne({ _id: req.params.id, userId: req.user.id });
    if (!card) {
      return res.status(404).json({ message: "Credit card not found" });
    }

    const fund = await Fund.findOne({ _id: fundId, userId: req.user.id });
    if (!fund) {
      return res.status(404).json({ message: "Select a valid fund to pay from" });
    }
    if (payAmount > fund.balance) {
      return res.status(400).json({ message: "That fund doesn't have enough to cover the payment" });
    }

    fund.balance -= payAmount;
    card.balance -= payAmount;
    await fund.save();
    await card.save();

    res.status(200).json({ card, fund });
  } catch (err) {
    res.status(500).json({ message: "Error making payment", error: err.message });
  }
};
