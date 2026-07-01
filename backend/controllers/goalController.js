import Goal from "../models/Goal.js";

// Validate & parse a date field. Returns { ok, value } — value is a Date.
const parseDate = (raw) => {
  const d = new Date(raw);
  if (isNaN(d.getTime())) return { ok: false };
  return { ok: true, value: d };
};

// @desc   List the logged-in user's goals (newest first)
// @route  GET /api/v1/goal/get
export const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(goals);
  } catch (err) {
    res.status(500).json({ message: "Error fetching goals", error: err.message });
  }
};

// @desc   Create a new goal
// @route  POST /api/v1/goal/add
export const addGoal = async (req, res) => {
  try {
    const { name, targetAmount, targetDate, startDate, startingAmount, icon, note } =
      req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }
    if (targetAmount === undefined || isNaN(targetAmount) || Number(targetAmount) <= 0) {
      return res.status(400).json({ message: "Target amount must be greater than 0" });
    }
    const target = parseDate(targetDate);
    if (!target.ok) {
      return res.status(400).json({ message: "Target date is invalid" });
    }
    // startDate is optional; default to now when omitted/blank.
    let start = new Date();
    if (startDate !== undefined && startDate !== "" && startDate !== null) {
      const parsed = parseDate(startDate);
      if (!parsed.ok) {
        return res.status(400).json({ message: "Start date is invalid" });
      }
      start = parsed.value;
    }
    if (startingAmount !== undefined && startingAmount !== "" && isNaN(startingAmount)) {
      return res.status(400).json({ message: "Starting amount must be a number" });
    }

    const goal = await Goal.create({
      userId: req.user.id,
      name: name.trim(),
      targetAmount: Number(targetAmount),
      targetDate: target.value,
      startDate: start,
      startingAmount: Number(startingAmount) || 0,
      icon: icon || "",
      note: (note || "").trim(),
    });
    res.status(201).json(goal);
  } catch (err) {
    res.status(500).json({ message: "Error creating goal", error: err.message });
  }
};

// @desc   Update a goal
// @route  PUT /api/v1/goal/:id
export const updateGoal = async (req, res) => {
  try {
    const { name, targetAmount, targetDate, startDate, startingAmount, icon, note } =
      req.body;
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user.id });
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ message: "Name cannot be empty" });
      }
      goal.name = name.trim();
    }
    if (targetAmount !== undefined) {
      if (isNaN(targetAmount) || Number(targetAmount) <= 0) {
        return res.status(400).json({ message: "Target amount must be greater than 0" });
      }
      goal.targetAmount = Number(targetAmount);
    }
    if (targetDate !== undefined) {
      const target = parseDate(targetDate);
      if (!target.ok) {
        return res.status(400).json({ message: "Target date is invalid" });
      }
      goal.targetDate = target.value;
    }
    if (startDate !== undefined) {
      const start = parseDate(startDate);
      if (!start.ok) {
        return res.status(400).json({ message: "Start date is invalid" });
      }
      goal.startDate = start.value;
    }
    if (startingAmount !== undefined) {
      if (startingAmount !== "" && isNaN(startingAmount)) {
        return res.status(400).json({ message: "Starting amount must be a number" });
      }
      goal.startingAmount = startingAmount === "" ? 0 : Number(startingAmount);
    }
    if (icon !== undefined) goal.icon = icon;
    if (note !== undefined) goal.note = (note || "").trim();

    await goal.save();
    res.status(200).json(goal);
  } catch (err) {
    res.status(500).json({ message: "Error updating goal", error: err.message });
  }
};

// @desc   Delete a goal
// @route  DELETE /api/v1/goal/:id
export const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user.id });
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }
    await goal.deleteOne();
    res.status(200).json({ message: "Goal deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting goal", error: err.message });
  }
};
