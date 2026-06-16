const mongoose = require("mongoose");

const categoryAttributeSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    name: {
      type: String, // RAM, Processor, Size
      required: true,
    },

    type: {
      type: String,
      enum: ["text", "number", "dropdown"],
      default: "text",
    },

    options: [String], // dropdown values

    required: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "CategoryAttribute",
  categoryAttributeSchema
);