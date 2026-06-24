const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
{

  productName: { type: String, required: true },
  itemName: String,
  productType: String,
  recommendedBrowseNode: String,
  variations: String,
  brandName: String,
  externalProductId: String,

  metadata: String,
  metaKeywords: [String],
  searchKeywords: [String],

  description: {
    productDescription: String,
    bulletPoints: [String],
    images: [String],
    multiImages: [String]
  },

  productDetails: {
    targetAudienceKeyword: String,
    modelNumber: String,
    manufacturer: String,
    genericKeyword: String,
    specialFeatures: [String],
    material: String,
    itemTypeName: String,
    color: String,
    size: String,
    occasion: String,
    partNumber: String,
    itemShape: String,
    theme: String,
    manufacturerContactInfo: String,
    unitCount: Number,
    unitCountType: String,
    manufacturerMinimumAgeMonths: Number,
    includedComponents: [String],
    leagueName: String,
    teamName: String
  },

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

  batteryInfo: {
    batteryLifePercentage: Number,
    functionalCondition: String,
    cosmeticCondition: String,
    accessories: String
  },

  packaging: {
    packagingType: String,
    sourceType: String,
    fulfillmentChannel: String,
    numberOfPacks: Number,
    masterPackLayersPerPallet: Number
  },

  safetyCompliance: {
    countryRegionOfOrigin: String,
    dangerousGoodsRegulation: String,
    buyerAgeRestriction: String,
    mandatoryCautionaryStatement: String,
    regulatoryComplianceCertification: String,
    complianceMedia: [String],
    safetyAttestation: String,
    safetyAttestationAddress: String,
    shipsGlobally: Boolean,
    nonLithiumBatteryEnergyContent: String,
    lessThan30PercentSOC: Boolean
  },

  externalInfo: {
    externalProductInfo: String,
    externalProductInfoEntity: String,
    importerContactInformation: String,
    packerContactInformation: String
  },

  offer: {
    sku: String,
    quantity: Number,
    handlingTime: Number,
    restockDate: Date,

    yourPrice: Number,
    maximumRetailPrice: Number,
    automatedPricing: Boolean,

    minimumSellerAllowedPrice: Number,
    maximumSellerAllowedPrice: Number,

    salePrice: Number,
    saleStartDate: Date,
    saleEndDate: Date,

    offeringReleaseDate: Date,
    itemCondition: String,
    productTaxCode: String,
    merchantReleaseDate: Date,
    maximumOrderQuantity: Number
  },

  giftOptions: {
    giftMessageAvailable: Boolean,
    giftWrapAvailable: Boolean
  },

  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category"
  },

  attributes: [
    {
      name: String,
      value: mongoose.Schema.Types.Mixed
    }
  ],

  variants: [
  {
    sku: String,
    attributes: [
      { name: String, value: mongoose.Schema.Types.Mixed }
    ],

    price: Number,
    mrp: Number,
    stock: Number,
    images: [String]
  }
]
},
{
  timestamps: true
}
);

module.exports = mongoose.model("Product", productSchema);