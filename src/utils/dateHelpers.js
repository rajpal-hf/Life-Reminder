const getStartOfDay = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};


const getEndOfDay = (date) => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
};

const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
};

const isSameDay = (date1, date2) => {
    const a = new Date(date1);
    const b = new Date(date2);
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
};


const getEffectiveEventDate = (originalDate, repeatEveryYear, referenceDate = new Date()) => {
    if (!repeatEveryYear) return new Date(originalDate);

    return new Date(
        referenceDate.getFullYear(),
        originalDate.getMonth(),
        originalDate.getDate()
    );
};

/**
 * Returns the notification trigger date (event date minus remindBeforeDays).
 */
const getNotifyDate = (eventDate, remindBeforeDays) => {
    return addDays(eventDate, -remindBeforeDays);
};

module.exports = {
    getStartOfDay,
    getEndOfDay,
    addDays,
    isSameDay,
    getEffectiveEventDate,
    getNotifyDate,
};
