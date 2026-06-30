const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Inventory = require("../models/Inventory");
const CustomerAddress = require("../models/CustomerAddress");

exports.placeOrder = async (req, res) => {
  try {
    const {
      user_id,
      items,
      payment_method,
      billing_address,
      shipping_address,
      customer_details
    } = req.body;

    let subtotal = 0;

    // STOCK CHECK
    for (let item of items) {
      const inventory = await Inventory.findOne({
        productId: item.product_id,
        variantId: item.variant_id,
        vendorId: item.vendor_id
      });

      if (!inventory) {
        return res.status(404).json({
          success: false,
          message: "Inventory not found"
        });
      }

      if (inventory.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `${item.product_name} out of stock`
        });
      }
    }

    // DEDUCT STOCK
    for (let item of items) {
      await Inventory.findOneAndUpdate(
        {
          productId: item.product_id,
          variantId: item.variant_id,
          vendorId: item.vendor_id
        },
        { $inc: { stock: -item.quantity } }
      );

      subtotal += item.unit_price * item.quantity;
    }

    const order = await Order.create({
      order_number: "ORD-" + Date.now(),
      user_id,
      payment_method,
      subtotal,
      total: subtotal,
      billing_address,
      shipping_address
    });

    for (let item of items) {
      await OrderItem.create({
        order_id: order._id,
        product_id: item.product_id,
        product_variant_id: item.variant_id,
        vendor_id: item.vendor_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.unit_price * item.quantity
      });
    }

    // SAVE CUSTOMER DETAILS
    await CustomerAddress.findOneAndUpdate(
      { user_id },
      {
        user_id,
        first_name: customer_details.first_name,
        last_name: customer_details.last_name,
        phone: customer_details.phone,
        email: customer_details.email,
        billing_address,
        shipping_address
      },
      { upsert: true, new: true }
    );

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};