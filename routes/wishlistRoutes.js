const express = require("express");
const router = express.Router();

const {
  createWishlist,
  getAllWishlist,
  getWishlistById,
  updateWishlist,
  deleteWishlist,
  getWishlistByDivid,
} = require("../controllers/wislistController");

router.post("/create", createWishlist);
router.get("/", getAllWishlist);
router.get("/device/:divid", getWishlistByDivid);
router.get("/:id", getWishlistById);
router.put("/update/:id", updateWishlist);
router.delete("/delete/:id", deleteWishlist);

module.exports = router;