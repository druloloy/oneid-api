const betweenDates = (startDate, endDate, unit) => {
    const start = new Date(startDate || Date.now());
    const end = new Date(endDate || Date.now());
    const diff = end - start;
    const diffInMinutes = diff / (1000 * 60);
    const diffInDays = diffInMinutes / 60 / 24;
    const diffInWeeks = diffInDays / 7;
    const diffInMonths = diffInDays / 30;
    const diffInYears = diffInDays / 365;

    switch (unit) {
        case 'days':
            return diffInDays;
        case 'minutes':
            return diffInMinutes;
        case 'weeks':
            return diffInWeeks;
        case 'months':
            return diffInMonths;
        case 'years':
            return diffInYears;
        default:
            return diffInDays;
    }
};

const preprocess = (data) => {
    return data.map((item) => {
        return {
            age: Math.floor(
                betweenDates(item.patient.birthdate, null, 'years')
            ),
            waitTime: parseFloat(
                betweenDates(
                    item.timeStarted,
                    item.timeServiced,
                    'minutes'
                ).toFixed(4)
            ),

            serviceTime: parseFloat(
                betweenDates(
                    item.timeServiced,
                    item.timeEnded,
                    'minutes'
                ).toFixed(4)
            ),
        };
    });
};

module.exports = preprocess;
