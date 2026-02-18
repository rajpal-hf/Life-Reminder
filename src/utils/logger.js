/**
 * Lightweight structured logger.
 * Wraps console with consistent formatting.
 * Replace with Winston / Pino in production if needed.
 */

const TAG_COLORS = {
    INFO: '\x1b[36m',   // cyan
    WARN: '\x1b[33m',   // yellow
    ERROR: '\x1b[31m',  // red
    RESET: '\x1b[0m',
};

const timestamp = () => new Date().toISOString();

const formatMessage = (level, context, message, meta) => {
    const prefix = `${TAG_COLORS[level] || ''}[${level}]${TAG_COLORS.RESET} ${timestamp()}`;
    const ctx = context ? ` [${context}]` : '';
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `${prefix}${ctx} ${message}${metaStr}`;
};

const logger = {
    info: (context, message, meta) => {
        console.log(formatMessage('INFO', context, message, meta));
    },

    warn: (context, message, meta) => {
        console.warn(formatMessage('WARN', context, message, meta));
    },

    error: (context, message, meta) => {
        console.error(formatMessage('ERROR', context, message, meta));
    },
};

module.exports = logger;
