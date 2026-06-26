const express = require("express");
const router = express.Router();

const {
  createCart,
  getAllCart,
  getCartById,
  updateCart,
  deleteCart,
  getCartByDivid,
} = require("../controllers/cartController");

router.post("/create", createCart);
router.get("/", getAllCart);
router.get("/device/:divid", getCartByDivid);
router.get("/:id", getCartById);
router.put("/:id", updateCart);
router.delete("/:id", deleteCart);

module.exports = router;