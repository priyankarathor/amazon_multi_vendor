const Review = require("../models/Review");


// Create Review
exports.createReview = async (req, res) => {
  try {
    const review = await Review.create(req.body);

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// Get All Reviews
exports.getAllReviews = async (req, res) => {
  try {

    const reviews = await Review.find()
      .populate("pid", "productName")
      .populate("variantId")
      .populate("vendorId", "businessName");

    res.json({
      success: true,
      count: reviews.length,
      data: reviews,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// Get Review By Id
exports.getReviewById = async (req, res) => {
  try {

    const review = await Review.findById(req.params.id)
      .populate("pid")
      .populate("variantId")
      .populate("vendorId");

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.json({
      success: true,
      data: review,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};



// Get Reviews By Product
exports.getReviewsByProduct = async (req, res) => {
  try {

    const reviews = await Review.find({
      pid: req.params.pid,
    }).populate("vendorId", "businessName");

    res.json({
      success: true,
      count: reviews.length,
      data: reviews,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// Get Reviews By Vendor
exports.getReviewsByVendor = async (req, res) => {
  try {

    const reviews = await Review.find({
      vendorId: req.params.vendorId,
    }).populate("pid", "productName");

    res.json({
      success: true,
      count: reviews.length,
      data: reviews,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// Update Review
exports.updateReview = async (req, res) => {

  try {

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.json({
      success: true,
      data: review,
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};


// Delete Review
exports.deleteReview = async (req, res) => {

  try {

    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.json({
      success: true,
      message: "Review deleted successfully",
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};