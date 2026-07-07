const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
{
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true
  },

  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },

  variantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Variant",
    required: true
  },

  stock: { type: Number, default: 0, min: 0 },

  maxQty: { type: Number, default: 0, min: 0 },

  isActive: { type: Boolean, default: true }
},
{ timestamps: true });

module.exports = mongoose.model("Inventory", inventorySchema);
