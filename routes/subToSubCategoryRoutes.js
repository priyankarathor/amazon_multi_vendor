const express = require("express");
const router = express.Router();

const {
  addSubToSubCategory,
  getSubToSubCategories,
  getSingleSubToSubCategory,
  updateSubToSubCategory,
  deleteSubToSubCategory,
} = require("../controllers/subToSubCategoryController");


// CREATE
router.post("/add", addSubToSubCategory);

// GET ALL
router.get("/", getSubToSubCategories);

// GET SINGLE
router.get("/:id", getSingleSubToSubCategory);

// UPDATE
router.put("/update/:id", updateSubToSubCategory);

// DELETE
router.delete("/delete/:id", deleteSubToSubCategory);

module.exports = router;