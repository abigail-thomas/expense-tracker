import GoalCategory from "../models/GoalCategory.js";
import { serverError } from "../middleware/errorMiddleware.js";

// A user can keep at most this many goal categories.
const MAX_CATEGORIES = 9;

// Categories seeded for a user the first time they load their list.
const DEFAULT_CATEGORIES = [
  { name: "Home", icon: "home" },
  { name: "Auto", icon: "auto" },
  { name: "Travel", icon: "travel" },
  { name: "Education", icon: "education" },
  { name: "Hobbies", icon: "hobbies" },
  { name: "Gifts", icon: "gifts" },
  { name: "Debt", icon: "debt" },
  { name: "Other", icon: "other" },
];

// @desc   List the logged-in user's goal categories (seeding defaults on first use)
// @route  GET /api/v1/goal-category/get
export const getGoalCategories = async (req, res) => {
  try {
    let categories = await GoalCategory.find({ userId: req.user.id }).sort({
      createdAt: 1,
    });
    if (categories.length === 0) {
      categories = await GoalCategory.insertMany(
        DEFAULT_CATEGORIES.map((c) => ({ ...c, userId: req.user.id }))
      );
    }
    res.status(200).json(categories);
  } catch (err) {
    serverError(res, err, "Error fetching goal categories");
  }
};

// @desc   Create a new goal category
// @route  POST /api/v1/goal-category/add
export const addGoalCategory = async (req, res) => {
  try {
    const { name, icon } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    const count = await GoalCategory.countDocuments({ userId: req.user.id });
    if (count >= MAX_CATEGORIES) {
      return res
        .status(400)
        .json({ message: `You can have at most ${MAX_CATEGORIES} categories` });
    }

    const exists = await GoalCategory.findOne({
      userId: req.user.id,
      name: name.trim(),
    });
    if (exists) {
      return res.status(400).json({ message: "A category with that name already exists" });
    }

    const category = await GoalCategory.create({
      userId: req.user.id,
      name: name.trim(),
      icon: icon || "",
    });
    res.status(201).json(category);
  } catch (err) {
    serverError(res, err, "Error creating goal category");
  }
};

// @desc   Update a goal category (rename / change icon)
// @route  PUT /api/v1/goal-category/:id
export const updateGoalCategory = async (req, res) => {
  try {
    const { name, icon } = req.body;
    const category = await GoalCategory.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!category) {
      return res.status(404).json({ message: "Goal category not found" });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ message: "Name cannot be empty" });
      }
      const clash = await GoalCategory.findOne({
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
    serverError(res, err, "Error updating goal category");
  }
};

// @desc   Delete a goal category
// @route  DELETE /api/v1/goal-category/:id
export const deleteGoalCategory = async (req, res) => {
  try {
    const category = await GoalCategory.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!category) {
      return res.status(404).json({ message: "Goal category not found" });
    }
    await category.deleteOne();
    res.status(200).json({ message: "Goal category deleted successfully" });
  } catch (err) {
    serverError(res, err, "Error deleting goal category");
  }
};
