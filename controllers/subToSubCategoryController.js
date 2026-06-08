const mongoose = require("mongoose");
const SubToSubCategory = require("../models/SubToSubCategory");


// ================= CREATE =================
const addSubToSubCategory = async (req, res) => {
  try {
    const data = await SubToSubCategory.create(req.body);

    res.status(201).json({
      success: true,
      message: "Sub To Sub Category Added Successfully",
      subToSubCategory: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ================= GET ALL =================
const getSubToSubCategories = async (req, res) => {
  try {
    const data = await SubToSubCategory.find()
      .populate("categoryId")
      .populate("subCategoryId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: data.length,
      subToSubCategories: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ================= GET SINGLE =================
const getSingleSubToSubCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID",
      });
    }

    const data = await SubToSubCategory.findById(id)
      .populate("categoryId")
      .populate("subCategoryId");

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Data not found",
      });
    }

    res.status(200).json({
      success: true,
      subToSubCategory: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ================= UPDATE =================
const updateSubToSubCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID",
      });
    }

    const data = await SubToSubCategory.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("categoryId")
      .populate("subCategoryId");

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Data not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Updated Successfully",
      subToSubCategory: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ================= DELETE =================
const deleteSubToSubCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID",
      });
    }

    const data = await SubToSubCategory.findByIdAndDelete(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Data not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addSubToSubCategory,
  getSubToSubCategories,
  getSingleSubToSubCategory,
  updateSubToSubCategory,
  deleteSubToSubCategory,
};