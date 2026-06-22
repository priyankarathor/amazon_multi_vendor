const Banner = require('../models/Banner');
const Product = require('../models/Product');

// ─────────────────────────────────────────────────────────────────
// GET /api/banners
// Homepage: returns all active, non-expired banners
// ─────────────────────────────────────────────────────────────────
exports.getAllBanners = async (req, res) => {
    try {
        const now = new Date();

        const banners = await Banner.find({
            is_active: true,
            $or: [
                // Banner has a date range and we are within it
                { starts_at: { $lte: now }, ends_at: { $gte: now } },
                // Banner has no date restriction
                { starts_at: null, ends_at: null },
            ],
        })
            .populate('vendorId', 'name companyname')
            .populate('categoryId', 'name slug')
            .sort({ createdAt: -1 });

        res.json({ success: true, total: banners.length, data: banners });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────────────────────────
// GET /api/banners/:id/products
// User clicks a banner → returns products filtered by vendorId + categoryId
// with discount applied on each variant's mrp
// ─────────────────────────────────────────────────────────────────
exports.getBannerProducts = async (req, res) => {
    try {
        // Step 1: Load the banner
        const banner = await Banner.findById(req.params.id)
            .populate('vendorId', 'name companyname')
            .populate('categoryId', 'name slug');

        if (!banner) {
            return res.status(404).json({ success: false, message: 'Banner not found' });
        }

        // Step 2: Check if banner is active
        if (!banner.is_active) {
            return res.status(400).json({ success: false, message: 'This offer is no longer active' });
        }

        // Step 3: Check if banner has expired
        const now = new Date();
        if (banner.ends_at && banner.ends_at < now) {
            return res.status(400).json({ success: false, message: 'This offer has expired' });
        }

        // Step 4: Fetch products — same vendorId AND same categoryId
        // Also only fetch products that have at least 1 variant with stock > 0
        const products = await Product.find({
            vendorId: banner.vendorId._id,    // same vendor (e.g. Nike)
            categoryId: banner.categoryId._id,  // same category (e.g. T-Shirts)
            'variants.stock': { $gt: 0 },       // at least one variant in stock
        });

        // Step 5: No products found
        if (products.length === 0) {
            return res.json({
                success: true,
                message: 'No products available for this offer right now',
                banner: {
                    title: banner.title,
                    discount_percentage: banner.discount_percentage,
                    vendor: banner.vendorId,
                    category: banner.categoryId,
                },
                total: 0,
                data: [],
            });
        }

        // Step 6: Apply banner discount on each product's variants
        const discount = banner.discount_percentage;

        const data = products.map(p => {
            // Apply discount to each variant's mrp
            const discountedVariants = p.variants.map(v => {
                const discounted_price = parseFloat(
                    (v.mrp - (v.mrp * discount / 100)).toFixed(2)
                );
                return {
                    color: v.color,
                    size: v.size,
                    mrp: v.mrp,           // original price
                    sellingPrice: v.sellingPrice,  // vendor's own selling price
                    discounted_price,                  // price after banner discount
                    you_save: parseFloat((v.mrp - discounted_price).toFixed(2)),
                    stock: v.stock,
                    images: v.images,
                };
            });

            return {
                _id: p._id,
                productName: p.productName,
                sku: p.sku,
                description: p.description,
                images: p.images,
                discount_percentage: discount,
                variants: discountedVariants,
            };
        });

        // Step 7: Return full response
        res.json({
            success: true,
            banner: {
                title: banner.title,
                image_url: banner.image_url,
                discount_percentage: banner.discount_percentage,
                vendor: banner.vendorId,
                category: banner.categoryId,
                ends_at: banner.ends_at,
            },
            total: data.length,
            data,
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};