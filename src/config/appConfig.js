/**
 * Centralized application configuration.
 * All environment variables are read here with sensible defaults.
 */

require('dotenv').config();

const config = {
    server: {
        port: parseInt(process.env.PORT, 10) || 5000,
        nodeEnv: process.env.NODE_ENV || 'development',
    },

    database: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/lifereminder',
    },

    jwt: {
        secret: process.env.JWT_SECRET || 'your_super_secret_key',
        expiresIn: process.env.JWT_EXPIRES_IN || '30d',
    },

    smtp: {
        host: process.env.SMTP_HOST || '',
        port: parseInt(process.env.SMTP_PORT, 10) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
        from: process.env.SMTP_FROM || 'Life Reminder <noreply@lifereminder.app>',
    },

    whatsapp: {
        apiUrl: process.env.WHATSAPP_API_URL || '',
        apiKey: process.env.WHATSAPP_API_KEY || '',
    },

    cron: {
        /** Cron expression for the daily reminder job (default: 7:00 AM) */
        reminderSchedule: process.env.CRON_REMINDER_SCHEDULE || '0 7 * * *',
        timezone: process.env.CRON_TIMEZONE || 'Asia/Kolkata',
    },

    notification: {
        /** Enable/disable notification channels globally */
        emailEnabled: process.env.NOTIFICATION_EMAIL_ENABLED !== 'false',
        whatsappEnabled: process.env.NOTIFICATION_WHATSAPP_ENABLED !== 'false',
    },
};


config.smtp.isConfigured = () =>
    Boolean(config.smtp.host && config.smtp.user && config.smtp.pass);


config.whatsapp.isConfigured = () =>
    Boolean(config.whatsapp.apiUrl && config.whatsapp.apiKey);

module.exports = config;
