import Subscription from "../models/Subscription.js";
import { chargeSubscriptionOnce } from "../services/subscriptionService.js";

const VALID_FREQUENCIES = ["weekly", "biweekly", "monthly", "quarterly", "annually"];

// Shared validation for add + update. Returns an error message, or null if valid.
const validateSubscription = ({ name, amount, frequency, method, fund, creditCard }) => {
  if (!name || !name.trim()) return "Name is required";
  if (amount === undefined || amount === null || isNaN(amount) || Number(amount) <= 0)
    return "Amount must be a number greater than 0";
  if (frequency && !VALID_FREQUENCIES.includes(frequency))
    return "Invalid billing frequency";
  const payMethod = method === "credit" ? "credit" : "debit";
  if (payMethod === "debit" && !fund) return "Select which fund to charge from";
  if (payMethod === "credit" && !creditCard) return "Select which credit card to charge";
  return null;
};

// @desc   List the logged-in user's subscriptions
// @route  GET /api/v1/subscription/get
export const getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ userId: req.user.id })
      .populate("fund", "name icon")
      .populate("creditCard", "name icon")
      .sort({ createdAt: -1 });
    res.status(200).json(subscriptions);
  } catch (err) {
    res.status(500).json({ message: "Error fetching subscriptions", error: err.message });
  }
};

// @desc   Create a subscription
// @route  POST /api/v1/subscription/add
export const addSubscription = async (req, res) => {
  try {
    const { name, icon, amount, frequency, method, fund, creditCard, notes, startDate, active } =
      req.body;

    const error = validateSubscription({ name, amount, frequency, method, fund, creditCard });
    if (error) return res.status(400).json({ message: error });

    const payMethod = method === "credit" ? "credit" : "debit";
    // A past startDate is allowed — the scheduler backfills missed periods.
    const start = startDate ? new Date(startDate) : new Date();

    const subscription = await Subscription.create({
      userId: req.user.id,
      name: name.trim(),
      icon: icon || "",
      amount: Number(amount),
      frequency: frequency || "monthly",
      method: payMethod,
      fund: payMethod === "debit" ? fund || null : null,
      creditCard: payMethod === "credit" ? creditCard || null : null,
      notes: notes || "",
      active: active !== undefined ? !!active : true,
      startDate: start,
      nextChargeDate: start, // first charge is due on the start date
    });

    res.status(201).json(subscription);
  } catch (err) {
    res.status(500).json({ message: "Error creating subscription", error: err.message });
  }
};

// @desc   Update a subscription (changing startDate/frequency resets the schedule)
// @route  PUT /api/v1/subscription/:id
export const updateSubscription = async (req, res) => {
  try {
    const sub = await Subscription.findOne({ _id: req.params.id, userId: req.user.id });
    if (!sub) return res.status(404).json({ message: "Subscription not found" });

    const { name, icon, amount, frequency, method, fund, creditCard, notes, startDate, active } =
      req.body;

    // Validate against the merged (incoming or existing) values.
    const merged = {
      name: name !== undefined ? name : sub.name,
      amount: amount !== undefined ? amount : sub.amount,
      frequency: frequency !== undefined ? frequency : sub.frequency,
      method: method !== undefined ? method : sub.method,
      fund: fund !== undefined ? fund : sub.fund,
      creditCard: creditCard !== undefined ? creditCard : sub.creditCard,
    };
    const error = validateSubscription(merged);
    if (error) return res.status(400).json({ message: error });

    const payMethod = merged.method === "credit" ? "credit" : "debit";
    if (name !== undefined) sub.name = name.trim();
    if (icon !== undefined) sub.icon = icon;
    if (amount !== undefined) sub.amount = Number(amount);
    if (frequency !== undefined) sub.frequency = frequency;
    if (notes !== undefined) sub.notes = notes;
    if (active !== undefined) sub.active = !!active;

    sub.method = payMethod;
    sub.fund = payMethod === "debit" ? merged.fund || null : null;
    sub.creditCard = payMethod === "credit" ? merged.creditCard || null : null;

    // Re-anchor the schedule when the start date or frequency changes.
    if (startDate !== undefined) {
      sub.startDate = new Date(startDate);
      sub.nextChargeDate = new Date(startDate);
    } else if (frequency !== undefined) {
      sub.nextChargeDate = sub.startDate;
    }

    await sub.save();
    res.status(200).json(sub);
  } catch (err) {
    res.status(500).json({ message: "Error updating subscription", error: err.message });
  }
};

// @desc   Delete a subscription (past charges are left in place)
// @route  DELETE /api/v1/subscription/:id
export const deleteSubscription = async (req, res) => {
  try {
    const sub = await Subscription.findOne({ _id: req.params.id, userId: req.user.id });
    if (!sub) return res.status(404).json({ message: "Subscription not found" });
    await sub.deleteOne();
    res.status(200).json({ message: "Subscription deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting subscription", error: err.message });
  }
};

// @desc   Post one charge immediately (dated now) and advance the schedule
// @route  POST /api/v1/subscription/:id/charge
export const chargeNowSubscription = async (req, res) => {
  try {
    const sub = await Subscription.findOne({ _id: req.params.id, userId: req.user.id });
    if (!sub) return res.status(404).json({ message: "Subscription not found" });

    const expense = await chargeSubscriptionOnce(sub, new Date());
    res.status(200).json({ subscription: sub, expense });
  } catch (err) {
    res.status(500).json({ message: "Error charging subscription", error: err.message });
  }
};
