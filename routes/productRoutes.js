const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const productController = require("../controllers/productController");

router.post("/add", productController.createProduct);

router.get("/vendor/:vendorId", verifyToken, productController.getVendorProducts);
router.get("/", productController.productfetch);
router.get("/:productId", productController.getProductDetails);

module.exports = router;