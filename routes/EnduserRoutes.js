const express = require("express");
const router = express.Router();

const {
  registerendUser,
  loginUser,
} = require("../controllers/enduserController");

router.post("/endregister", registerendUser);
router.post("/endlogin", loginUser);

module.exports = router;