const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    // Customer
    cid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Enduser",
      default: null,
    },

    // Product
    pid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    categoryId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    subcategoryId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },


    // Product Variant
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variant",
      required: true,
    },

    // Vendor
    venderid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },

    // Device ID
    divid: {
      type: String,
      required: true,
      trim: true,
    },

    // Quantity
    qty: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },

    // Offer Discount
    offerDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Cart", cartSchema);

