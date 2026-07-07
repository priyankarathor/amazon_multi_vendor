const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    title: { type: String, required: true },
    image_url: { type: String, required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    session_type: {
        type: String,
        enum: ['home_page', 'category_page', 'product_page'],
        default: 'home_page',
    },
    specialization: {
        type: String,
        enum: ['offer', 'advertisement', 'deal', 'featured', 'new_arrival'],
        default: 'offer',
    },
    discount_percentage: { type: Number, required: true, min: 1, max: 100 },
    is_active: { type: Boolean, default: true },
    starts_at: { type: Date, default: null },
    ends_at: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
