const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Inventory = require("../models/Inventory");
const CustomerAddress = require("../models/CustomerAddress");

// =====================
// PLACE ORDER
// =====================
exports.placeOrder = async (req, res) => {
  try {
    const {
      user_id,
      vendor_id,
      items,
      payment_method,
      billing_address,
      shipping_address,
      customer_details,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Items are required",
      });
    }

    let subtotal = 0;

    // CHECK STOCK
    for (const item of items) {
      const inventory = await Inventory.findOne({
        productId: item.product_id,
        variantId: item.variant_id,
        vendorId: item.vendor_id,
      });

      if (!inventory) {
        return res.status(404).json({
          success: false,
          message: `Inventory not found for ${item.product_name}`,
        });
      }

      if (inventory.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `${item.product_name} is out of stock`,
        });
      }
    }

    // DEDUCT STOCK
    for (const item of items) {
      await Inventory.findOneAndUpdate(
        {
          productId: item.product_id,
          variantId: item.variant_id,
          vendorId: item.vendor_id,
        },
        {
          $inc: {
            stock: -item.quantity,
          },
        }
      );

      subtotal += item.quantity * item.unit_price;
    }

    // CREATE ORDER
    const order = await Order.create({
      order_number: "ORD-" + Date.now(),
      user_id,
      vendorId: vendor_id,
      payment_method,
      subtotal,
      total: subtotal,
      billing_address,
      shipping_address,
    });

    // SAVE ORDER ITEMS
    for (const item of items) {
      await OrderItem.create({
        order_id: order._id,
        product_id: item.product_id,
        product_variant_id: item.variant_id,
        vendorId: item.vendor_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.quantity * item.unit_price,
      });
    }

    // SAVE CUSTOMER ADDRESS
    await CustomerAddress.findOneAndUpdate(
      {
        user_id,
      },
      {
        user_id,
        vendorId: vendor_id,
        first_name: customer_details.first_name,
        last_name: customer_details.last_name,
        phone: customer_details.phone,
        email: customer_details.email,
        billing_address,
        shipping_address,
      },
      {
        upsert: true,
        new: true,
      }
    );

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================
// GET ALL ORDERS
// =====================
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user_id")
      .populate("vendorId")
      .sort({ createdAt: -1 });

    const data = await Promise.all(
      orders.map(async (order) => {
        const items = await OrderItem.find({
          order_id: order._id,
        });

        return {
          ...order.toObject(),
          items,
        };
      })
    );

    res.json({
      success: true,
      total: data.length,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================
// GET ORDER BY ID
// =====================
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user_id")
      .populate("vendorId");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const items = await OrderItem.find({
      order_id: order._id,
    });

    res.json({
      success: true,
      data: {
        ...order.toObject(),
        items,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================
// GET ORDERS BY USER
// =====================
exports.getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({
      user_id: userId,
    }).sort({ createdAt: -1 });

    const data = await Promise.all(
      orders.map(async (order) => {
        const items = await OrderItem.find({
          order_id: order._id,
        });

        return {
          ...order.toObject(),
          items,
        };
      })
    );

    res.json({
      success: true,
      total: data.length,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================
// GET ORDERS BY VENDOR
// =====================
exports.getOrdersByVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const orders = await Order.find({
      vendorId,
    })
      .populate("user_id")
      .populate("vendorId")
      .sort({ createdAt: -1 });

    const data = await Promise.all(
      orders.map(async (order) => {
        const items = await OrderItem.find({
          order_id: order._id,
        });

        return {
          ...order.toObject(),
          items,
        };
      })
    );

    res.json({
      success: true,
      total: data.length,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================
// UPDATE STATUS
// =====================
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
      },
      {
        new: true,
      }
    );

    res.json({
      success: true,
      message: "Status Updated",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================
// DELETE ORDER
// =====================
exports.deleteOrder = async (req, res) => {
  try {
    await OrderItem.deleteMany({
      order_id: req.params.id,
    });

    await Order.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Order Deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};