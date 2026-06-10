const User = require("../models/Enduser");
const bcrypt = require("bcryptjs");

// ======================
// REGISTER USER
// ======================
const registerendUser = async (req, res) => {
  try {
    const {
      name,
      lastname,
      email,
      number,
      password,
      status,
      city,
      state,
      pincode,
    } = req.body;

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const user = await User.create({
      name,
      lastname,
      email,
      number,
      password: hashedPassword,
      status,
      city,
      state,
      pincode,
    });

    // Remove password from response
    const userData = user.toObject();
    delete userData.password;

    return res.status(201).json({
      success: true,
      message: "User Registered Successfully",
      user: userData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================
// LOGIN USER
// ======================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check Email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check Password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid Password",
      });
    }

    // Remove password from response
    const userData = user.toObject();
    delete userData.password;

    return res.status(200).json({
      success: true,
      message: "Login Successful",
      user: userData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  registerendUser,
  loginUser,
};