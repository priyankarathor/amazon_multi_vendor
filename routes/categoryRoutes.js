const express = require("express");
const router = express.Router();

const controller = require("../controllers/categoryController");

router.post("/add", controller.createCategory);
router.get("/", controller.getCategories);
router.get("/:id", controller.getCategory);
router.put("/:id", controller.updateCategory);
router.delete("/delete/:id", controller.deleteCategory);

module.exports = router;