/**
 * Clear Messages from localStorage
 * Run this in the browser console to clear old messages and load new ones with updated dates
 */

// Clear the old messages
localStorage.removeItem('pneumai_messages');
localStorage.removeItem('pneumAIMessages');

console.log('✅ Messages cleared! Refresh the page to see updated message dates.');
