const Cart = require("../models/Cart");

// Create Cart
exports.createCart = async (req, res) => {
  try {
    const cart = await Cart.create(req.body);

    res.status(201).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Cart Items
exports.getAllCart = async (req, res) => {
  try {
    const carts = await Cart.find()
      .populate("cid")
      .populate("pid")
      .populate("variantId");

    res.status(200).json({
      success: true,
      count: carts.length,
      data: carts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Cart By ID
exports.getCartById = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id)
      .populate("cid")
      .populate("pid")
      .populate("variantId");

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Cart Qty
exports.updateCart = async (req, res) => {
  try {
    const cart = await Cart.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Cart
exports.deleteCart = async (req, res) => {
  try {
    const cart = await Cart.findByIdAndDelete(req.params.id);

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cart deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};