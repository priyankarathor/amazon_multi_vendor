const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const productController = require("../controllers/productController");

router.post("/add", verifyToken, authorizeRoles("SuperAdmin", "Vendor"), productController.createProduct);
router.put("/:productId", verifyToken, authorizeRoles("SuperAdmin", "Vendor"), productController.updateProduct);
router.delete("/:productId", verifyToken, authorizeRoles("SuperAdmin", "Vendor"), productController.deleteProduct);
router.patch("/:productId/publish", verifyToken, authorizeRoles("SuperAdmin", "Vendor"), productController.publishProduct);
router.patch("/:productId/archive", verifyToken, authorizeRoles("SuperAdmin", "Vendor"), productController.archiveProduct);
router.post("/:productId/duplicate", verifyToken, authorizeRoles("SuperAdmin", "Vendor"), productController.duplicateProduct);
router.post("/bulk-update", verifyToken, authorizeRoles("SuperAdmin", "Vendor"), productController.bulkUpdateProducts);
router.post("/bulk-delete", verifyToken, authorizeRoles("SuperAdmin", "Vendor"), productController.bulkDeleteProducts);
router.get("/filter", verifyToken, productController.filterProducts);
router.get("/search", verifyToken, productController.searchProducts);
router.get("/filters/:categoryId", verifyToken, productController.getDynamicFilters);
router.get("/filters", verifyToken, productController.getDynamicFilters);
router.get("/inventory", verifyToken, productController.getInventory);
router.get("/inventory/vendor/:vendorId", verifyToken, productController.getVendorInventory);
router.put("/inventory/:vendorId/:productId/:variantId", verifyToken, productController.updateInventory);
router.patch("/variant/:variantId/status", verifyToken, productController.updateVariantStatus);
router.get("/vendor/:vendorId", verifyToken, productController.getVendorProducts);

router.get("/product", verifyToken, productController.productfetch);

router.get("/", productController.productfetchdetails);

router.get("/:productId", productController.getProductDetails);

module.exports = router;
