const express = require("express");
const router = express.Router();

const {
  placeOrder,
  getAllOrders,
  getOrderById,
  getOrdersByUser,
  getOrdersByVendor,
  updateOrderStatus,
  deleteOrder,
  createProductReturn,
  getProductReturns,
  getProductReturnsByVendor
} = require("../controllers/orderController");

// Place Order
router.post("/place-order", placeOrder);

// Get All Orders
router.get("/", getAllOrders);

// Get Order By User (user ka pura data + uske orders)
router.get("/user/:userId", getOrdersByUser);

// Get Order By Vendor (vendor ka pura data + uske orders)
router.get("/vendor/:vendorId", getOrdersByVendor);

// Get Order By ID
router.get("/:id", getOrderById);

// Update Status
router.put("/:id/status", updateOrderStatus);

// Return Request
router.post("/return", createProductReturn);

router.get("/vendordata/:vendorId", getProductReturnsByVendor);

// Delete Order
router.delete("/:id", deleteOrder);

module.exports = router;