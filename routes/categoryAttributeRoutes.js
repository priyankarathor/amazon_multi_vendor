const express = require("express");
const router = express.Router();

const controller = require("../controllers/categoryAttributeController");

router.post("/add", controller.addAttribute);
router.get("/category/:categoryId", controller.getAttributesByCategory);
router.delete("/:id", controller.deleteAttribute);

module.exports = router;