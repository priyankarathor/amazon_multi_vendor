const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const controller = require("../controllers/categoryAttributeController");

router.post("/add", verifyToken, authorizeRoles("SuperAdmin", "Vendor"), controller.createAttribute);
router.get("/category/:categoryId",  controller.getAttributesByCategory);
router.get("/:id", verifyToken, controller.getAttribute);
router.put("/:id", verifyToken, authorizeRoles("SuperAdmin", "Vendor"), controller.updateAttribute);
router.delete("/:id", verifyToken, authorizeRoles("SuperAdmin"), controller.deleteAttribute);

module.exports = router;