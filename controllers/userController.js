const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const transporter = require("../config/mail");


// ================= SEND OTP =================
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email required",
      });
    }

    let user = await User.findOne({ email });

    if (user && user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified",
      });
    }

    if (user && user.otpExpiry && new Date() < user.otpExpiry) {
      const remaining = Math.ceil((user.otpExpiry - new Date()) / 1000);

      return res.status(400).json({
        success: false,
        message: `Please wait ${remaining} sec before requesting new OTP`,
      });
    }

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    const otpExpiry = new Date(Date.now() + 60 * 1000);

    if (!user) {
      user = new User({ email });
    }

    user.otp = String(otp);
    user.otpExpiry = otpExpiry;
    user.isVerified = false;

    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "OTP Verification",
      html: `<h2>Your OTP is ${otp}</h2><p>Valid for 60 sec</p>`,
    });

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ================= RESEND OTP =================
const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.otpExpiry && new Date() < user.otpExpiry) {
      const remaining = Math.ceil((user.otpExpiry - new Date()) / 1000);

      return res.status(400).json({
        success: false,
        message: `Please wait ${remaining} sec`,
      });
    }

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    user.otp = String(otp);
    user.otpExpiry = new Date(Date.now() + 60 * 1000);

    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Resend OTP",
      html: `<h2>Your OTP is ${otp}</h2>`,
    });

    res.status(200).json({
      success: true,
      message: "OTP resent successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }

   return res.status(200).json({
      success:true,
      message:"New OTP sent successfully"
   });
};


// ================= VERIFY OTP =================
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (String(user.otp) !== String(otp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (new Date() > user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= REGISTER =================
const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      number,
      password,
      companyname,
      category,
      city,
      state,
      pincode,
    } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Verify email first",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.name = name;
    user.number = number;
    user.password = hashedPassword;
    user.companyname = companyname;
    user.category = category;
    user.city = city;
    user.state = state;
    user.pincode = pincode;
    user.role = "vendor";
    user.status = "pending";

    await user.save();

    res.status(201).json({
      success: true,
      message: "Registration successful. Waiting for admin approval.",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ================= LOGIN =================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    if (user.role === "vendor" && user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Account not activated by admin",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userData = user.toObject();
    delete userData.password;

    res.status(200).json({
      success: true,
      token,
      user: userData,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ================= CRUD =================
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      success: true,
      users,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getSingleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "User deleted",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateVendorStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const user = await User.findById(req.params.id);

    user.status = status;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Vendor status updated to ${status}`,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
  registerUser,
  loginUser,
 getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
  updateVendorStatus,
  sendOtp,
  verifyOtp,
  resendOtp,
};