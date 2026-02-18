/**
 * Daily Reminder Cron Job
 * ───────────────────────
 * Thin scheduler — all business logic lives in the service layer.
 */

const cron = require('node-cron');
const config = require('../config/appConfig');
const logger = require('../utils/logger');
const { processReminders } = require('../services/notificationService');

const CTX = 'CronJob';

/**
 * Starts all cron jobs.
 * Call this once after the database connection is established.
 */
const startCronJobs = () => {
    const { reminderSchedule, timezone } = config.cron;

    cron.schedule(
        reminderSchedule,
        async () => {
            logger.info(CTX, `Cron triggered at ${new Date().toISOString()}`);
            await processReminders();
        },
        { timezone }
    );

    logger.info(CTX, `Daily reminder job scheduled: "${reminderSchedule}" (${timezone})`);
};

module.exports = { startCronJobs };
