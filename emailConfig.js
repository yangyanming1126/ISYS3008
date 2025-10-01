// Email configuration
// In a production environment, you should use environment variables for sensitive data
// For example: process.env.SMTP_HOST, process.env.SMTP_PORT, etc.

const emailConfig = {
  // SMTP server configuration
  host: 'smtp.126.com',  // Using Ethereal for testing - replace with your SMTP server
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: 'sleepytiger2025@126.com', // Replace with your SMTP username
    pass: 'KSc7E34KtjnDMKYd' // Replace with your SMTP password
  },
  // Default sender address
  from: '"Sleepy Tiger Farmhouse" <sleepytiger2025@126.com>',
  
  // Frontend URL for email verification links
  frontendUrl: 'http://localhost:3000'
};

module.exports = emailConfig;