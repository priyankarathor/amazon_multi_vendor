const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false, // false because before OTP verify only email may be stored
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    number: {
      type: String,
      required: false,
    },

    password: {
      type: String,
      required: false,
    },

    status: {
      type: String,
      enum: ["pending", "active", "inactive", "blocked"],
      default: "pending",
    },

    role: {
      type: String,
      enum: ["Vendor", "SuperAdmin"],
      default: "Vendor",
    },

    companyname: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      default: "",
    },

    city: {
      type: String,
      default: "",
    },

    state: {
      type: String,
      default: "",
    },

    pincode: {
      type: String,
      default: "",
    },

    otp: {
      type: String,
      default: null,
    },

    otpExpiry: {
      type: Date,
      default: null,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("vender", userSchema);