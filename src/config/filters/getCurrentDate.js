/**
 * Get Current Date Filter
 * Returns the current date/time for comparing with post dates
 * This allows filtering out future-dated posts
 * 
 * @returns {Date} Current date and time
 */
module.exports = () => {
    return new Date();
};
