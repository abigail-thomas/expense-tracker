import ExpenseCategory from "../models/ExpenseCategory.js";
import { serverError } from "../middleware/errorMiddleware.js";

// A user can keep at most this many custom expense categories.
const MAX_CATEGORIES = 9;

// @desc   List the logged-in user's expense categories
// @route  GET /api/v1/expense-category/get
export const getExpenseCategories = async (req, res) => {
  try {
    const categories = await ExpenseCategory.find({ userId: req.user.id }).sort({
      createdAt: 1,
    });
    res.status(200).json(categories);
  } catch (err) {
    serverError(res, err, "Error fetching expense categories");
  }
};

// @desc   Create a new expense category
// @route  POST /api/v1/expense-category/add
export const addExpenseCategory = async (req, res) => {
  try {
    const { name, icon } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    const count = await ExpenseCategory.countDocuments({ userId: req.user.id });
    if (count >= MAX_CATEGORIES) {
      return res
        .status(400)
        .json({ message: `You can have at most ${MAX_CATEGORIES} categories` });
    }

    const exists = await ExpenseCategory.findOne({
      userId: req.user.id,
      name: name.trim(),
    });
    if (exists) {
      return res.status(400).json({ message: "A category with that name already exists" });
    }

    const category = await ExpenseCategory.create({
      userId: req.user.id,
      name: name.trim(),
      icon: icon || "",
    });
    res.status(201).json(category);
  } catch (err) {
    serverError(res, err, "Error creating expense category");
  }
};

// @desc   Update an expense category (rename / change icon)
// @route  PUT /api/v1/expense-category/:id
export const updateExpenseCategory = async (req, res) => {
  try {
    const { name, icon } = req.body;
    const category = await ExpenseCategory.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!category) {
      return res.status(404).json({ message: "Expense category not found" });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ message: "Name cannot be empty" });
      }
      // Guard against renaming into an existing name.
      const clash = await ExpenseCategory.findOne({
        userId: req.user.id,
        name: name.trim(),
        _id: { $ne: category._id },
      });
      if (clash) {
        return res.status(400).json({ message: "A category with that name already exists" });
      }
      category.name = name.trim();
    }
    if (icon !== undefined) category.icon = icon;

    await category.save();
    res.status(200).json(category);
  } catch (err) {
    serverError(res, err, "Error updating expense category");
  }
};

// @desc   Delete an expense category
// @route  DELETE /api/v1/expense-category/:id
export const deleteExpenseCategory = async (req, res) => {
  try {
    const category = await ExpenseCategory.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!category) {
      return res.status(404).json({ message: "Expense category not found" });
    }
    await category.deleteOne();
    res.status(200).json({ message: "Expense category deleted successfully" });
  } catch (err) {
    serverError(res, err, "Error deleting expense category");
  }
};
