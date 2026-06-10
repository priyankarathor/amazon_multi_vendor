const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
} = require("../controllers/userController");

router.post("/enduserregister", registerUser);
router.post("/enduserlogin", loginUser);

module.exports = router;