const Product = require("../models/Product");
const Variant = require("../models/Variant");
const Inventory = require("../models/Inventory");

const createProduct = async (req, res) => {
   try {
      let { variants, vendorId, ...productData } = req.body;

      if (typeof variants === "string") {
         variants = JSON.parse(variants);
      }

      const product = await Product.create({
         ...productData,
         vendorId
      });

      let createdVariants = [];

      if (Array.isArray(variants)) {
         for (let v of variants) {
            const variant = await Variant.create({
               productId: product._id,
               sku: v.sku,
               attributes: v.attributes || {},
               images: v.images || [],
               offer: v.offer || null
            });

            createdVariants.push(variant);

            await Inventory.create({
               vendorId,
               productId: product._id,
               variantId: variant._id,
               stock: v?.inventory?.stock || 0
            });
         }
      }

      return res.status(201).json({
         success: true,
         product,
         variants: createdVariants
      });

   } catch (error) {
      res.status(500).json({
         success: false,
         message: error.message
      });
   }
};

const getProductDetails = async (req, res) => {
   try {
      const { productId } = req.params;

      const product = await Product.findById(productId);
      if (!product) {
         return res.status(404).json({
            success: false,
            message: "Product not found"
         });
      }

      const variants = await Variant.find({ productId });
      const inventory = await Inventory.find({ productId });

      const variantsWithStock = variants.map(v => {
         const stockInfo = inventory.find(
            i => i.variantId.toString() === v._id.toString()
         );

         return {
            ...v._doc,
            stock: stockInfo ? stockInfo.stock : 0
         };
      });

      res.status(200).json({
         success: true,
         product,
         variants: variantsWithStock
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
      const productdata = await Product.find();

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
   getProductDetails,
   productfetch
};