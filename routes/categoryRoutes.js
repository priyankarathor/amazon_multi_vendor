const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const controller = require("../controllers/categoryController");

router.post("/add", verifyToken, authorizeRoles("SuperAdmin", "Vendor"), controller.createCategory);
router.get("/tree", verifyToken, controller.getCategoryTree);
router.get("/children/:id", verifyToken, controller.getChildCategories);
router.get("/parents/:id", verifyToken, controller.getParentCategories);
router.get("/", verifyToken, controller.getCategories);
router.get("/:id", verifyToken, controller.getCategory);
router.put("/:id", verifyToken, authorizeRoles("SuperAdmin", "Vendor"), controller.updateCategory);
router.delete("/delete/:id", verifyToken, authorizeRoles("SuperAdmin"), controller.deleteCategory);

module.exports = router;