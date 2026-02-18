const TYPE_ICONS = {
    birthday: '🎂',
    anniversary: '💍',
    bill: '💰',
    custom: '📌',
};

const buildReminderWhatsApp = (userName, reminders) => {
    const displayName = userName || 'there';

    const lines = reminders.map((r, i) => {
        const icon = TYPE_ICONS[r.type] || TYPE_ICONS.custom;
        const notes = r.notes ? `\n   _${r.notes}_` : '';
        return `${i + 1}. ${icon} *${r.title}* — ${r.label}${notes}`;
    });

    const header = `🔔 *Life Reminder*\n\nHi ${displayName}, here are your upcoming reminders:\n`;
    const body = lines.join('\n');
    const footer = `\n\n— _Life Reminder App_`;

    return `${header}\n${body}${footer}`;
};

module.exports = { buildReminderWhatsApp };
