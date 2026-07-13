const Product = require("../models/Product");
const Variant = require("../models/Variant");
const Inventory = require("../models/Inventory");
const Vendor = require("../models/Vender");
const Category = require("../models/Category");
const CategoryAttribute = require("../models/CategoryAttribute");
const Cart = require("../models/Cart");

const normalizeVariantAttributes = (attributes) => {
   if (!attributes) {
      return [];
   }

   if (Array.isArray(attributes)) {
      return attributes.map((attribute) => {
         if (!attribute || typeof attribute !== "object") {
            return { name: String(attribute || ""), value: String(attribute || "") };
         }

         return {
            name: attribute.name || "",
            code: attribute.code || undefined,
            value: attribute.value !== undefined ? String(attribute.value) : ""
         };
      });
   }

   return Object.entries(attributes).map(([name, value]) => ({
      name,
      value: String(value)
   }));
};

const parseJsonField = (value, fallback) => {
   if (value === undefined || value === null) {
      return fallback;
   }

   if (typeof value !== "string") {
      return value;
   }

   const trimmedValue = value.trim();
   if (!trimmedValue) {
      return fallback;
   }

   try {
      return JSON.parse(trimmedValue);
   } catch (error) {
      try {
         return Function(`"use strict"; return (${trimmedValue});`)();
      } catch (innerError) {
         return fallback;
      }
   }
};

const getStockStatus = (stock) => (Number(stock) > 0 ? "in_stock" : "out_of_stock");

const slugify = (value) =>
   String(value || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getCategoryAttributeDefinitions = async (categoryId) => {
   if (!categoryId) {
      return [];
   }

   return CategoryAttribute.find({ categoryId, isDeleted: false, status: "active" });
};

const normalizeProductAttributes = async (attributes, categoryId) => {
   if (!attributes) {
      return [];
   }

   const attributeDefinitions = await getCategoryAttributeDefinitions(categoryId);
   const attributeMap = new Map(
      attributeDefinitions.map((attribute) => [String(attribute.code || attribute.name).toLowerCase(), attribute])
   );

   if (Array.isArray(attributes)) {
      return attributes.map((attribute) => {
         if (!attribute || typeof attribute !== "object") {
            return { name: String(attribute || ""), code: slugify(attribute), value: attribute };
         }

         const code = attribute.code || attribute.name;
         const definition = attributeMap.get(String(code).toLowerCase()) || attributeMap.get(String(attribute.name).toLowerCase());

         return {
            name: definition?.name || attribute.name || code,
            code: definition?.code || attribute.code || slugify(code),
            value: attribute.value,
            type: definition?.type || attribute.type || "text",
            unit: definition?.unit || attribute.unit || ""
         };
      });
   }

   if (typeof attributes === "object") {
      return Object.entries(attributes).map(([name, value]) => {
         const code = name;
         const definition = attributeMap.get(String(code).toLowerCase());

         return {
            name: definition?.name || name,
            code: definition?.code || slugify(code),
            value,
            type: definition?.type || "text",
            unit: definition?.unit || ""
         };
      });
   }

   return [];
};

const buildCategoryFilterOptions = async (categoryId) => {
   const attributes = await getCategoryAttributeDefinitions(categoryId);
   const filterableAttributes = attributes.filter((attribute) => attribute.filterable);

   return filterableAttributes.map((attribute) => ({
      name: attribute.name,
      code: attribute.code,
      type: attribute.type,
      options: attribute.options || []
   }));
};

const buildVariantResponse = (variant, inventory) => ({
   ...variant.toObject(),
   inventory: inventory
      ? {
         _id: inventory._id,
         vendorId: inventory.vendorId,
         productId: inventory.productId,
         variantId: inventory.variantId,
         stock: inventory.stock,
         maxQty: inventory.maxQty,
         isActive: inventory.isActive,
         stockStatus: getStockStatus(inventory.stock)
      }
      : {
         stock: 0,
         maxQty: 0,
         isActive: false,
         stockStatus: "out_of_stock"
      }
});

const getProductWithVariants = async (productId) => {
   const product = await Product.findById(productId)
      .populate("vendorId", "name companyname number email city state")
      .populate("categoryId", "name slug");

   if (!product) {
      return null;
   }

   const variants = await Variant.find({ productId: product._id });
   const inventory = await Inventory.find({ productId: product._id });

   const variantsWithInventory = variants.map((variant) => {
      const stockInfo = inventory.find(
         (item) => item.variantId.toString() === variant._id.toString()
      );

      return buildVariantResponse(variant, stockInfo);
   });

   return {
      ...product.toObject(),
      variants: variantsWithInventory
   };
};

const upsertVariantWithInventory = async ({ productId, vendorId, variantData }) => {
   if (!variantData._id && !variantData.sku) {
      throw new Error("Variant sku is required");
   }

   const variantPayload = {};

   if (variantData.sku !== undefined) variantPayload.sku = variantData.sku;
   if (variantData.productUrl !== undefined) variantPayload.productUrl = variantData.productUrl;
   if (variantData.images !== undefined) variantPayload.images = variantData.images;
   if (variantData.attributes !== undefined) {
      variantPayload.attributes = normalizeVariantAttributes(variantData.attributes);
   }
   if (variantData.images !== undefined) variantPayload.images = variantData.images;
   if (variantData.offer !== undefined) variantPayload.offer = variantData.offer;
   if (variantData.mrp !== undefined || variantData.sellingPrice !== undefined || variantData.salePrice !== undefined || variantData.handlingTime !== undefined || variantData.itemCondition !== undefined) {
      variantPayload.offer = {
         ...(variantData.offer || {}),
         ...(variantData.mrp !== undefined ? { mrp: variantData.mrp } : {}),
         ...(variantData.sellingPrice !== undefined ? { sellingPrice: variantData.sellingPrice } : {}),
         ...(variantData.salePrice !== undefined ? { salePrice: variantData.salePrice } : {}),
         ...(variantData.handlingTime !== undefined ? { handlingTime: variantData.handlingTime } : {}),
         ...(variantData.itemCondition !== undefined ? { itemCondition: variantData.itemCondition } : {})
      };
   }

   if (variantData.isActive !== undefined) {
      variantPayload.isActive = variantData.isActive;
   }

   const variant = variantData._id
      ? await Variant.findOneAndUpdate(
         { _id: variantData._id, productId },
         variantPayload,
         { new: true, runValidators: true }
      )
      : await Variant.create({
         productId,
         ...variantPayload
      });

   if (!variant) {
      throw new Error("Variant not found for this product");
   }

   const inventoryPayload = {};
   const inventoryData = variantData.inventory || {};

   if (inventoryData.stock !== undefined) inventoryPayload.stock = inventoryData.stock;
   if (inventoryData.maxQty !== undefined) inventoryPayload.maxQty = inventoryData.maxQty;
   if (inventoryData.isActive !== undefined) inventoryPayload.isActive = inventoryData.isActive;

   const inventoryDefaults = {
      stock: 0,
      maxQty: 0,
      isActive: true
   };

   Object.keys(inventoryPayload).forEach((field) => {
      delete inventoryDefaults[field];
   });

   const inventoryUpdate = {};

   if (Object.keys(inventoryDefaults).length > 0) {
      inventoryUpdate.$setOnInsert = inventoryDefaults;
   }

   if (Object.keys(inventoryPayload).length > 0) {
      inventoryUpdate.$set = inventoryPayload;
   }

   await Inventory.findOneAndUpdate(
      {
         vendorId,
         productId,
         variantId: variant._id
      },
      inventoryUpdate,
      {
         upsert: true,
         new: true,
         runValidators: true
      }
   );

   return variant;
};

const createProduct = async (req, res) => {
   try {
      const payload = typeof req.body === 'string' ? parseJsonField(req.body, {}) : (req.body && typeof req.body === 'object' ? req.body : {});
      let { variants, vendorId, attributes, ...productData } = payload;
      variants = parseJsonField(variants, []);
      attributes = parseJsonField(attributes, undefined);

      const missingFields = ["productName", "categoryId"].filter(
         (field) => !productData[field]
      );

      const resolvedVendorId = vendorId || req.user?.vendorId || req.user?.id;
      if (!resolvedVendorId) {
         missingFields.push("vendorId");
      }

      if (missingFields.length > 0) {
         return res.status(400).json({
            success: false,
            message: `Missing required fields: ${missingFields.join(", ")}`
         });
      }

      const category = await Category.findOne({ _id: productData.categoryId, isDeleted: false });
      if (!category) {
         return res.status(404).json({ success: false, message: "Category not found" });
      }

      const parsedAttributes = await normalizeProductAttributes(attributes, productData.categoryId);
      const product = await Product.create({
         ...productData,
         vendorId: resolvedVendorId,
         attributes: parsedAttributes,
         status: productData.status || "draft",
         tags: productData.tags || [],
         images: productData.images || [],
         description: productData.description || {},
         sku: productData.sku || undefined,
         productUrl: productData.productUrl || undefined,
         deleted: false,
         deletedAt: null,
      });

      let createdVariants = [];

      if (Array.isArray(variants)) {
         for (let v of variants) {
            const variant = await upsertVariantWithInventory({
               productId: product._id,
               vendorId: resolvedVendorId,
               variantData: v
            });

            createdVariants.push(variant);
         }
      }

      const data = await getProductWithVariants(product._id);

      return res.status(201).json({
         success: true,
         message: "Product created successfully",
         product: data,
         variants: createdVariants
      });

   } catch (error) {
      res.status(500).json({
         success: false,
         message: error.message
      });
   }
};

const updateProduct = async (req, res) => {
   try {
      const { productId } = req.params;
      const payload = typeof req.body === 'string' ? parseJsonField(req.body, {}) : (req.body && typeof req.body === 'object' ? req.body : {});
      let { variants, vendorId, attributes, ...productData } = payload;
      variants = parseJsonField(variants, undefined);
      attributes = parseJsonField(attributes, undefined);

      const product = await Product.findById(productId);
      if (!product || product.deleted) {
         return res.status(404).json({
            success: false,
            message: "Product not found"
         });
      }

      const resolvedVendorId = vendorId || product.vendorId;

      if (vendorId && vendorId.toString() !== product.vendorId.toString()) {
         return res.status(400).json({
            success: false,
            message: "vendorId cannot be changed for this product"
         });
      }

      Object.entries(productData).forEach(([field, value]) => {
         if (value !== undefined) {
            product[field] = value;
         }
      });

      if (attributes !== undefined) {
         product.attributes = await normalizeProductAttributes(attributes, product.categoryId);
      }

      if (productData.status) {
         product.status = productData.status;
      }

      await product.save();

      if (Array.isArray(variants)) {
         for (const variantData of variants) {
            await upsertVariantWithInventory({
               productId: product._id,
               vendorId: resolvedVendorId,
               variantData
            });
         }
      }

      const data = await getProductWithVariants(product._id);

      return res.status(200).json({
         success: true,
         message: "Product updated successfully",
         data
      });
   } catch (error) {
      return res.status(500).json({
         success: false,
         message: error.message
      });
   }
};

const getProductDetails = async (req, res) => {
   try {
      const { productId } = req.params;

      const product = await getProductWithVariants(productId);
      if (!product) {
         return res.status(404).json({
            success: false,
            message: "Product not found"
         });
      }

      res.status(200).json({
         success: true,
         data: product,
         product,
         variants: product.variants
      });

   } catch (error) {
      res.status(500).json({
         success: false,
         message: error.message
      });
   }
};

const productfetch = async (req, res) => {
   try {
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
      const skip = (page - 1) * limit;
      const categoryId = req.query.categoryId;
      const vendorId = req.query.vendorId;
      const status = req.query.status;
      const isActive = req.query.isActive;
      const sortBy = req.query.sortBy || "createdAt";
      const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

      const query = { deleted: false };
      if (categoryId) query.categoryId = categoryId;
      if (vendorId) query.vendorId = vendorId;
      if (status) query.status = status;
      if (isActive !== undefined) query.isActive = isActive === "true";

      const total = await Product.countDocuments(query);
      const productdata = await Product.find(query)
         .populate("vendorId", "name companyname")
         .populate("categoryId", "name slug")
         .sort([[sortBy, sortOrder], ["createdAt", -1]])
         .skip(skip)
         .limit(limit);

      res.status(200).json({
         success: true,
         data: productdata,
         pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
         }
      });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: error.message
      });
   }
};

const productfetchdetails = async (req, res) => {
   try {
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
      const skip = (page - 1) * limit;
      const categoryId = req.query.categoryId;
      const vendorId = req.query.vendorId;
      const status = req.query.status;
      const isActive = req.query.isActive;
      const sortBy = req.query.sortBy || "createdAt";
      const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

      const query = { deleted: false };
      if (categoryId) query.categoryId = categoryId;
      if (vendorId) query.vendorId = vendorId;
      if (status) query.status = status;
      if (isActive !== undefined) query.isActive = isActive === "true";

      const total = await Product.countDocuments(query);
      const productdata = await Product.find(query)
         .populate("vendorId", "name companyname")
         .populate("categoryId", "name slug")
         .sort([[sortBy, sortOrder], ["createdAt", -1]])
         .skip(skip)
         .limit(limit);

      res.status(200).json({
         success: true,
         data: productdata,
         pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
         }
      });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: error.message
      });
   }
};

const deleteProduct = async (req, res) => {
   try {
      const product = await Product.findById(req.params.productId);
      if (!product || product.deleted) {
         return res.status(404).json({ success: false, message: "Product not found" });
      }

      product.deleted = true;
      product.deletedAt = new Date();
      product.status = "archived";
      await product.save();

      return res.status(200).json({ success: true, message: "Product deleted successfully" });
   } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
   }
};

const publishProduct = async (req, res) => {
   try {
      const product = await Product.findById(req.params.productId);
      if (!product || product.deleted) {
         return res.status(404).json({ success: false, message: "Product not found" });
      }

      product.status = "published";
      product.isActive = true;
      await product.save();

      return res.status(200).json({ success: true, message: "Product published successfully", data: product });
   } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
   }
};

const archiveProduct = async (req, res) => {
   try {
      const product = await Product.findById(req.params.productId);
      if (!product || product.deleted) {
         return res.status(404).json({ success: false, message: "Product not found" });
      }

      product.status = "archived";
      product.isActive = false;
      await product.save();

      return res.status(200).json({ success: true, message: "Product archived successfully", data: product });
   } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
   }
};

const duplicateProduct = async (req, res) => {
   try {
      const product = await Product.findById(req.params.productId);
      if (!product || product.deleted) {
         return res.status(404).json({ success: false, message: "Product not found" });
      }

      const productData = product.toObject();
      delete productData._id;
      delete productData.__v;
      delete productData.createdAt;
      delete productData.updatedAt;
      delete productData.deletedAt;

      const duplicatedProduct = await Product.create({
         ...productData,
         productName: `${productData.productName || "Product"} (Copy)`,
         sku: productData.sku ? `${productData.sku}-copy` : undefined,
         status: "draft",
         isActive: false,
         deleted: false,
         deletedAt: null,
      });

      const variants = await Variant.find({ productId: product._id });
      for (const variant of variants) {
         const variantData = variant.toObject();
         delete variantData._id;
         delete variantData.__v;
         delete variantData.createdAt;
         delete variantData.updatedAt;
         const createdVariant = await Variant.create({ ...variantData, productId: duplicatedProduct._id });
         const inventory = await Inventory.findOne({ productId: product._id, variantId: variant._id });
         if (inventory) {
            const inventoryData = inventory.toObject();
            delete inventoryData._id;
            delete inventoryData.__v;
            delete inventoryData.createdAt;
            delete inventoryData.updatedAt;
            await Inventory.create({
               ...inventoryData,
               productId: duplicatedProduct._id,
               variantId: createdVariant._id,
            });
         }
      }

      const data = await getProductWithVariants(duplicatedProduct._id);
      return res.status(201).json({ success: true, message: "Product duplicated successfully", data });
   } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
   }
};

const bulkUpdateProducts = async (req, res) => {
   try {
      const { ids = [], update = {} } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
         return res.status(400).json({ success: false, message: "At least one product id is required" });
      }

      const result = await Product.updateMany({ _id: { $in: ids } }, update);
      return res.status(200).json({ success: true, message: "Products updated successfully", data: result });
   } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
   }
};

const bulkDeleteProducts = async (req, res) => {
   try {
      const { ids = [] } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
         return res.status(400).json({ success: false, message: "At least one product id is required" });
      }

      await Product.updateMany({ _id: { $in: ids } }, { deleted: true, deletedAt: new Date(), status: "archived" });
      return res.status(200).json({ success: true, message: "Products deleted successfully" });
   } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
   }
};

const getInventory = async (req, res) => {
   try {
      const { vendorId, productId, variantId, stockStatus, isActive } = req.query;
      const query = {};

      if (vendorId) query.vendorId = vendorId;
      if (productId) query.productId = productId;
      if (variantId) query.variantId = variantId;
      if (isActive !== undefined) query.isActive = isActive === "true";
      if (stockStatus === "in_stock") query.stock = { $gt: 0 };
      if (stockStatus === "out_of_stock") query.stock = { $lte: 0 };

      const inventory = await Inventory.find(query)
         .populate("vendorId", "name companyname number email city state")
         .populate("productId", "productName brandName categoryId images isActive")
         .populate("variantId");

      const data = inventory.map((item) => ({
         ...item.toObject(),
         stockStatus: getStockStatus(item.stock)
      }));

      return res.status(200).json({
         success: true,
         count: data.length,
         data
      });
   } catch (error) {
      return res.status(500).json({
         success: false,
         message: error.message
      });
   }
};

const getVendorInventory = async (req, res) => {
   try {
      const { vendorId } = req.params;
      const { productId, variantId, stockStatus } = req.query;

      const vendor = await Vendor.findById(vendorId);
      if (!vendor) {
         return res.status(404).json({
            success: false,
            message: "Vendor not found"
         });
      }

      req.query.vendorId = vendorId;
      if (productId) req.query.productId = productId;
      if (variantId) req.query.variantId = variantId;
      if (stockStatus) req.query.stockStatus = stockStatus;

      return getInventory(req, res);
   } catch (error) {
      return res.status(500).json({
         success: false,
         message: error.message
      });
   }
};

const updateInventory = async (req, res) => {
   try {
      const { vendorId, productId, variantId } = req.params;
      const { stock, maxQty, isActive } = req.body;

      const updates = {};
      if (stock !== undefined) updates.stock = stock;
      if (maxQty !== undefined) updates.maxQty = maxQty;
      if (isActive !== undefined) updates.isActive = isActive;

      if (Object.keys(updates).length === 0) {
         return res.status(400).json({
            success: false,
            message: "At least one of stock, maxQty, or isActive is required"
         });
      }

      const inventory = await Inventory.findOneAndUpdate(
         { vendorId, productId, variantId },
         updates,
         { new: true, runValidators: true }
      )
         .populate("vendorId", "name companyname")
         .populate("productId", "productName")
         .populate("variantId");

      if (!inventory) {
         return res.status(404).json({
            success: false,
            message: "Inventory not found"
         });
      }

      return res.status(200).json({
         success: true,
         message: "Inventory updated successfully",
         data: {
            ...inventory.toObject(),
            stockStatus: getStockStatus(inventory.stock)
         }
      });
   } catch (error) {
      return res.status(500).json({
         success: false,
         message: error.message
      });
   }
};

const updateVariantStatus = async (req, res) => {
   try {
      const { variantId } = req.params;
      const { isActive } = req.body;

      if (typeof isActive !== "boolean") {
         return res.status(400).json({
            success: false,
            message: "isActive boolean is required"
         });
      }

      const variant = await Variant.findByIdAndUpdate(
         variantId,
         { isActive },
         { new: true, runValidators: true }
      );

      if (!variant) {
         return res.status(404).json({
            success: false,
            message: "Variant not found"
         });
      }

      await Inventory.updateMany({ variantId }, { isActive });

      return res.status(200).json({
         success: true,
         message: `Variant ${isActive ? "activated" : "deactivated"} successfully`,
         data: variant
      });
   } catch (error) {
      return res.status(500).json({
         success: false,
         message: error.message
      });
   }
};

const filterProducts = async (req, res) => {
   try {
      const {
         vendorId,
         categoryId,
         q,
         stockStatus,
         minPrice,
         maxPrice,
         productActive = "true",
         variantActive = "true"
      } = req.query;

      const productQuery = {};
      if (vendorId) productQuery.vendorId = vendorId;
      if (categoryId) productQuery.categoryId = categoryId;
      if (productActive !== "all") productQuery.isActive = productActive === "true";
      if (q) {
         productQuery.$or = [
            { productName: { $regex: q, $options: "i" } },
            { brandName: { $regex: q, $options: "i" } },
            { itemName: { $regex: q, $options: "i" } }
         ];
      }

      const products = await Product.find(productQuery)
         .populate("vendorId", "name companyname")
         .populate("categoryId", "name slug")
         .sort({ createdAt: -1 });

      const data = [];

      for (const product of products) {
         const variantQuery = { productId: product._id };
         if (variantActive !== "all") variantQuery.isActive = variantActive === "true";

         const variants = await Variant.find(variantQuery);
         const inventory = await Inventory.find({ productId: product._id });

         const variantsWithInventory = variants
            .map((variant) => {
               const stockInfo = inventory.find(
                  (item) => item.variantId.toString() === variant._id.toString()
               );
               return buildVariantResponse(variant, stockInfo);
            })
            .filter((variant) => {
               const price = variant.offer?.salePrice || variant.offer?.sellingPrice || variant.offer?.mrp || 0;
               const stock = variant.inventory?.stock || 0;

               if (stockStatus === "in_stock" && stock <= 0) return false;
               if (stockStatus === "out_of_stock" && stock > 0) return false;
               if (minPrice !== undefined && price < Number(minPrice)) return false;
               if (maxPrice !== undefined && price > Number(maxPrice)) return false;

               return true;
            });

         const hasVariantFilters =
            stockStatus ||
            minPrice !== undefined ||
            maxPrice !== undefined;

         if (variantsWithInventory.length > 0 || !hasVariantFilters) {
            data.push({
               ...product.toObject(),
               variants: variantsWithInventory
            });
         }
      }

      return res.status(200).json({
         success: true,
         count: data.length,
         data
      });
   } catch (error) {
      return res.status(500).json({
         success: false,
         message: error.message
      });
   }
};

const searchProducts = async (req, res) => {
   try {
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
      const skip = (page - 1) * limit;
      const q = req.query.q || req.query.search || "";
      const categoryId = req.query.categoryId;
      const vendorId = req.query.vendorId;
      const status = req.query.status;
      const isActive = req.query.isActive;
      const sortBy = req.query.sortBy || "createdAt";
      const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

      const query = { deleted: false };
      if (q) {
         query.$or = [
            { productName: { $regex: escapeRegex(q), $options: "i" } },
            { sku: { $regex: escapeRegex(q), $options: "i" } },
            { brandName: { $regex: escapeRegex(q), $options: "i" } },
            { tags: { $in: [new RegExp(escapeRegex(q), "i")] } },
            { description: { $regex: escapeRegex(q), $options: "i" } },
         ];
      }
      if (categoryId) query.categoryId = categoryId;
      if (vendorId) query.vendorId = vendorId;
      if (status) query.status = status;
      if (isActive !== undefined) query.isActive = isActive === "true";

      const total = await Product.countDocuments(query);
      const products = await Product.find(query)
         .populate("vendorId", "name companyname")
         .populate("categoryId", "name slug")
         .sort([[sortBy, sortOrder], ["createdAt", -1]])
         .skip(skip)
         .limit(limit);

      return res.status(200).json({
         success: true,
         data: products,
         pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
         },
      });
   } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
   }
};

const getDynamicFilters = async (req, res) => {
   try {
      const categoryId = req.params.categoryId || req.query.categoryId;
      if (!categoryId) {
         return res.status(400).json({ success: false, message: "categoryId is required" });
      }

      const options = await buildCategoryFilterOptions(categoryId);
      return res.status(200).json({ success: true, data: options });
   } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
   }
};

const getCartRecommendations = async (req, res) => {
   try {
      const { divid } = req.params;
      const limit = Math.min(15, Math.max(1, parseInt(req.query.limit, 10) || 15));

      if (!divid) {
         return res.status(400).json({ success: false, message: "divid is required" });
      }

      const cartItems = await Cart.find({ divid })
         .populate("pid")
         .populate("variantId");

      if (!cartItems || cartItems.length === 0) {
         return res.status(200).json({ success: true, message: "No cart items found", count: 0, data: [] });
      }

      const categoryIds = [...new Set(
         cartItems
            .map((item) => item.pid?.categoryId)
            .filter(Boolean)
            .map((categoryId) => categoryId.toString())
      )];

      if (categoryIds.length === 0) {
         return res.status(200).json({ success: true, message: "No categories found in cart", count: 0, data: [] });
      }

      const cartProductIds = cartItems
         .map((item) => item.pid?._id)
         .filter(Boolean)
         .map((id) => id.toString());

      const recommendedProducts = await Product.find({
         deleted: false,
         isActive: true,
         status: "published",
         categoryId: { $in: categoryIds },
         _id: { $nin: cartProductIds },
      })
         .populate("vendorId", "name companyname")
         .populate("categoryId", "name slug")
         .sort({ createdAt: -1 });

      const shuffled = [...recommendedProducts].sort(() => Math.random() - 0.5);
      const data = shuffled.slice(0, limit);

      return res.status(200).json({
         success: true,
         count: data.length,
         data,
      });
   } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
   }
};

const getVendorProducts = async (req, res) => {
   try {
      console.log("USER:", req.user);
      console.log("PARAM:", req.params.vendorId);

      const vendorIdFromToken = req.user.vendorId || req.user.id;
      const vendorIdFromParams = req.params.vendorId;

      if (vendorIdFromToken.toString() !== vendorIdFromParams.toString()) {
         return res.status(403).json({
            success: false,
            message: "Unauthorized access"
         });
      }

      const productdata = await Product.find({
         vendorId: vendorIdFromParams,
         deleted: false
      });

      res.status(200).json({
         success: true,
         data: productdata
      });

   } catch (error) {
      res.status(500).json({
         success: false,
         message: error.message
      });
   }
};

module.exports = {
   createProduct,
   updateProduct,
   deleteProduct,
   publishProduct,
   archiveProduct,
   duplicateProduct,
   bulkUpdateProducts,
   bulkDeleteProducts,
   getProductDetails,
   productfetch,
   getVendorProducts,
   getInventory,
   getVendorInventory,
   updateInventory,
   updateVariantStatus,
   filterProducts,
   searchProducts,
   getDynamicFilters,
   productfetchdetails,
   getCartRecommendations
};
