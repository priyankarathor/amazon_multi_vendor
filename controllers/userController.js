const User = require("../models/User");
const bcrypt = require("bcryptjs");

const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      number,
      password,
      status,
      role,
      companyname,
      category,
      city,
      state,
      pincode,
    } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      number,
      password: hashedPassword,
      status,
      role,
      companyname,
      category,
      city,
      state,
      pincode,
    });

    const userData = user.toObject();
    delete userData.password;

    res.status(201).json({
      success: true,
      message: "User Registered Successfully",
      user: userData,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  registerUser,
};