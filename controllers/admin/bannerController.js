const Banner = require("../../models/Banner");
const Vendor = require("../../models/Vender");
const Category = require("../../models/Category");
const Product = require("../../models/Product");

const normalizeOption = (value) => {
  if (!value) return value;
  const normalized = String(value).trim().toLowerCase().replace(/[\s-]+/g, "_");
  const aliases = {
    home: "home_page",
    homepage: "home_page",
    category: "category_page",
    categrory_page: "category_page",
    categorypage: "category_page",
    product: "product_page",
    productpage: "product_page",
    ad: "advertisement",
    adv: "advertisement",
    ads: "advertisement",
    advert: "advertisement",
    new: "new_arrival",
  };

  return aliases[normalized] || normalized;
};

const pickAlias = (body, fields) => {
  for (const field of fields) {
    if (body[field] !== undefined) return body[field];
  }
  return undefined;
};

const normalizeBannerPayload = (body, { withDefaults = false } = {}) => {
  const sessionType = pickAlias(body, ["session_type", "sessiontype", "sessionType"]);
  const specialization = pickAlias(body, [
    "specialization",
    "spacilization",
    "banner_type",
    "bannerType",
  ]);

  const payload = {
    title: body.title,
    image_url: body.image_url,
    vendorId: body.vendorId,
    categoryId: body.categoryId,
    session_type: normalizeOption(sessionType),
    specialization: normalizeOption(specialization),
    discount_percentage: body.discount_percentage,
    is_active: body.is_active,
    starts_at: pickAlias(body, ["starts_at", "start_date"]),
    ends_at: pickAlias(body, ["ends_at", "end_date"]),
  };

  if (withDefaults) {
    payload.session_type = payload.session_type || "home_page";
    payload.specialization = payload.specialization || "offer";
    payload.starts_at = payload.starts_at === undefined ? null : payload.starts_at;
    payload.ends_at = payload.ends_at === undefined ? null : payload.ends_at;
  }

  return payload;
};

const validateBannerPayload = async (payload, { requireAll = false } = {}) => {
  const missingFields = [];

  if (requireAll) {
    for (const field of ["title", "image_url", "vendorId", "categoryId", "discount_percentage"]) {
      if (payload[field] === undefined || payload[field] === null || payload[field] === "") {
        missingFields.push(field);
      }
    }
  }

  if (missingFields.length > 0) {
    return {
      status: 422,
      message: `${missingFields.join(", ")} are required`,
    };
  }

  if (payload.vendorId) {
    const vendor = await Vendor.findById(payload.vendorId);
    if (!vendor) return { status: 404, message: "Vendor not found" };
  }

  if (payload.categoryId) {
    const category = await Category.findById(payload.categoryId);
    if (!category) return { status: 404, message: "Category not found" };
  }

  if (payload.discount_percentage !== undefined) {
    const discount = Number(payload.discount_percentage);
    if (!Number.isFinite(discount) || discount < 1 || discount > 100) {
      return {
        status: 422,
        message: "discount_percentage must be between 1 and 100",
      };
    }
    payload.discount_percentage = discount;
  }

  if (payload.starts_at && payload.ends_at) {
    const startDate = new Date(payload.starts_at);
    const endDate = new Date(payload.ends_at);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return { status: 422, message: "start_date and end_date must be valid dates" };
    }

    if (endDate < startDate) {
      return { status: 422, message: "end_date must be after start_date" };
    }
  }

  return null;
};

const populateBanner = (query) =>
  query.populate("vendorId", "name companyname").populate("categoryId", "name slug");

const getProductCount = async (banner) => {
  const vendorId = banner.vendorId?._id || banner.vendorId;
  const categoryId = banner.categoryId?._id || banner.categoryId;

  if (!vendorId || !categoryId) return 0;

  return Product.countDocuments({ vendorId, categoryId });
};

exports.createBanner = async (req, res) => {
  try {
    const payload = normalizeBannerPayload(req.body, { withDefaults: true });
    const validationError = await validateBannerPayload(payload, { requireAll: true });

    if (validationError) {
      return res.status(validationError.status).json({
        success: false,
        message: validationError.message,
      });
    }

    const banner = await Banner.create(payload);
    const populated = await populateBanner(Banner.findById(banner._id));

    return res.status(201).json({
      success: true,
      message: "Banner created successfully",
      data: populated,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllBanners = async (req, res) => {
  try {
    const banners = await populateBanner(Banner.find()).sort({ createdAt: -1 });

    const data = await Promise.all(
      banners.map(async (banner) => ({
        ...banner.toObject(),
        product_count: await getProductCount(banner),
      }))
    );

    return res.json({ success: true, total: data.length, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getBanner = async (req, res) => {
  try {
    const banner = await populateBanner(Banner.findById(req.params.id));

    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    return res.json({
      success: true,
      data: {
        ...banner.toObject(),
        product_count: await getProductCount(banner),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    const payload = normalizeBannerPayload(req.body);
    const validationError = await validateBannerPayload(payload);

    if (validationError) {
      return res.status(validationError.status).json({
        success: false,
        message: validationError.message,
      });
    }

    for (const [field, value] of Object.entries(payload)) {
      if (value !== undefined) {
        banner[field] = value;
      }
    }

    await banner.save();

    const updated = await populateBanner(Banner.findById(banner._id));

    return res.json({ success: true, message: "Banner updated", data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);

    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    return res.json({ success: true, message: "Banner deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    banner.is_active = !banner.is_active;
    await banner.save();

    return res.json({
      success: true,
      message: `Banner is now ${banner.is_active ? "ACTIVE" : "INACTIVE"}`,
      is_active: banner.is_active,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
