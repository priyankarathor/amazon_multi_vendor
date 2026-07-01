const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const productController = require("../controllers/productController");

// CREATE PRODUCT
router.post("/add", productController.createProduct);

// GET PRODUCT DETAILS BY ID
router.get("/:productId", productController.getProductDetails);
router.get("/", productController.productfetch);
router.get("/vendor/:vendorId", verifyToken, productController.getVendorProducts);

module.exports = router;