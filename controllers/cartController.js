const mongoose = require("mongoose");
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

// Get All Cart
exports.getAllCart = async (req, res) => {
  try {
    const carts = await Cart.find()
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
    console.log("Requested ID:", req.params.id);

    const cart = await Cart.findById(req.params.id)
      .populate("pid")
      .populate("variantId");

    console.log("Cart:", cart);

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
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// Get Cart By Device ID
exports.getCartByDivid = async (req, res) => {
  try {
    const { divid } = req.params;

    const cartData = await Cart.find({ divid })
      .populate("pid")
      .populate("variantId");

    if (cartData.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No cart found for this device id",
      });
    }

    res.status(200).json({
      success: true,
      count: cartData.length,
      data: cartData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//get cart by cid

// Get Cart By Customer ID
exports.getCartByCid = async (req, res) => {
  try {
    const { cid } = req.params;

    console.log("Customer ID:", cid);

    const cart = await Cart.find({ cid })
      .populate("pid")
      .populate("variantId");

    if (!cart || cart.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Cart not found for this customer",
      });
    }

    res.status(200).json({
      success: true,
      count: cart.length,
      data: cart,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//vender id 
exports.getCartByVendor = async (req, res) => {
  try {
    const { venderid } = req.params;

    const cart = await Cart.find({ venderid })
      .populate("pid")
      .populate("variantId")
      .populate("cid")
      .populate("venderid");

    if (!cart.length) {
      return res.status(404).json({
        success: false,
        message: "No cart found",
      });
    }

    res.status(200).json({
      success: true,
      count: cart.length,
      data: cart,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Update Cart
exports.updateCart = async (req, res) => {
  try {
    const { qty } = req.body;

    if (qty && qty < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const cart = await Cart.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
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