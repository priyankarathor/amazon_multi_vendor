const Category = require("../models/Category");
const CategoryAttribute = require("../models/CategoryAttribute");

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const createAttribute = async (req, res) => {
  try {
    const { categoryId, name, type, code } = req.body;

    if (!categoryId || !name) {
      return res.status(400).json({ success: false, message: "categoryId and name are required" });
    }

    const category = await Category.findOne({ _id: categoryId, isDeleted: false });
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const attributeCode = code || slugify(name);
    const exists = await CategoryAttribute.findOne({ categoryId, $or: [{ name: { $regex: `^${name.trim()}$`, $options: "i" } }, { code: attributeCode }] , isDeleted: false });
    if (exists) {
      return res.status(409).json({ success: false, message: "Attribute already exists for this category" });
    }

    const data = await CategoryAttribute.create({
      ...req.body,
      code: attributeCode,
      createdBy: req.user?.id || req.user?.vendorId || null,
      updatedBy: req.user?.id || req.user?.vendorId || null,
    });

    return res.status(201).json({ success: true, message: "Attribute created successfully", data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getAttribute = async (req, res) => {
  try {
    const data = await CategoryAttribute.findOne({ _id: req.params.id, isDeleted: false });
    if (!data) {
      return res.status(404).json({ success: false, message: "Attribute not found" });
    }
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getAttributesByCategory = async (req, res) => {
  try {
    const query = { categoryId: req.params.categoryId, isDeleted: false };
    if (req.query.status) query.status = req.query.status;
    const data = await CategoryAttribute.find(query).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updateAttribute = async (req, res) => {
  try {
    const attribute = await CategoryAttribute.findOne({ _id: req.params.id, isDeleted: false });
    if (!attribute) {
      return res.status(404).json({ success: false, message: "Attribute not found" });
    }

    Object.entries(req.body).forEach(([field, value]) => {
      if (value !== undefined) {
        attribute[field] = value;
      }
    });

    attribute.updatedBy = req.user?.id || req.user?.vendorId || attribute.updatedBy;
    await attribute.save();

    return res.status(200).json({ success: true, message: "Attribute updated successfully", data: attribute });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const deleteAttribute = async (req, res) => {
  try {
    const attribute = await CategoryAttribute.findById(req.params.id);
    if (!attribute || attribute.isDeleted) {
      return res.status(404).json({ success: false, message: "Attribute not found" });
    }

    attribute.isDeleted = true;
    attribute.deletedAt = new Date();
    attribute.status = "inactive";
    await attribute.save();

    return res.status(200).json({ success: true, message: "Attribute deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createAttribute,
  getAttribute,
  getAttributesByCategory,
  updateAttribute,
  deleteAttribute,
};