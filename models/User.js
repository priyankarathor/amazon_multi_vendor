const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
      trim: true,
    },

    // NOTE: email is NOT required at schema level anymore.
    // Why: sendwhatsappOtp() creates a user with only a phone number,
    // and that used to crash because email was required+unique.
    // Registration (registerUser) still enforces email is present
    // and verified before it lets someone finish signing up.
    email: {
      type: String,
      required: false,
      unique: true,
      sparse: true, // allows many docs with no email without violating "unique"
      lowercase: true,
      trim: true,
    },

    number: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      trim: true,
    },

    password: {
      type: String,
      required: false,
      select: false, // never returned by default find/findOne queries
    },

    status: {
      type: String,
      enum: ["pending", "active", "inactive", "blocked"],
      default: "pending",
    },

    // Fixed casing to match what the controller actually sets ("Vendor").
    // Mixed-case enums vs lowercase assignments were causing silent
    // ValidationErrors on every registration.
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
      select: false,
    },

    otpExpiry: {
      type: Date,
      default: null,
      select: false,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    otpphone: {
      type: String,
      default: null,
      select: false,
    },

    otpExpiryphone: {
      type: Date,
      default: null,
      select: false,
    },

    isVerifiedphone: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("vender", userSchema);
