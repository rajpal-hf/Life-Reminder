const mongoose = require("mongoose");
const Reminder = require("../models/reminderModel");

/* -------------------- HELPERS -------------------- */

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const allowedTypes = ["birthday", "anniversary", "bill", "custom"];

/* -------------------- CREATE REMINDER -------------------- */

const createReminder = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const {
      title,
      date,
      type = "custom",
      remindBeforeDays = 1,
      repeatEveryYear = true,
      notes = "",
    } = req.body;

    /* ---------- VALIDATIONS ---------- */

    if (!userId || !isValidObjectId(userId)) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!title || title.trim().length < 2) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ message: "Invalid reminder type" });
    }

    if (remindBeforeDays < 0 || remindBeforeDays > 365) {
      return res
        .status(400)
        .json({ message: "remindBeforeDays must be between 0-365" });
    }

    /* ---------- CREATE ---------- */

    const reminder = await Reminder.create({
      userId,
      title: title.trim(),
      date: parsedDate,
      type,
      remindBeforeDays,
      repeatEveryYear,
      notes,
    });

    return res.status(201).json({
      message: "Reminder created successfully",
      reminder,
    });
  } catch (error) {
    console.error("Create Reminder Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------- GET SINGLE REMINDER -------------------- */

const getReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid reminder id" });
    }

    const reminder = await Reminder.findOne({
      _id: id,
      userId,
      isActive: true,
    });

    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    res.status(200).json(reminder);
  } catch (error) {
    console.error("Get Reminder Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------- UPDATE REMINDER -------------------- */

const updateReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid reminder id" });
    }

    const reminder = await Reminder.findOne({
      _id: id,
      userId,
    });

    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    const {
      title,
      date,
      type,
      remindBeforeDays,
      repeatEveryYear,
      notes,
      isActive,
    } = req.body;

    /* ---------- SAFE FIELD UPDATES ---------- */

    if (title !== undefined) {
      if (title.trim().length < 2) {
        return res.status(400).json({ message: "Invalid title" });
      }
      reminder.title = title.trim();
    }

    if (date !== undefined) {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      reminder.date = parsedDate;
    }

    if (type !== undefined) {
      if (!allowedTypes.includes(type)) {
        return res.status(400).json({ message: "Invalid type" });
      }
      reminder.type = type;
    }

    if (remindBeforeDays !== undefined) {
      if (remindBeforeDays < 0 || remindBeforeDays > 365) {
        return res
          .status(400)
          .json({ message: "remindBeforeDays must be 0-365" });
      }
      reminder.remindBeforeDays = remindBeforeDays;
    }

    if (repeatEveryYear !== undefined) {
      reminder.repeatEveryYear = repeatEveryYear;
    }

    if (notes !== undefined) {
      reminder.notes = notes;
    }

    if (isActive !== undefined) {
      reminder.isActive = isActive;
    }

    await reminder.save();

    res.status(200).json({
      message: "Reminder updated successfully",
      reminder,
    });
  } catch (error) {
    console.error("Update Reminder Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------- DELETE REMINDER (SOFT DELETE) -------------------- */

const deleteReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid reminder id" });
    }

    const reminder = await Reminder.findOne({
      _id: id,
      userId,
    });

    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    // Soft delete
    reminder.isActive = false;
    await reminder.save();

    res.status(200).json({
      message: "Reminder deleted successfully",
    });
  } catch (error) {
    console.error("Delete Reminder Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------- GET ALL REMINDERS (USER BASED) -------------------- */

const getAllReminders = async (req, res) => {
  try {
    const userId = req.user?.userId;

    const {
      type,
      isActive = true,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {
      userId,
      isActive: isActive === "false" ? false : true,
    };

    if (type && allowedTypes.includes(type)) {
      query.type = type;
    }

    const reminders = await Reminder.find(query)
      .sort({ date: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Reminder.countDocuments(query);

    res.status(200).json({
      total,
      page: Number(page),
      limit: Number(limit),
      reminders,
    });
  } catch (error) {
    console.error("Get All Reminders Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createReminder,
  getReminder,
  updateReminder,
  deleteReminder,
  getAllReminders,
};
