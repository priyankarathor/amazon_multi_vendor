// routes/admin/bannerRoutes.js
const express = require('express');
const router = express.Router();
const bannerController = require('../../controllers/admin/bannerController');

router.post('/', bannerController.createBanner);   // create
router.get('/', bannerController.getAllBanners);   // list all
router.get('/:id', bannerController.getBanner);      // single detail
router.put('/:id', bannerController.updateBanner);   // update
router.delete('/:id', bannerController.deleteBanner);   // delete
router.patch('/:id/toggle', bannerController.toggleBanner);   // enable/disable

module.exports = router;