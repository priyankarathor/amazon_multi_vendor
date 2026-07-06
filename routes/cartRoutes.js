const express = require("express");
const router = express.Router();

const {
  createCart,
  getAllCart,
  getCartById,
  updateCart,
  deleteCart,
  getCartByDivid,
  getCartByCid
} = require("../controllers/cartController");

router.post("/create", createCart);
router.get("/", getAllCart);
router.get("/device/:divid", getCartByDivid);
router.get("/:id", getCartById);
router.put("/update/:id", updateCart);
router.delete("/delete/:id", deleteCart);
router.get("/customer/:cid", getCartByCid);

module.exports = router;