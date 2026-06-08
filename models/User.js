const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    number: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      default: "active",
    },

    role: {
      type: String,
      default: "user",
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);