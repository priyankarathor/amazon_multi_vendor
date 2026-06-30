const Wishlist = require("../models/Wishlist");

// Create Wishlist
exports.createWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.create(req.body);

    res.status(201).json({
      success: true,
      data: wishlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Wishlist
exports.getAllWishlist = async (req, res) => {
  try {
    const wishlists = await Wishlist.find()
      .populate("pid")
      .populate("variantId");

    res.status(200).json({
      success: true,
      count: wishlists.length,
      data: wishlists,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Wishlist By ID
exports.getWishlistById = async (req, res) => {
  try {
    const wishlist = await Wishlist.findById(req.params.id)
      .populate("pid")
      .populate("variantId");

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    res.status(200).json({
      success: true,
      data: wishlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Wishlist By Device ID
exports.getWishlistByDivid = async (req, res) => {
  try {
    const { divid } = req.params;

    const wishlistData = await Wishlist.find({ divid })
      .populate("pid")
      .populate("variantId");

    if (wishlistData.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No wishlist found for this device id",
      });
    }

    res.status(200).json({
      success: true,
      count: wishlistData.length,
      data: wishlistData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Wishlist
exports.updateWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    res.status(200).json({
      success: true,
      data: wishlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Wishlist
exports.deleteWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findByIdAndDelete(req.params.id);

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Wishlist deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};