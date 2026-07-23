const express = require("express");
const router = express.Router();

const {
  registerendUser,
  loginendUser,
  getAllendUsers,
  getendUserById,
  updateendUser,
} = require("../controllers/enduserController");

// Register
router.post("/endregister", registerendUser);

// Login
router.post("/endlogin", loginendUser);

// Get All Users
router.get("/endusers", getAllendUsers);

// Get User By ID
router.get("/enduser/:id", getendUserById);

// Update User By ID
router.put("/enduser/:id", updateendUser);

module.exports = router;