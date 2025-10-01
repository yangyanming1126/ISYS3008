// Utility functions
const crypto = require('crypto');

// Generate a random token
function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

// Generate a time in the future (for token expiration)
function generateExpirationTime(hours = 24) {
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + hours);
  return expiration;
}

module.exports = {
  generateToken,
  generateExpirationTime
};