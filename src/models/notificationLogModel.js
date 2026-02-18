/**
 * Notification Log — tracks every notification attempt for auditing
 * and duplicate-prevention.
 */

const mongoose = require('mongoose');

const notificationLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },

        channel: {
            type: String,
            enum: ['email', 'whatsapp'],
            required: true,
        },

        reminderIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Reminder',
            },
        ],

        status: {
            type: String,
            enum: ['sent', 'failed', 'skipped'],
            required: true,
        },

        /** Error message or skip reason */
        message: {
            type: String,
            default: '',
        },

        sentAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

/** Compound index for efficient querying by user + date */
notificationLogSchema.index({ userId: 1, sentAt: -1 });

module.exports = mongoose.model('NotificationLog', notificationLogSchema);
