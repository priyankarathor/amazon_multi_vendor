const Category = require("../models/Category");


// INSERT CATEGORY
const addCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);

    res.status(201).json({
      success: true,
      message: "Category Added Successfully",
      category,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// GET ALL CATEGORY
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();

    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// GET SINGLE CATEGORY
const getSingleCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// UPDATE CATEGORY
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Category Updated Successfully",
      category,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// DELETE CATEGORY
const deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Category Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


module.exports = {
  addCategory,
  getCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
};