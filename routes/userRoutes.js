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
  resendOtp,
  sendwhatsappOtp,
  verifyWhatsappOtp,
} = require("../controllers/userController");

const { protect, isSuperAdmin } = require("../middleware/auth");

// ---- Public: OTP + auth ----
router.post("/send-wh-otp", sendwhatsappOtp);
router.post("/verify-wh-otp", verifyWhatsappOtp);

router.post("/send-otp", sendOtp);
router.post("/resend-otp", resendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/register", registerUser);
router.post("/login", loginUser);

// ---- Admin-only ----
// FIX: none of these routes had any auth check before. Anyone could
// list every user, delete accounts, or approve/block vendors.
router.put("/status/:id", protect, isSuperAdmin, updateVendorStatus);

router.get("/", protect, isSuperAdmin, getAllUsers);
router.get("/:id", protect, isSuperAdmin, getSingleUser);
router.put("/:id", protect, isSuperAdmin, updateUser);
router.delete("/:id", protect, isSuperAdmin, deleteUser);

module.exports = router;
