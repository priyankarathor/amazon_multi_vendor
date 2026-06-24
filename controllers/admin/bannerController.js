const Banner = require('../../models/Banner');
const User = require('../../models/User');     // vendors are stored in User model
const Category = require('../../models/Category');
const Product = require('../../models/Product');

// ─────────────────────────────────────────────────────────────────
// POST /api/admin/banners
// Admin creates a new discount banner
// Body: { title, image_url, vendorId, categoryId, discount_percentage, starts_at?, ends_at? }
// ─────────────────────────────────────────────────────────────────
exports.createBanner = async (req, res) => {
    try {
        const {
            title,
            image_url,
            vendorId,     // ← changed
            categoryId,   // ← changed
            discount_percentage,
            starts_at,
            ends_at,
        } = req.body;

        if (!title || !image_url || !vendorId || !categoryId || !discount_percentage) {
            return res.status(422).json({
                success: false,
                message: 'title, image_url, vendorId, categoryId, discount_percentage are required',
            });
        }

        const vendor = await User.findById(vendorId);     // ← changed
        if (!vendor) {
            return res.status(404).json({ success: false, message: 'Vendor not found' });
        }

        const category = await Category.findById(categoryId);  // ← changed
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        if (discount_percentage <= 0 || discount_percentage > 100) {
            return res.status(422).json({
                success: false,
                message: 'discount_percentage must be between 1 and 100',
            });
        }

        const banner = await Banner.create({
            title,
            image_url,
            vendorId,     // ← changed
            categoryId,   // ← changed
            discount_percentage,
            starts_at: starts_at || null,
            ends_at: ends_at || null,
            is_active: true,
        });

        const populated = await Banner.findById(banner._id)
            .populate('vendorId', 'name shop_name logo_url')
            .populate('categoryId', 'name slug');

        res.status(201).json({
            success: true,
            message: 'Banner created successfully',
            data: populated,
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────────────────────────
// GET /api/admin/banners
// List all banners for admin (active + inactive)
// ─────────────────────────────────────────────────────────────────
exports.getAllBanners = async (req, res) => {
    try {
        const banners = await Banner.find()
            .populate('vendorId', 'name companyname')
            .populate('categoryId', 'name slug')
            .sort({ createdAt: -1 });

        // Attach product count to each banner
        const result = await Promise.all(
            banners.map(async (b) => {
                const productCount = await Product.countDocuments({
                    vendorId: b.vendorId._id,
                    categoryId: b.categoryId._id,
                });
                return { ...b.toObject(), product_count: productCount };
            })
        );

        res.json({ success: true, total: result.length, data: result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────────────────────────
// GET /api/admin/banners/:id
// Single banner detail
// ─────────────────────────────────────────────────────────────────
exports.getBanner = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id)
            .populate('vendorId', 'name companyname')
            .populate('categoryId', 'name slug');

        if (!banner) {
            return res.status(404).json({ success: false, message: 'Banner not found' });
        }

        const productCount = await Product.countDocuments({
            vendorId: banner.vendorId._id,
            categoryId: banner.categoryId._id,
        });

        res.json({ success: true, data: { ...banner.toObject(), product_count: productCount } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────────────────────────
// PUT /api/admin/banners/:id
// Update banner
// ─────────────────────────────────────────────────────────────────
exports.updateBanner = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);

        if (!banner) {
            return res.status(404).json({ success: false, message: 'Banner not found' });
        }

        const allowed = ['title', 'image_url', 'vendorId', 'categoryId', 'discount_percentage', 'starts_at', 'ends_at', 'is_active'];

        allowed.forEach(field => {
            if (req.body[field] !== undefined) {
                banner[field] = req.body[field];
            }
        });

        await banner.save();

        const updated = await Banner.findById(banner._id)
            .populate('vendorId', 'name companyname')
            .populate('categoryId', 'name slug');

        res.json({ success: true, message: 'Banner updated', data: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────────────────────────
// DELETE /api/admin/banners/:id
// ─────────────────────────────────────────────────────────────────
exports.deleteBanner = async (req, res) => {
    try {
        const banner = await Banner.findByIdAndDelete(req.params.id);

        if (!banner) {
            return res.status(404).json({ success: false, message: 'Banner not found' });
        }

        res.json({ success: true, message: 'Banner deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────────────────────────
// PATCH /api/admin/banners/:id/toggle
// Enable / disable a banner
// ─────────────────────────────────────────────────────────────────
exports.toggleBanner = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);

        if (!banner) {
            return res.status(404).json({ success: false, message: 'Banner not found' });
        }

        banner.is_active = !banner.is_active;
        await banner.save();

        res.json({
            success: true,
            message: `Banner is now ${banner.is_active ? 'ACTIVE' : 'INACTIVE'}`,
            is_active: banner.is_active,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};