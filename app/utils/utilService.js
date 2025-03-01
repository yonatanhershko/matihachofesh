export function makeId(length = 6) {
    var txt = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        txt += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return txt;
}

export function generateHolidayId(holidayName, date) {
    // Create a unique but consistent ID for each holiday instance
    const year = date.format('YYYY');
    const month = date.format('MM');
    const day = date.format('DD');
    const baseId = `${holidayName}_${year}${month}${day}`;
    
    // Add a random component to ensure uniqueness
    const randomPart = makeId(4);
    return `${baseId}_${randomPart}`;
}

export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function timeSince(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    
    if (interval > 1) return Math.floor(interval) + ' שנים';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' חודשים';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' ימים';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' שעות';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' דקות';
    return Math.floor(seconds) + ' שניות';
}
