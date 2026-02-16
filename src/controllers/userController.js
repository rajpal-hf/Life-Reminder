const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

const generateOTP = () => {
  //   return Math.floor(100000 + Math.random() * 900000).toString()
  return "1234";
};

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
};

// signup + login (phone based)
const verifyPhone = async (req, res) => {
  try {
    const { phone, countryCode = "+91", otp } = req.body;

    // ---------------- VALIDATION ----------------
    if (!phone) {
      return res.status(400).json({
        message: "Phone is required"
      });
    }

    if (!/^[0-9]{8,15}$/.test(phone)) {
      return res.status(400).json({
        message: "Invalid phone number"
      });
    }

    // ---------------- STEP 1 : SEND OTP ----------------
    if (!otp) {
      const generatedOtp = generateOTP();
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 min

      let user = await User.findOne({ phone });

      if (!user) {
        user = await User.create({
          phone,
          countryCode,
          otp: generatedOtp,
          otpExpiry
        });
      } else {
        user.otp = generatedOtp;
        user.otpExpiry = otpExpiry;
        await user.save();
      }

      // TODO: integrate SMS provider here
      console.log("OTP:", generatedOtp);

      return res.status(200).json({
        message: "OTP sent successfully"
      });
    }

    // ---------------- STEP 2 : VERIFY OTP ----------------
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({
        message: "OTP not requested"
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({
        message: "OTP expired"
      });
    }

    // mark verified
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    user.lastLoginAt = new Date();

    await user.save();

    const token = generateToken(user._id);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        phone: user.phone,
        countryCode: user.countryCode
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get all users (admin/debug)
const getUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select("-otp -otpExpiry");

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  verifyPhone,
  getUsers,
};
