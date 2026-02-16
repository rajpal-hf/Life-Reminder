// models/reminder.model.js

const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    title: {
      type: String,
      required: true
    },

    date: {
      type: Date,
      required: true
    },

    type: {
      type: String,
      enum: ["birthday", "anniversary", "bill", "custom"],
      default: "custom"
    },

    remindBeforeDays: {
      type: Number,
      default: 1
    },

    repeatEveryYear: {
      type: Boolean,
      default: true
    },

    notes: String,

    isActive: {
      type: Boolean,
      default: true
    },

    lastNotifiedAt: Date
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Reminder", reminderSchema);
