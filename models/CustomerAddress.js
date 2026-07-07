const mongoose = require("mongoose");

const customerAddressSchema = new mongoose.Schema(
  {
    
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    first_name: String,
    last_name: String,
    phone: String,
    email: String,

    billing_address: Object,
    shipping_address: Object,
  },
  { timestamps: true }
);

module.exports = mongoose.model("CustomerAddress", customerAddressSchema);