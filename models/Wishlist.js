const mongoose = require("mongoose");

const WishlistSchema = new mongoose.Schema(
  {
    cid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Enduser",
      required: false,
    },

    pid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    divid: {
      type: String,
      required: true,
    },

    qty: {
      type: Number,
      required: true,
      default: 1,
    },

    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variant",
    },

    venderid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
    },

    offerDiscount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Wishlist", WishlistSchema);
