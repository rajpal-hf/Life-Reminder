/**
 * Email Service
 * ─────────────
 * Sends emails via Nodemailer SMTP.
 * Gracefully degrades when SMTP is not configured.
 */

const nodemailer = require('nodemailer');
const config = require('../config/appConfig');
const logger = require('../utils/logger');

const CTX = 'EmailService';

let transporter = null;

/**
 * Lazily initialises the Nodemailer transporter.
 */
const getTransporter = () => {
    if (transporter) return transporter;

    if (!config.smtp.isConfigured()) {
        return null;
    }

    transporter = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.secure,
        auth: {
            user: config.smtp.user,
            pass: config.smtp.pass,
        },
    });

    return transporter;
};

const sendEmail = async ({ to, subject, html }) => {
    try {
        if (!to) {
            logger.warn(CTX, 'No recipient email provided — skipping');
            return { success: false, status: 'skipped', error: 'No recipient email' };
        }

        const transport = getTransporter();

        if (!transport) {
            logger.warn(CTX, 'SMTP not configured — email skipped', { to, subject });
            return { success: false, status: 'skipped', error: 'SMTP not configured' };
        }

        const info = await transport.sendMail({
            from: config.smtp.from,
            to,
            subject,
            html,
        });

        logger.info(CTX, `Email sent to ${to}`, { messageId: info.messageId });
        return { success: true, status: 'sent', messageId: info.messageId };
    } catch (error) {
        logger.error(CTX, `Failed to send email to ${to}`, { error: error.message });
        return { success: false, status: 'failed', error: error.message };
    }
};

module.exports = { sendEmail };
