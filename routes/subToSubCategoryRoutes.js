const express = require("express");
const router = express.Router();

const {
  addSubToSubCategory,
  getSubToSubCategories,
  getSingleSubToSubCategory,
  updateSubToSubCategory,
  deleteSubToSubCategory,
} = require("../controllers/subToSubCategoryController");

router.post("/add", addSubToSubCategory);

router.get("/", getSubToSubCategories);

router.get("/:id", getSingleSubToSubCategory);

router.put("/:id", updateSubToSubCategory);

router.delete("/:id", deleteSubToSubCategory);

module.exports = router;