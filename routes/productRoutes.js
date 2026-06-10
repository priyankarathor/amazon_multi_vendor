const express = require("express");
const router = express.Router();

const {
  addProduct,
  getProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");


// PUBLIC ROUTES

router.get("/", getProducts);

router.get("/:id", getSingleProduct);


// PRIVATE ROUTES

router.post(
  "/add",
  verifyToken,
  authorizeRoles("vendor", "admin"),
  addProduct
);

router.put(
  "/update/:id",
  verifyToken,
  authorizeRoles("vendor", "admin"),
  updateProduct
);

router.delete(
  "/delete/:id",
  verifyToken,
  authorizeRoles("admin"),
  deleteProduct
);

module.exports = router;