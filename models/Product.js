const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
{
  // BASIC
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
    ref: "Vendor",
    required: true
  },

  // SEO
  metadata: String,
  metaKeywords: [String],
  searchKeywords: [String],

  // DESCRIPTION
  description: {
    productDescription: String,
    bulletPoints: [String]
  },

  images: [String],

  isActive: {
    type: Boolean,
    default: true
  },

  // PRODUCT DETAILS
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

  // DIMENSIONS
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

  // PACKAGING
  packaging: {
    packagingType: String,
    sourceType: String,
    fulfillmentChannel: String,
    numberOfPacks: Number
  },

  // SAFETY
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

  // EXTRA INFO
  externalInfo: {
    externalProductInfo: String,
    externalProductInfoEntity: String,
    importerContactInformation: String,
    packerContactInformation: String
  },

  // GIFTS
  giftOptions: {
    giftMessageAvailable: Boolean,
    giftWrapAvailable: Boolean
  },
  

  // DYNAMIC ATTRIBUTES
  attributesMeta: [
    {
      name: String,
      values: [String]
    }
  ]
},
{ timestamps: true });

module.exports = mongoose.model("Product", productSchema);
