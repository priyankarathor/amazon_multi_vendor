// routes/bannerRoutes.js
const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');

router.get('/', bannerController.getAllBanners);     // homepage banners
router.get('/:id/products', bannerController.getBannerProducts); // click → products

module.exports = router;