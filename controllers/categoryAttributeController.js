const CategoryAttribute = require("../models/CategoryAttribute");

// ADD ATTRIBUTE
const addAttribute = async (req, res) => {
  try {
    const data = await CategoryAttribute.create(req.body);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ATTRIBUTES BY CATEGORY
const getAttributesByCategory = async (req, res) => {
  const data = await CategoryAttribute.find({
    categoryId: req.params.categoryId,
  });

  res.json({ success: true, data });
};

// DELETE ATTRIBUTE
const deleteAttribute = async (req, res) => {
  await CategoryAttribute.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Deleted" });
};

module.exports = {
  addAttribute,
  getAttributesByCategory,
  deleteAttribute,
};