const mongoose = require("mongoose");

const enduserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },

    lastname: {
      type: String,
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
      default: "Active",
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

module.exports = mongoose.model("Endser", enduserSchema);