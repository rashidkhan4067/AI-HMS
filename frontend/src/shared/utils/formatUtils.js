/**
 * Formats a number as PKR currency.
 * 
 * @param {number|string} amount 
 * @returns {string} Formatted string (e.g. "Rs 1,500")
 */
export const formatPKR = (amount) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return 'Rs 0';
    
    return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(num);
};

/**
 * Formats a number with comma separators.
 * 
 * @param {number|string} number 
 * @returns {string} Formatted string (e.g. "1,500")
 */
export const formatNumber = (number) => {
    const num = typeof number === 'string' ? parseFloat(number) : number;
    if (isNaN(num)) return '0';
    return new Intl.NumberFormat('en-US').format(num);
};
