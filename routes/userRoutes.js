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
  sendOtp,
  verifyOtp,
  resendOtp
} = require("../controllers/userController");

// OTP Routes
router.post("/send-otp", sendOtp);
router.post("/resend-otp", resendOtp);
router.post("/verify-otp", verifyOtp);

// Auth Routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Status Route (keep before /:id)
router.put("/status/:id", updateVendorStatus);

// CRUD Routes
router.get("/", getAllUsers);
router.get("/:id", getSingleUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;