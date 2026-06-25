const Product = require("../models/Product");
const Variant = require("../models/Variant");
const Inventory = require("../models/Inventory");

// ===============================
// CREATE PRODUCT WITH VARIANTS
// ===============================
exports.createProduct = async (req, res) => {
  try {
    let { variants, vendorId, ...productData } = req.body;

    // ---------------------------
    // FIX 1: Parse variants safely
    // ---------------------------
    if (typeof variants === "string") {
      try {
        variants = JSON.parse(variants);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid variants JSON format"
        });
      }
    }

    // ---------------------------
    // FIX 2: Create Product first
    // ---------------------------
    const product = await Product.create({
      ...productData,
      vendorId
    });

    let createdVariants = [];

    // ---------------------------
    // FIX 3: Check variants array
    // ---------------------------
    if (Array.isArray(variants) && variants.length > 0) {
      for (let v of variants) {
        try {
          // 1. Create Variant
          const variant = await Variant.create({
            productId: product._id,
            sku: v.sku,
            attributes: v.attributes || {},
            images: v.images || [],
            offer: v.offer || null
          });

          createdVariants.push(variant);

          // 2. Create Inventory
          await Inventory.create({
            vendorId,
            productId: product._id,
            variantId: variant._id,
            stock: v?.inventory?.stock ?? v?.stock ?? 0
          });

        } catch (innerErr) {
          console.log("VARIANT ERROR:", innerErr.message);
        }
      }
    }

    // ---------------------------
    // SUCCESS RESPONSE
    // ---------------------------
    return res.status(201).json({
      success: true,
      message: "Product, Variants & Inventory created successfully",
      product,
      variants: createdVariants
    });

  } catch (err) {
    console.log("CREATE PRODUCT ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

exports.getProductDetails = async (req, res) => {
  try {
    const { productId } = req.params;

    // -------------------------
    // 1. GET PRODUCT
    // -------------------------
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // -------------------------
    // 2. GET VARIANTS
    // -------------------------
    const variants = await Variant.find({ productId });

    // -------------------------
    // 3. GET INVENTORY (ALL VARIANTS STOCK)
    // -------------------------
    const inventory = await Inventory.find({ productId });

    // -------------------------
    // 4. MAP STOCK INTO VARIANTS
    // -------------------------
    const variantsWithStock = variants.map((v) => {
      const stockInfo = inventory.find(
        (i) => i.variantId.toString() === v._id.toString()
      );

      return {
        ...v._doc,
        stock: stockInfo ? stockInfo.stock : 0
      };
    });

    // -------------------------
    // FINAL RESPONSE
    // -------------------------
    return res.status(200).json({
      success: true,
      product,
      variants: variantsWithStock
    });

  } catch (err) {
    console.log("GET PRODUCT DETAILS ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};