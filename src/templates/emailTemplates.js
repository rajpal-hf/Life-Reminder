

const TYPE_ICONS = {
    birthday: '🎂',
    anniversary: '💍',
    bill: '💰',
    custom: '📌',
};


const buildReminderEmail = (userName, reminders) => {
    const displayName = userName || 'there';

    const reminderRows = reminders
        .map((r) => {
            const icon = TYPE_ICONS[r.type] || TYPE_ICONS.custom;
            const notes = r.notes ? `<br/><span style="color:#888;font-size:13px;">${r.notes}</span>` : '';
            return `
        <tr>
          <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;">
            <span style="font-size:20px;margin-right:8px;">${icon}</span>
            <strong>${r.title}</strong>
            ${notes}
          </td>
          <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;text-align:right;">
            <span style="
              display:inline-block;
              padding:4px 12px;
              border-radius:12px;
              font-size:12px;
              font-weight:600;
              color:#fff;
              background:${r.label === 'Today' ? '#e74c3c' : '#f39c12'};
            ">${r.label}</span>
          </td>
        </tr>`;
        })
        .join('');

    const subject =
        reminders.length === 1
            ? `Reminder: ${reminders[0].title} (${reminders[0].label})`
            : `You have ${reminders.length} upcoming reminders`;

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:28px 32px;">
              <h1 style="margin:0;color:#fff;font-size:22px;font-weight:600;">
                🔔 Life Reminder
              </h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:28px 32px;">
              <p style="margin:0 0 20px;font-size:16px;color:#333;">
                Hi <strong>${displayName}</strong>, here are your upcoming reminders:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:8px;overflow:hidden;">
                ${reminderRows}
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;background:#f9fafb;text-align:center;font-size:12px;color:#999;">
              You received this email because you have active reminders on Life Reminder.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    return { subject, html };
};

module.exports = { buildReminderEmail };
