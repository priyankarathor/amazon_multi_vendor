const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const productController = require("../controllers/productController");

router.post("/add", productController.createProduct);
router.put("/:productId", productController.updateProduct);

router.get("/filter", productController.filterProducts);
router.get("/inventory", productController.getInventory);
router.get("/inventory/vendor/:vendorId", productController.getVendorInventory);
router.put("/inventory/:vendorId/:productId/:variantId", productController.updateInventory);
router.patch("/variant/:variantId/status", productController.updateVariantStatus);
router.get("/vendor/:vendorId", verifyToken, productController.getVendorProducts);
router.get("/", productController.productfetch);
router.get("/:productId", productController.getProductDetails);

module.exports = router;
