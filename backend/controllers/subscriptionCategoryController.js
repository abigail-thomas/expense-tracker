import SubscriptionCategory from "../models/SubscriptionCategory.js";
import { serverError } from "../middleware/errorMiddleware.js";

// A user can keep at most this many subscription categories.
const MAX_CATEGORIES = 9;

// Categories seeded for a user the first time they load their list.
const DEFAULT_CATEGORIES = [
  { name: "Streaming Service", icon: "streaming" },
  { name: "Gym", icon: "gym" },
  { name: "Music & Podcasts", icon: "music" },
  { name: "E-commerce", icon: "ecommerce" },
  { name: "Apps", icon: "apps" },
  { name: "Rent", icon: "rent" },
  { name: "Utilities", icon: "utilities" },
  { name: "Other", icon: "other" },
];

// @desc   List the logged-in user's subscription categories (seeding defaults on first use)
// @route  GET /api/v1/subscription-category/get
export const getSubscriptionCategories = async (req, res) => {
  try {
    let categories = await SubscriptionCategory.find({ userId: req.user.id }).sort({
      createdAt: 1,
    });
    if (categories.length === 0) {
      categories = await SubscriptionCategory.insertMany(
        DEFAULT_CATEGORIES.map((c) => ({ ...c, userId: req.user.id }))
      );
    }
    res.status(200).json(categories);
  } catch (err) {
    serverError(res, err, "Error fetching subscription categories");
  }
};

// @desc   Create a new subscription category
// @route  POST /api/v1/subscription-category/add
export const addSubscriptionCategory = async (req, res) => {
  try {
    const { name, icon } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    const count = await SubscriptionCategory.countDocuments({ userId: req.user.id });
    if (count >= MAX_CATEGORIES) {
      return res
        .status(400)
        .json({ message: `You can have at most ${MAX_CATEGORIES} categories` });
    }

    const exists = await SubscriptionCategory.findOne({
      userId: req.user.id,
      name: name.trim(),
    });
    if (exists) {
      return res.status(400).json({ message: "A category with that name already exists" });
    }

    const category = await SubscriptionCategory.create({
      userId: req.user.id,
      name: name.trim(),
      icon: icon || "",
    });
    res.status(201).json(category);
  } catch (err) {
    serverError(res, err, "Error creating subscription category");
  }
};

// @desc   Update a subscription category (rename / change icon)
// @route  PUT /api/v1/subscription-category/:id
export const updateSubscriptionCategory = async (req, res) => {
  try {
    const { name, icon } = req.body;
    const category = await SubscriptionCategory.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!category) {
      return res.status(404).json({ message: "Subscription category not found" });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ message: "Name cannot be empty" });
      }
      const clash = await SubscriptionCategory.findOne({
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
    serverError(res, err, "Error updating subscription category");
  }
};

// @desc   Delete a subscription category
// @route  DELETE /api/v1/subscription-category/:id
export const deleteSubscriptionCategory = async (req, res) => {
  try {
    const category = await SubscriptionCategory.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!category) {
      return res.status(404).json({ message: "Subscription category not found" });
    }
    await category.deleteOne();
    res.status(200).json({ message: "Subscription category deleted successfully" });
  } catch (err) {
    serverError(res, err, "Error deleting subscription category");
  }
};
