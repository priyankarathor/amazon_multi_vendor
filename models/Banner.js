const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    title: { type: String, required: true },
    image_url: { type: String, required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'vender', required: true }, // ref matches your User model name
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }, // ref matches your Category model name
    discount_percentage: { type: Number, required: true, min: 1, max: 100 },
    is_active: { type: Boolean, default: true },
    starts_at: { type: Date, default: null },
    ends_at: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);