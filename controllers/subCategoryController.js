const SubCategory = require("../models/SubCategory");

// CREATE
const addSubCategory = async (req, res) => {
  try {
    const data = await SubCategory.create(req.body);

    res.status(201).json({
      success: true,
      message: "SubCategory Added Successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL
const getSubCategories = async (req, res) => {
  try {
    const data = await SubCategory.find().populate("categoryId");

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE
const getSingleSubCategory = async (req, res) => {
  try {
    const data = await SubCategory.findById(req.params.id).populate("categoryId");

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE
const updateSubCategory = async (req, res) => {
  try {
    const data = await SubCategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "SubCategory Updated Successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE
const deleteSubCategory = async (req, res) => {
  try {
    await SubCategory.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "SubCategory Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addSubCategory,
  getSubCategories,
  getSingleSubCategory,
  updateSubCategory,
  deleteSubCategory,
};