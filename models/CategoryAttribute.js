const mongoose = require("mongoose");

const categoryAttributeSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

     subcategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

     subtosubcategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category"
    },

    name: { type: String, required: true, trim: true },
    code: { type: String, trim: true, lowercase: true },
    type: {
      type: String,
      enum: ["text", "number", "boolean", "date", "dropdown", "multiselect", "radio", "checkbox", "color", "url"],
      default: "text",
    },
    required: { type: Boolean, default: false },
    searchable: { type: Boolean, default: false },
    filterable: { type: Boolean, default: false },
    comparable: { type: Boolean, default: false },
    variantAttribute: { type: Boolean, default: false },
    visibleOnProductPage: { type: Boolean, default: true },
    unit: { type: String, default: "" },
    validation: { type: mongoose.Schema.Types.Mixed, default: {} },
    options: [{ type: String }],
    defaultValue: { type: mongoose.Schema.Types.Mixed, default: null },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", default: null },
  },
  { timestamps: true }
);

categoryAttributeSchema.index({ categoryId: 1, name: 1 }, { unique: false });

module.exports = mongoose.model("CategoryAttribute", categoryAttributeSchema);