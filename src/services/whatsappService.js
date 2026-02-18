/**
 * WhatsApp Service
 * ────────────────
 * Sends WhatsApp messages via the configured API (e.g. Meta Cloud API).
 * Gracefully degrades when the API is not configured.
 */

const config = require('../config/appConfig');
const logger = require('../utils/logger');

const CTX = 'WhatsAppService';

/**
 * Sends a single WhatsApp message.
 *
 * @param {{ to: string, message: string }} options
 * @returns {Promise<{ success: boolean, status: string, error?: string }>}
 */
const sendWhatsApp = async ({ to, message }) => {
    try {
        if (!to) {
            logger.warn(CTX, 'No WhatsApp number provided — skipping');
            return { success: false, status: 'skipped', error: 'No WhatsApp number' };
        }

        if (!config.whatsapp.isConfigured()) {
            logger.warn(CTX, 'WhatsApp API not configured — message logged only', { to });
            logger.info(CTX, `WhatsApp message for ${to}:\n${message}`);
            return { success: false, status: 'skipped', error: 'WhatsApp API not configured' };
        }

        // ── Send via WhatsApp Business API ──
        const response = await fetch(config.whatsapp.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${config.whatsapp.apiKey}`,
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to,
                type: 'text',
                text: { body: message },
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorBody}`);
        }

        const data = await response.json();
        logger.info(CTX, `WhatsApp message sent to ${to}`, { messageId: data.messages?.[0]?.id });
        return { success: true, status: 'sent' };
    } catch (error) {
        logger.error(CTX, `Failed to send WhatsApp to ${to}`, { error: error.message });
        return { success: false, status: 'failed', error: error.message };
    }
};

module.exports = { sendWhatsApp };
