const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
  updateVendorStatus,
} = require("../controllers/userController");

// Auth
router.post("/register", registerUser);
router.post("/login", loginUser);

// User CRUD
router.get("/", getAllUsers);
router.get("/:id", getSingleUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

// Vendor Status Update
router.put("/status/:id", updateVendorStatus);

module.exports = router;