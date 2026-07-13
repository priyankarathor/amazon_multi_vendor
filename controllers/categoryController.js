const mongoose = require("mongoose");
const Category = require("../models/Category");

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getCategoryLevel = async (parentCategoryId) => {
  if (!parentCategoryId) return 0;
  const parent = await Category.findById(parentCategoryId);
  return parent ? parent.level + 1 : 0;
};

const ensureNoCircularRelationship = async (parentCategoryId, categoryId) => {
  if (!parentCategoryId || !categoryId) return true;
  if (parentCategoryId.toString() === categoryId.toString()) return false;

  let currentId = parentCategoryId;
  const visited = new Set();

  while (currentId) {
    if (visited.has(currentId.toString())) break;
    visited.add(currentId.toString());

    const current = await Category.findById(currentId);
    if (!current) return true;
    if (current.parentCategoryId && current.parentCategoryId.toString() === categoryId.toString()) {
      return false;
    }
    currentId = current.parentCategoryId;
  }

  return true;
};

const recalculateDescendantLevels = async (parentId, startLevel) => {
  const children = await Category.find({ parentCategoryId: parentId, isDeleted: false });

  for (const child of children) {
    const nextLevel = startLevel + 1;
    await Category.findByIdAndUpdate(child._id, { level: nextLevel });
    await recalculateDescendantLevels(child._id, nextLevel);
  }
};

const buildCategoryTree = (categories, parentId = null) => {
  const nodes = categories.filter((item) => {
    const parentValue = item.parentCategoryId ? item.parentCategoryId.toString() : null;
    return parentValue === (parentId ? parentId.toString() : null);
  });

  return nodes.map((node) => ({
    ...node.toObject(),
    children: buildCategoryTree(categories, node._id),
  }));
};

const createCategory = async (req, res) => {
  try {
    const { name, slug, parentCategoryId, status } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }

    const normalizedSlug = slug || slugify(name);
    const existingSlug = await Category.findOne({ slug: normalizedSlug, isDeleted: false });
    if (existingSlug) {
      return res.status(409).json({ success: false, message: "Slug already exists" });
    }

    const safeParentId = parentCategoryId && mongoose.Types.ObjectId.isValid(parentCategoryId) ? parentCategoryId : null;
    if (safeParentId) {
      const parent = await Category.findOne({ _id: safeParentId, isDeleted: false });
      if (!parent) {
        return res.status(404).json({ success: false, message: "Parent category not found" });
      }
    }

    const duplicateName = await Category.findOne({
      name: { $regex: `^${escapeRegex(name.trim())}$`, $options: "i" },
      parentCategoryId: safeParentId || null,
      isDeleted: false,
    });

    if (duplicateName) {
      return res.status(409).json({ success: false, message: "A category with this name already exists under the same parent" });
    }

    const isCircular = safeParentId ? await ensureNoCircularRelationship(safeParentId, null) : true;
    if (!isCircular) {
      return res.status(400).json({ success: false, message: "Circular parent relationship is not allowed" });
    }

    const level = safeParentId ? await getCategoryLevel(safeParentId) : 0;
    const category = await Category.create({
      ...req.body,
      name: name.trim(),
      slug: normalizedSlug,
      parentCategoryId: safeParentId,
      level,
      status: status || "active",
      createdBy: req.user?.id || req.user?.vendorId || null,
      updatedBy: req.user?.id || req.user?.vendorId || null,
    });

    return res.status(201).json({ success: true, message: "Category created successfully", data: category });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getCategories = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;
    const search = req.query.search || "";
    const status = req.query.status;
    const parentCategoryId = req.query.parentCategoryId;

    const query = { isDeleted: false };
    if (status) query.status = status;
    if (parentCategoryId) query.parentCategoryId = parentCategoryId;
    if (search) {
      query.$or = [
        { name: { $regex: escapeRegex(search), $options: "i" } },
        { slug: { $regex: escapeRegex(search), $options: "i" } },
        { description: { $regex: escapeRegex(search), $options: "i" } },
      ];
    }

    const sortBy = req.query.sortBy || "sortOrder";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const total = await Category.countDocuments(query);
    const data = await Category.find(query)
      .populate("parentCategoryId", "name slug")
      .sort([[sortBy, sortOrder], ["name", 1]])
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getCategoriesdata = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;
    const search = req.query.search || "";
    const status = req.query.status;
    const parentCategoryId = req.query.parentCategoryId;

    const query = { isDeleted: false };
    if (status) query.status = status;
    if (parentCategoryId) query.parentCategoryId = parentCategoryId;
    if (search) {
      query.$or = [
        { name: { $regex: escapeRegex(search), $options: "i" } },
        { slug: { $regex: escapeRegex(search), $options: "i" } },
        { description: { $regex: escapeRegex(search), $options: "i" } },
      ];
    }

    const sortBy = req.query.sortBy || "sortOrder";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const total = await Category.countDocuments(query);
    const data = await Category.find(query)
      .populate("parentCategoryId", "name slug")
      .sort([[sortBy, sortOrder], ["name", 1]])
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getCategory = async (req, res) => {
  try {
    const data = await Category.findOne({ _id: req.params.id, isDeleted: false }).populate("parentCategoryId", "name slug");
    if (!data) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, isDeleted: false });
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const { name, slug, parentCategoryId, status } = req.body;
    const nextParentId = parentCategoryId === undefined ? category.parentCategoryId : (parentCategoryId && mongoose.Types.ObjectId.isValid(parentCategoryId) ? parentCategoryId : null);

    if (name && name.trim() && name.trim() !== category.name) {
      const duplicateName = await Category.findOne({
        _id: { $ne: category._id },
        name: { $regex: `^${escapeRegex(name.trim())}$`, $options: "i" },
        parentCategoryId: nextParentId || null,
        isDeleted: false,
      });
      if (duplicateName) {
        return res.status(409).json({ success: false, message: "A category with this name already exists under the same parent" });
      }
    }

    if (nextParentId && nextParentId.toString() === category._id.toString()) {
      return res.status(400).json({ success: false, message: "Category cannot be its own parent" });
    }

    if (nextParentId) {
      const parent = await Category.findOne({ _id: nextParentId, isDeleted: false });
      if (!parent) {
        return res.status(404).json({ success: false, message: "Parent category not found" });
      }
      const isCircular = await ensureNoCircularRelationship(nextParentId, category._id);
      if (!isCircular) {
        return res.status(400).json({ success: false, message: "Circular parent relationship is not allowed" });
      }
    }

    category.name = name || category.name;
    category.description = req.body.description !== undefined ? req.body.description : category.description;
    category.image = req.body.image !== undefined ? req.body.image : category.image;
    category.icon = req.body.icon !== undefined ? req.body.icon : category.icon;
    category.parentCategoryId = nextParentId;
    category.status = status || category.status;
    category.sortOrder = req.body.sortOrder !== undefined ? req.body.sortOrder : category.sortOrder;
    category.metaTitle = req.body.metaTitle !== undefined ? req.body.metaTitle : category.metaTitle;
    category.metaDescription = req.body.metaDescription !== undefined ? req.body.metaDescription : category.metaDescription;
    category.slug = slug || category.slug;
    category.updatedBy = req.user?.id || req.user?.vendorId || category.updatedBy;

    const newLevel = nextParentId ? await getCategoryLevel(nextParentId) : 0;
    category.level = newLevel;
    await category.save();

    if (category.level !== newLevel) {
      await recalculateDescendantLevels(category._id, newLevel);
    }

    return res.status(200).json({ success: true, message: "Category updated successfully", data: category });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category || category.isDeleted) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const descendants = await Category.find({ parentCategoryId: category._id, isDeleted: false });
    const ids = [category._id, ...descendants.map((item) => item._id)];

    await Category.updateMany(
      { _id: { $in: ids } },
      { isDeleted: true, deletedAt: new Date(), status: "inactive" }
    );

    return res.status(200).json({ success: true, message: "Category deleted successfully", deletedCount: ids.length });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getCategoryTree = async (req, res) => {
  try {
    const categories = await Category.find({ isDeleted: false }).sort({ sortOrder: 1, name: 1 });
    const tree = buildCategoryTree(categories);
    return res.status(200).json({ success: true, data: tree });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getChildCategories = async (req, res) => {
  try {
    const parentId = req.params.id || req.query.parentCategoryId;
    const data = await Category.find({ parentCategoryId: parentId, isDeleted: false }).sort({ sortOrder: 1, name: 1 });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getParentCategories = async (req, res) => {
  try {
    const parents = [];
    let currentId = req.params.id;

    while (currentId) {
      const current = await Category.findById(currentId);
      if (!current || !current.parentCategoryId) break;
      const parent = await Category.findById(current.parentCategoryId);
      if (!parent) break;
      parents.unshift(parent);
      currentId = parent._id;
    }

    return res.status(200).json({ success: true, data: parents });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  getCategoryTree,
  getChildCategories,
  getParentCategories,
  getCategoriesdata
};