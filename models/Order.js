const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    order_number: {
      type: String,
      required: true,
      unique: true,
    },

    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Enduser",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    payment_method: {
      type: String,
      enum: ["COD", "UPI", "Card", "NetBanking"],
      required: true,
    },

    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor",
        required: true
    },

    payment_status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    payment_transaction_id: String,

    subtotal: Number,
    tax_amount: Number,
    discount_amount: Number,
    shipping_amount: Number,
    total: Number,

    currency: {
      type: String,
      default: "INR",
    },

    coupon_id: String,
    coupon_code: String,

    billing_address: Object,
    shipping_address: Object,

    tracking_number: String,
    carrier: String,

    customer_notes: String,
    admin_notes: String,

    paid_at: Date,
    shipped_at: Date,
    delivered_at: Date,
    cancelled_at: Date,

   
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
