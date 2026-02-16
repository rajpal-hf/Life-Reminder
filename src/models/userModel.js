// models/user.model.js

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    countryCode: {
      type: String,
      default: "+91"
    },

    isVerified: {
      type: Boolean,
      default: false
    },

    // OTP related
    otp: String,
    otpExpiry: Date,

    lastLoginAt: Date
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);
