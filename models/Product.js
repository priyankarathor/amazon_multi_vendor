const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true },
    sku: { type: String, required: true },
    price: { type: Number, required: true },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },

    attributes: [
      {
        name: String,
        value: String,
      },
    ],

    images: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);