const cron = require("node-cron");
const Reminder = require("../models/reminder.model");
const User = require("../models/userModel");

/* ---------------- HELPERS ---------------- */

const getStartOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getEndOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

/* ---------------- NOTIFICATION MOCK ---------------- */

const sendNotification = async (user, reminder, label) => {
  // Later:
  // - SMS
  // - Email
  // - Push
  console.log(
    `[NOTIFY] ${label} -> ${user.phone} | ${reminder.title} | ${reminder.date}`
  );
};

/* ---------------- MAIN JOB LOGIC ---------------- */

const checkReminders = async () => {
  try {
    const now = new Date();

    const todayStart = getStartOfDay(now);
    const todayEnd = getEndOfDay(now);

    const tomorrow = addDays(now, 1);
    const tomorrowStart = getStartOfDay(tomorrow);
    const tomorrowEnd = getEndOfDay(tomorrow);

    // fetch active reminders
    const reminders = await Reminder.find({
      isActive: true,
    }).populate("userId");

    for (const reminder of reminders) {
      const reminderDate = new Date(reminder.date);

      let eventDate = reminderDate;

      /* -------- HANDLE YEARLY REPEAT -------- */
      if (reminder.repeatEveryYear) {
        eventDate = new Date(
          now.getFullYear(),
          reminderDate.getMonth(),
          reminderDate.getDate()
        );
      }

      /* -------- APPLY remindBeforeDays -------- */
      const notifyDate = addDays(eventDate, -reminder.remindBeforeDays);

      const isToday =
        notifyDate >= todayStart && notifyDate <= todayEnd;

      const isTomorrow =
        notifyDate >= tomorrowStart && notifyDate <= tomorrowEnd;

      if (!isToday && !isTomorrow) continue;

      /* -------- AVOID DUPLICATE SAME DAY -------- */
      if (reminder.lastNotifiedAt) {
        const last = getStartOfDay(reminder.lastNotifiedAt);
        if (last.getTime() === todayStart.getTime()) continue;
      }

      const user = reminder.userId;
      if (!user) continue;

      const label = isToday ? "TODAY" : "TOMORROW";

      await sendNotification(user, reminder, label);

      reminder.lastNotifiedAt = new Date();
      await reminder.save();
    }

    console.log("Reminder cron executed:", new Date());
  } catch (error) {
    console.error("Reminder Cron Error:", error);
  }
};

/* ---------------- CRON SCHEDULE ---------------- */

// 7:00 AM
cron.schedule("0 7 * * *", checkReminders);

// 7:00 PM
cron.schedule("0 19 * * *", checkReminders);

module.exports = {};
