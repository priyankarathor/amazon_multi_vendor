const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");

// CREATE PRODUCT
router.post("/create", productController.createProduct);

// GET PRODUCT DETAILS BY ID
router.get("/:productId", productController.getProductDetails);

module.exports = router;