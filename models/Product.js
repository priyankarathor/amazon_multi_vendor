const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
{
  // =========================
  // BASIC PRODUCT INFO
  // =========================
  productName: { type: String, required: true },
  itemName: String,
  productType: String,
  recommendedBrowseNode: String,
  brandName: String,
  externalProductId: String,

  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },

  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  // =========================
  // SEARCH / SEO
  // =========================
  metadata: String,
  metaKeywords: [String],
  searchKeywords: [String],

  // =========================
  // PRODUCT DESCRIPTION
  // =========================
  description: {
    productDescription: String,
    bulletPoints: [String]
  },

  // Main product images
  images: [String],

  // =========================
  // PRODUCT DETAILS
  // Common product info only
  // =========================
  productDetails: {
    targetAudienceKeyword: String,
    modelNumber: String,
    manufacturer: String,
    genericKeyword: String,
    specialFeatures: [String],
    material: String,
    itemTypeName: String,
    occasion: String,
    partNumber: String,
    itemShape: String,
    theme: String,
    manufacturerContactInfo: String,
    unitCount: Number,
    unitCountType: String,
    includedComponents: [String]
  },

  // =========================
  // DIMENSIONS
  // =========================
  dimensions: {
    itemDimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    packageDimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    itemWeight: Number,
    itemWeightUnit: String,
    packageWeight: Number
  },

  // =========================
  // PACKAGING
  // =========================
  packaging: {
    packagingType: String,
    sourceType: String,
    fulfillmentChannel: String,
    numberOfPacks: Number
  },

  // =========================
  // SAFETY
  // =========================
  safetyCompliance: {
    countryRegionOfOrigin: String,
    dangerousGoodsRegulation: String,
    buyerAgeRestriction: String,
    mandatoryCautionaryStatement: String,
    regulatoryComplianceCertification: String,
    complianceMedia: [String],
    safetyAttestation: String,
    safetyAttestationAddress: String,
    shipsGlobally: Boolean
  },

  // =========================
  // EXTRA PRODUCT INFO
  // =========================
  externalInfo: {
    externalProductInfo: String,
    externalProductInfoEntity: String,
    importerContactInformation: String,
    packerContactInformation: String
  },

  // =========================
  // GIFT OPTIONS
  // =========================
  giftOptions: {
    giftMessageAvailable: Boolean,
    giftWrapAvailable: Boolean
  },

  // =========================
  // DYNAMIC ATTRIBUTES
  // Category-specific attributes
  // =========================
  attributesMeta: [
    {
      name: String,
      values: [String]
    }
  ],

  // =========================
  // VARIANTS
  // Dynamic for all categories
  // =========================
  variants: [
    {
      sku: { type: String, required: true },

      attributes: [
        {
          name: String,
          value: String
        }
      ],

      images: [String],

      inventory: {
        stock: Number,
        quantity: Number,
        restockDate: Date
      },

      offer: {
        mrp: Number,
        sellingPrice: Number,
        salePrice: Number,
        handlingTime: Number,
        automatedPricing: Boolean,
        minimumSellerAllowedPrice: Number,
        maximumSellerAllowedPrice: Number,
        saleStartDate: Date,
        saleEndDate: Date,
        itemCondition: String,
        productTaxCode: String,
        maximumOrderQuantity: Number
      }
    }
  ]
},
{
  timestamps: true
});

module.exports = mongoose.model("Product", productSchema);