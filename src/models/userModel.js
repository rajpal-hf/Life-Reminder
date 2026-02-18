// models/user.model.js

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: '',
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    countryCode: {
      type: String,
      default: '+91',
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
      default: null,
    },

    whatsappNumber: {
      type: String,
      trim: true,
      default: null,
    },

    notificationPreferences: {
      email: { type: Boolean, default: true },
      whatsapp: { type: Boolean, default: true },
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    // OTP related
    otp: String,
    otpExpiry: Date,

    lastLoginAt: Date,
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);
