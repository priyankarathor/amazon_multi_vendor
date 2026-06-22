const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        productName: {
            type: String,
            required: true
        },

        sku: {
            type: String,
            required: true
        },

        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category"
        },

        description: String,

        attributes: [
            {
                name: String,
                value: String
            }
        ],

        variants: [
            {
                color: String,

                size: String,

                mrp: Number,

                sellingPrice: Number,

                stock: Number,

                images: [String]
            }
        ],

        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',   // or 'Vendor' if you have a Vendor model
            required: true
        },



        images: [String]
    },


    {
        timestamps: true
    });

module.exports = mongoose.model("Product", productSchema);