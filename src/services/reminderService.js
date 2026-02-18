const Reminder = require('../models/reminderModel');
const {
    getStartOfDay,
    getEndOfDay,
    addDays,
    isSameDay,
    getEffectiveEventDate,
    getNotifyDate,
} = require('../utils/dateHelpers');
const logger = require('../utils/logger');

const CTX = 'ReminderService';


const getDueReminders = async () => {
    const now = new Date();
    const todayStart = getStartOfDay(now);
    const todayEnd = getEndOfDay(now);

    const tomorrow = addDays(now, 1);
    const tomorrowStart = getStartOfDay(tomorrow);
    const tomorrowEnd = getEndOfDay(tomorrow);

    const reminders = await Reminder.find({ isActive: true }).populate('userId');

    const dueItems = [];

    for (const reminder of reminders) {
        const user = reminder.userId;
        if (!user) continue;

        const originalDate = new Date(reminder.date);
        const eventDate = getEffectiveEventDate(originalDate, reminder.repeatEveryYear, now);

        // Check if the EVENT itself is today or tomorrow
        const eventIsToday = eventDate >= todayStart && eventDate <= todayEnd;
        const eventIsTomorrow = eventDate >= tomorrowStart && eventDate <= tomorrowEnd;

        // Check if the NOTIFICATION trigger date (event − remindBeforeDays) is today
        const notifyDate = getNotifyDate(eventDate, reminder.remindBeforeDays);
        const notifyIsToday = notifyDate >= todayStart && notifyDate <= todayEnd;

        // We send a notification if:
        //  1. The event is today   → label "Today"
        //  2. The event is tomorrow → label "Tomorrow"  (only if remindBeforeDays >= 1 and notify date is today)
        //  3. The notify trigger date is today for events further out → label "In X days"
        // For simplicity we focus on the two main cases: event today & event tomorrow.

        let label = null;

        if (eventIsToday) {
            label = 'Today';
        } else if (eventIsTomorrow) {
            label = 'Tomorrow';
        } else if (notifyIsToday && !eventIsToday) {
            // The remindBeforeDays pushed the notify date to today for a future event
            const daysUntil = Math.ceil((eventDate - todayStart) / (1000 * 60 * 60 * 24));
            label = `In ${daysUntil} day${daysUntil > 1 ? 's' : ''}`;
        }

        if (!label) continue;

        // ── Duplicate guard: skip if already notified today ──
        if (reminder.lastNotifiedAt && isSameDay(reminder.lastNotifiedAt, now)) {
            logger.info(CTX, `Skipping "${reminder.title}" — already notified today`);
            continue;
        }

        dueItems.push({ reminder, user, label });
    }

    logger.info(CTX, `Found ${dueItems.length} due reminder(s)`);
    return dueItems;
};

const groupRemindersByUser = (dueItems) => {
    const grouped = new Map();

    for (const { reminder, user, label } of dueItems) {
        const id = user._id.toString();

        if (!grouped.has(id)) {
            grouped.set(id, { user, items: [] });
        }

        grouped.get(id).items.push({ reminder, label });
    }

    return grouped;
};


const markRemindersAsNotified = async (reminderIds) => {
    if (!reminderIds.length) return;

    await Reminder.updateMany(
        { _id: { $in: reminderIds } },
        { $set: { lastNotifiedAt: new Date() } }
    );

    logger.info(CTX, `Marked ${reminderIds.length} reminder(s) as notified`);
};

module.exports = {
    getDueReminders,
    groupRemindersByUser,
    markRemindersAsNotified,
};
