/**
 * Formats a date string into a readable date string.
 * Default format: "Jun 12, 2026"
 * 
 * @param {string|Date} dateString 
 * @param {object} options - Custom options for toLocaleDateString, fallback, etc.
 * @returns {string}
 */
export const formatDate = (dateString, options = {}) => {
    const { fallback = '-', ...dateOptions } = options;
    if (!dateString) return fallback;
    
    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...dateOptions
    };
    
    try {
        return new Date(dateString).toLocaleDateString('en-US', defaultOptions);
    } catch (e) {
        return fallback;
    }
};

/**
 * Formats a date string into a detailed date and time string.
 * Default format: "Jun 12, 2026, 06:56 PM"
 * 
 * @param {string|Date} dateString 
 * @param {object} options 
 * @returns {string}
 */
export const formatDateTime = (dateString, options = {}) => {
    const { 
        fallback = '-', 
        includeSeconds = false, 
        hour12 = undefined,
        ...dateOptions
    } = options;
    
    if (!dateString) return fallback;
    
    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        ...(includeSeconds && { second: '2-digit' }),
        ...(hour12 !== undefined && { hour12 }),
        ...dateOptions
    };
    
    try {
        return new Date(dateString).toLocaleString('en-US', defaultOptions);
    } catch (e) {
        return fallback;
    }
};

/**
 * Formats a "HH:MM:SS" or "HH:MM" 24-hour time string into a 12-hour "hh:mm AM/PM" string.
 * 
 * @param {string} timeStr 
 * @param {object} options 
 * @returns {string}
 */
export const formatTimeLabel = (timeStr, options = {}) => {
    if (!timeStr) return '';
    const { padHours = true } = options;
    try {
        const [h, m] = timeStr.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayHour = h % 12 === 0 ? 12 : h % 12;
        const hrStr = padHours ? String(displayHour).padStart(2, '0') : String(displayHour);
        const minStr = String(m).padStart(2, '0');
        return `${hrStr}:${minStr} ${ampm}`;
    } catch (e) {
        return timeStr;
    }
};
