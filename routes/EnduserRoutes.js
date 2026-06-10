const express = require("express");
const router = express.Router();

const {
  registerendUser,
  loginUser,
} = require("../controllers/endUserController");

router.post("/endregister", registerendUser);
router.post("/endlogin", loginUser);

module.exports = router;