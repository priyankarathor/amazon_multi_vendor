const express = require("express");

const router = express.Router();

const {
  addCategory,
  getCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");


// INSERT
router.post("/add", addCategory);


// GET ALL
router.get("/", getCategories);


// GET SINGLE
router.get("/:id", getSingleCategory);


// UPDATE
router.put("/update/:id", updateCategory);


// DELETE
router.delete("/delete/:id", deleteCategory);


module.exports = router;