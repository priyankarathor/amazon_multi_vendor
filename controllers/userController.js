const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const transporter = require("../config/mail");
const sendWhatsapp = require("../utils/sendWhatsapp");
const { generateOtp, getOtpExpiry } = require("../utils/otp");

const PHONE_REGEX = /^\d{10}$/;

const sendwhatsappOtp = async (req, res) => {
  try {
    const { number } = req.body;

    if (!number) {
      return res.status(400).json({
        success: false,
        message: "Phone number required",
      });
    }

    if (!PHONE_REGEX.test(number)) {
      return res.status(400).json({
        success: false,
        message: "Enter valid 10 digit number",
      });
    }

    let user = await User.findOne({ number });

    if (!user) {
      user = new User({ number });
    }

    const otp = generateOtp();

    user.otpphone = otp;
    user.otpExpiryphone = getOtpExpiry();

    await user.save();

    const message = encodeURIComponent(
      `Your OTP is ${otp}. Valid for 5 minutes.`
    );

    const whatsappUrl = `https://wa.me/91${number}?text=${message}`;

    return res.status(200).json({
      success: true,
      message: "WhatsApp link generated successfully",
      whatsappUrl,
      otp // remove in production
    });

  } catch (error) {
    console.log("sendwhatsappOtp error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


// ================= VERIFY WHATSAPP OTP =================
const verifyWhatsappOtp = async (req, res) => {
  try {
    const { number, otp } = req.body;

    if (!number || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone number and OTP are required",
      });
    }

    const user = await User.findOne({ number }).select("+otpphone +otpExpiryphone");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // FIX: guard against a never-requested / already-cleared OTP,
    // where otpphone is null — String(null) !== "123456" already
    // protects the match, but this gives a clearer message.
    if (!user.otpphone) {
      return res.status(400).json({
        success: false,
        message: "No OTP was requested for this number",
      });
    }

    if (String(user.otpphone) !== String(otp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (new Date() > user.otpExpiryphone) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    user.isVerifiedphone = true;
    user.otpphone = null;
    user.otpExpiryphone = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Phone verified successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong while verifying OTP",
    });
  }
};

// ================= SEND EMAIL OTP =================
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email required",
      });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address",
      });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ email });
    }

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiry = getOtpExpiry();
    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "OTP Verification",
      html: `<h2>Your OTP is ${otp}</h2><p>This code expires in 5 minutes.</p>`,
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while sending OTP",
    });
  }
};

// ================= RESEND OTP =================
const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiry = getOtpExpiry();

    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Resend OTP",
      html: `<h2>Your OTP is ${otp}</h2><p>This code expires in 5 minutes.</p>`,
    });

    return res.status(200).json({
      success: true,
      message: "New OTP sent successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while resending OTP",
    });
  }
};

// ================= VERIFY OTP =================
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({ email }).select("+otp +otpExpiry");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.otp) {
      return res.status(400).json({
        success: false,
        message: "No OTP was requested for this email",
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
      message: "OTP verified successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while verifying OTP",
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

    // FIX: none of this was validated before. Missing password used
    // to reach bcrypt.hash(undefined, 10) and throw an unhandled-ish
    // error that got reported back as a generic 500.
    const missingFields = [
      "name",
      "email",
      "number",
      "password",
      "companyname",
      "category",
      "city",
      "state",
      "pincode",
    ].filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    if (!PHONE_REGEX.test(number)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 10-digit phone number",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const user = await User.findOne({ email });

    if (!user || !user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Verify email first",
      });
    }

    // Prevent claiming a number that's already registered to someone else
    const numberOwner = await User.findOne({ number, _id: { $ne: user._id } });
    if (numberOwner) {
      return res.status(400).json({
        success: false,
        message: "This phone number is already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    user.name = name;
    user.number = number;
    user.password = hashedPassword;
    user.companyname = companyname;
    user.category = category;
    user.city = city;
    user.state = state;
    user.pincode = pincode;
    // FIX: schema enum is "Vendor" / "SuperAdmin" (capitalized), but
    // this used to write "vendor" — a straight validation failure.
    user.role = "Vendor";
    user.status = "pending";

    await user.save();

    return res.status(201).json({
      success: true,
      message: "Registration successful, awaiting admin approval",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong during registration",
    });
  }
};

// ================= LOGIN =================
const loginUser = async (req, res) => {
  try {
    const { email, password, otp } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email required",
      });
    }

    const user = await User.findOne({ email }).select("+password +otp +otpExpiry");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.status === "blocked") {
      return res.status(403).json({
        success: false,
        message: "This account has been blocked",
      });
    }

    if (!otp) {
      if (!password) {
        return res.status(400).json({
          success: false,
          message: "Password required",
        });
      }

      // FIX: previously if the user had never completed registration
      // (no password set), bcrypt.compare(password, undefined) threw
      // and the client got an opaque 500. Now it's a clean 400.
      if (!user.password) {
        return res.status(400).json({
          success: false,
          message: "Account has no password set. Please complete registration first",
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Invalid password",
        });
      }

      const loginOtp = generateOtp();
      user.otp = loginOtp;
      user.otpExpiry = getOtpExpiry();
      await user.save();

      await transporter.sendMail({
        from: process.env.EMAIL,
        to: user.email,
        subject: "Login OTP",
        html: `<h2>Your Login OTP is ${loginOtp}</h2>`,
      });

      return res.status(200).json({
        success: true,
        otpRequired: true,
        message: "OTP sent to email",
      });
    }

    if (!user.otp || String(user.otp) !== String(otp)) {
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

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    const userData = user.toObject();
    delete userData.password;
    delete userData.otp;
    delete userData.otpExpiry;
    delete userData.otpphone;
    delete userData.otpExpiryphone;

    return res.status(200).json({
      success: true,
      token,
      user: userData,
      message: "Login successful",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong during login",
    });
  }
};

// ================= CRUD (all admin-only, see routes) =================
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching users",
    });
  }
};

const getSingleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching the user",
    });
  }
};

const updateUser = async (req, res) => {
  try {
    // FIX: this was the mass-assignment hole. `User.findByIdAndUpdate(id, req.body)`
    // let a caller send { role: "SuperAdmin" } or { status: "active" } or a raw,
    // unhashed `password` and have it saved directly. Only a fixed, safe set of
    // profile fields can be touched here now; role/status/password go through
    // their own dedicated, admin-gated endpoints.
    const allowedFields = [
      "name",
      "companyname",
      "category",
      "city",
      "state",
      "pincode",
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong while updating the user",
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong while deleting the user",
    });
  }
};

const updateVendorStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["pending", "active", "inactive", "blocked"];

    // FIX: previously any string was accepted and saved as-is.
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowedStatuses.join(", ")}`,
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.status = status;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Vendor status updated to ${status}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong while updating vendor status",
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
  sendwhatsappOtp,
  verifyWhatsappOtp,
};
