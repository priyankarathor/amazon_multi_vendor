const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema(
{
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },

  sku: { type: String, required: true },

  attributes: [
    {
      name: String,   // color, size
      value: String
    }
  ],

  images: [String],

  offer: {
    mrp: Number,
    sellingPrice: Number,
    salePrice: Number,
    handlingTime: Number,
    itemCondition: String
  }
},
{ timestamps: true });

module.exports = mongoose.model("Variant", variantSchema);