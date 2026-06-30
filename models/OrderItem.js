const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    product_variant_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    vendor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
    },

    product_name: String,
    sku: String,
    variant_attributes: Object,

    quantity: Number,
    unit_price: Number,
    tax_amount: Number,
    discount_amount: Number,
    total: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("OrderItem", orderItemSchema);