const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema(
{
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },

  variantName: { type: String}, 
  sku: { type: String, required: true },

  productUrl: { type: String, trim: true },

  attributes: [
    {
      name: String,   // color, size
      code: String,
      value: String
    }
  ],

  images: [String],

  isActive: {
    type: Boolean,
    default: true
  },

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
