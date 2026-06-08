const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    productName: {
      type: String,
      required: true,
      trim: true,
    },

    images: [
      {
        type: String,
      },
    ],

    thumbnailImage: {
      type: String,
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    subCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },

    subToSubCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubToSubCategory",
    },

    brand: {
      type: String,
      required: true,
    },

    sku: {
      type: String,
      unique: true,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    salePrice: {
      type: Number,
      default: 0,
    },

    discount: {
      type: Number,
      default: 0,
    },

    minQuantity: {
      type: Number,
      default: 1,
    },

    maxQuantity: {
      type: Number,
      default: 10,
    },

    stock: {
      type: Number,
      default: 0,
    },

    description: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);