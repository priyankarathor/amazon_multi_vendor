const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Product = require("../models/Product")

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
    const { categoryId } = req.query;

    const cartData = await Cart.find({ divid })
      .populate("pid")
      .populate("variantId");

    if (cartData.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No cart found for this device id",
      });
    }

    const filteredCart = categoryId
      ? cartData.filter((item) => {
          const product = item.pid;
          return product && product.categoryId && product.categoryId.toString() === categoryId;
        })
      : cartData;

    res.status(200).json({
      success: true,
      count: filteredCart.length,
      data: filteredCart,
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
;

exports.getRecommendedProductsByDivid = async (req, res) => {
  try {
    const { divid } = req.params;

    // Get Cart Data
    const cartItems = await Cart.find({ divid }).populate("pid");

    if (!cartItems.length) {
      return res.status(404).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // Collect categoryIds
    const categoryIds = [
      ...new Set(
        cartItems
          .map((item) => item.pid?.categoryId?.toString())
          .filter(Boolean)
      ),
    ].map((id) => new mongoose.Types.ObjectId(id));

    // Collect subcategoryIds
    const subcategoryIds = [
      ...new Set(
        cartItems
          .map((item) => item.pid?.subcategoryId?.toString())
          .filter(Boolean)
      ),
    ].map((id) => new mongoose.Types.ObjectId(id));

    // Existing Cart Product Ids
    const cartProductIds = cartItems.map(
      (item) => new mongoose.Types.ObjectId(item.pid._id)
    );

    // Random Related Products
    const products = await Product.aggregate([
  {
    $match: {
      _id: { $nin: cartProductIds },
      isActive: true,
      $or: [
        {
          categoryId: { $in: categoryIds },
          subcategoryId: { $in: subcategoryIds },
        },
        {
          categoryId: { $in: categoryIds },
        },
      ],
    },
  },
  {
    $sample: {
      size: 10,
    },
  },
]);
    return res.status(200).json({
      success: true,
      cartCategories: categoryIds.length,
      cartSubcategories: subcategoryIds.length,
      count: products.length,
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};