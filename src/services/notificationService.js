/**
 * Notification Service (Orchestrator)
 * ────────────────────────────────────
 * Called by the daily cron job. Coordinates the end-to-end flow:
 *   1. Fetch due reminders
 *   2. Group by user
 *   3. Send ONE email + ONE WhatsApp per user (combined)
 *   4. Log results
 *   5. Mark reminders as notified
 */

const config = require('../config/appConfig');
const logger = require('../utils/logger');
const NotificationLog = require('../models/notificationLogModel');
const { getDueReminders, groupRemindersByUser, markRemindersAsNotified } = require('./reminderService');
const { sendEmail } = require('./emailService');
const { sendWhatsApp } = require('./whatsappService');
const { buildReminderEmail } = require('../templates/emailTemplates');
const { buildReminderWhatsApp } = require('../templates/whatsappTemplates');

const CTX = 'NotificationService';

const toTemplateItems = (items) =>
    items.map(({ reminder, label }) => ({
        title: reminder.title,
        type: reminder.type,
        label,
        notes: reminder.notes || '',
    }));


const logNotification = async ({ userId, channel, reminderIds, status, message }) => {
    try {
        await NotificationLog.create({
            userId,
            channel,
            reminderIds,
            status,
            message: message || '',
            sentAt: new Date(),
        });
    } catch (error) {
        logger.error(CTX, `Failed to log notification`, { error: error.message });
    }
};


const sendUserEmail = async (user, items) => {
    if (!config.notification.emailEnabled) {
        logger.info(CTX, `Email notifications disabled globally — skipping ${user.phone}`);
        return;
    }

    if (user.notificationPreferences && user.notificationPreferences.email === false) {
        logger.info(CTX, `User ${user.phone} opted out of email notifications`);
        return;
    }

    const templateItems = toTemplateItems(items);
    const { subject, html } = buildReminderEmail(user.name, templateItems);
    const reminderIds = items.map((i) => i.reminder._id);

    const result = await sendEmail({ to: "pal51105@gmail.com", subject, html });

    await logNotification({
        userId: user._id,
        channel: 'email',
        reminderIds,
        status: result.status,
        message: result.error || result.messageId || '',
    });
};


// const sendUserWhatsApp = async (user, items) => {
//     if (!config.notification.whatsappEnabled) {
//         logger.info(CTX, `WhatsApp notifications disabled globally — skipping ${user.phone}`);
//         return;
//     }

//     if (user.notificationPreferences && user.notificationPreferences.whatsapp === false) {
//         logger.info(CTX, `User ${user.phone} opted out of WhatsApp notifications`);
//         return;
//     }

//     const templateItems = toTemplateItems(items);
//     const message = buildReminderWhatsApp(user.name, templateItems);
//     const whatsappNumber = user.whatsappNumber || `${user.countryCode}${user.phone}`;
//     const reminderIds = items.map((i) => i.reminder._id);

//     const result = await sendWhatsApp({ to: whatsappNumber, message });

//     await logNotification({
//         userId: user._id,
//         channel: 'whatsapp',
//         reminderIds,
//         status: result.status,
//         message: result.error || '',
//     });
// };


const processReminders = async () => {
    logger.info(CTX, '═══ Starting daily reminder processing ═══');

    try {
        // 1. Fetch due reminders
        const dueItems = await getDueReminders();

        if (dueItems.length === 0) {
            logger.info(CTX, 'No reminders due — exiting');
            return;
        }

        // 2. Group by user
        const grouped = groupRemindersByUser(dueItems);
        logger.info(CTX, `Grouped into ${grouped.size} user(s)`);

        const allNotifiedIds = [];

        // 3. Send notifications per user
        for (const [userId, { user, items }] of grouped) {
            logger.info(CTX, `Processing ${items.length} reminder(s) for user ${user.phone}`);

           
            await sendUserEmail(user, items);

            // await sendUserWhatsApp(user, items);

            allNotifiedIds.push(...items.map((i) => i.reminder._id));
        }

        await markRemindersAsNotified(allNotifiedIds);

        logger.info(CTX, `═══ Daily processing complete — ${allNotifiedIds.length} reminder(s) handled ═══`);
    } catch (error) {
        logger.error(CTX, 'Fatal error during reminder processing', { error: error.message, stack: error.stack });
    }
};

module.exports = { processReminders };
