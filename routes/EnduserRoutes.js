const express = require("express");
const router = express.Router();

const {
  registerendUser,
  loginendUser,
} = require("../controllers/enduserController");

router.post("/endregister", registerendUser);
router.post("/endlogin", loginendUser);

module.exports = router;