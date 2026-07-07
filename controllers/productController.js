const Product = require("../models/Product");
const Variant = require("../models/Variant");
const Inventory = require("../models/Inventory");
const Vendor = require("../models/Vender");

const normalizeVariantAttributes = (attributes) => {
   if (!attributes) {
      return [];
   }

   if (Array.isArray(attributes)) {
      return attributes;
   }

   return Object.entries(attributes).map(([name, value]) => ({
      name,
      value: String(value)
   }));
};

const parseJsonField = (value, fallback) => {
   if (typeof value !== "string") {
      return value === undefined ? fallback : value;
   }

   try {
      return JSON.parse(value);
   } catch (error) {
      return fallback;
   }
};

const getStockStatus = (stock) => (Number(stock) > 0 ? "in_stock" : "out_of_stock");

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
   if (variantData.attributes !== undefined) {
      variantPayload.attributes = normalizeVariantAttributes(variantData.attributes);
   }
   if (variantData.images !== undefined) variantPayload.images = variantData.images;
   if (variantData.offer !== undefined) variantPayload.offer = variantData.offer;

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
      let { variants, vendorId, ...productData } = req.body;
      variants = parseJsonField(variants, []);

      const missingFields = ["productName", "categoryId"].filter(
         (field) => !productData[field]
      );

      if (!vendorId) {
         missingFields.push("vendorId");
      }

      if (missingFields.length > 0) {
         return res.status(400).json({
            success: false,
            message: `Missing required fields: ${missingFields.join(", ")}`
         });
      }

      const product = await Product.create({
         ...productData,
         vendorId
      });

      let createdVariants = [];

      if (Array.isArray(variants)) {
         for (let v of variants) {
            const variant = await upsertVariantWithInventory({
               productId: product._id,
               vendorId,
               variantData: v
            });

            createdVariants.push(variant);
         }
      }

      const data = await getProductWithVariants(product._id);

      return res.status(201).json({
         success: true,
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
      let { variants, vendorId, ...productData } = req.body;
      variants = parseJsonField(variants, undefined);

      const product = await Product.findById(productId);
      if (!product) {
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
      const productdata = await Product.find()
         .populate("vendorId", "name companyname")
         .populate("categoryId", "name slug");

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
         vendorId: vendorIdFromParams
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
   getProductDetails,
   productfetch,
   getVendorProducts,
   getInventory,
   getVendorInventory,
   updateInventory,
   updateVariantStatus,
   filterProducts
};
