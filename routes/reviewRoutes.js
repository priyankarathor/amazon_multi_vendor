const express = require("express");

const router = express.Router();

const {
  createReview,
  getAllReviews,
  getReviewById,
  getReviewsByProduct,
  getReviewsByVendor,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");


// Create
router.post("/", createReview);

// Get All
router.get("/", getAllReviews);

// Product Reviews
router.get("/product/:pid", getReviewsByProduct);

// Vendor Reviews
router.get("/vendor/:vendorId", getReviewsByVendor);

// Get Single
router.get("/:id", getReviewById);

// Update
router.put("/:id", updateReview);

// Delete
router.delete("/:id", deleteReview);

module.exports = router;