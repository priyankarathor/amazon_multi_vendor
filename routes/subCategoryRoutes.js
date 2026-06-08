const express = require("express");
const router = express.Router();

const {
  addSubCategory,
  getSubCategories,
  getSingleSubCategory,
  updateSubCategory,
  deleteSubCategory,
} = require("../controllers/subCategoryController");

// CREATE
router.post("/add", addSubCategory);

// GET ALL
router.get("/", getSubCategories);

// GET SINGLE
router.get("/:id", getSingleSubCategory);

// UPDATE
router.put("/update/:id", updateSubCategory);

// DELETE
router.delete("/delete/:id", deleteSubCategory);

module.exports = router;