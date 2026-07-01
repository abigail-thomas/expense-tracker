import IncomeSource from "../models/IncomeSource.js";

// @desc   List the logged-in user's income sources
// @route  GET /api/v1/income-source/get
export const getIncomeSources = async (req, res) => {
  try {
    const sources = await IncomeSource.find({ userId: req.user.id }).sort({
      createdAt: 1,
    });
    res.status(200).json(sources);
  } catch (err) {
    res.status(500).json({ message: "Error fetching income sources", error: err.message });
  }
};

// @desc   Create a new income source
// @route  POST /api/v1/income-source/add
export const addIncomeSource = async (req, res) => {
  try {
    const { name, icon } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    const exists = await IncomeSource.findOne({
      userId: req.user.id,
      name: name.trim(),
    });
    if (exists) {
      return res.status(400).json({ message: "A source with that name already exists" });
    }

    const source = await IncomeSource.create({
      userId: req.user.id,
      name: name.trim(),
      icon: icon || "",
    });
    res.status(201).json(source);
  } catch (err) {
    res.status(500).json({ message: "Error creating income source", error: err.message });
  }
};

// @desc   Update an income source (rename / change icon)
// @route  PUT /api/v1/income-source/:id
export const updateIncomeSource = async (req, res) => {
  try {
    const { name, icon } = req.body;
    const source = await IncomeSource.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!source) {
      return res.status(404).json({ message: "Income source not found" });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ message: "Name cannot be empty" });
      }
      // Guard against renaming into an existing name.
      const clash = await IncomeSource.findOne({
        userId: req.user.id,
        name: name.trim(),
        _id: { $ne: source._id },
      });
      if (clash) {
        return res.status(400).json({ message: "A source with that name already exists" });
      }
      source.name = name.trim();
    }
    if (icon !== undefined) source.icon = icon;

    await source.save();
    res.status(200).json(source);
  } catch (err) {
    res.status(500).json({ message: "Error updating income source", error: err.message });
  }
};

// @desc   Delete an income source
// @route  DELETE /api/v1/income-source/:id
export const deleteIncomeSource = async (req, res) => {
  try {
    const source = await IncomeSource.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!source) {
      return res.status(404).json({ message: "Income source not found" });
    }
    await source.deleteOne();
    res.status(200).json({ message: "Income source deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting income source", error: err.message });
  }
};
