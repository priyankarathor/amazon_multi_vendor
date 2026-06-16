const Category = require("../models/Category");

// CREATE
const createCategory = async (req, res) => {
  try {
    const data = await Category.create(req.body);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL
const getCategories = async (req, res) => {
  const data = await Category.find();
  res.json({ success: true, data });
};

// GET ONE
const getCategory = async (req, res) => {
  const data = await Category.findById(req.params.id);
  res.json({ success: true, data });
};

// UPDATE
const updateCategory = async (req, res) => {
  const data = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json({ success: true, data });
};

// DELETE
const deleteCategory = async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Deleted" });
};

module.exports = {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
};