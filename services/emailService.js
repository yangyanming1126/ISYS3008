const nodemailer = require('nodemailer');
const emailConfig = require('../emailConfig');

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport(emailConfig);

// Function to send verification email
async function sendVerificationEmail(to, verificationToken) {
  try {
    // Create verification URL using the configurable frontend URL
    const verificationUrl = `${emailConfig.frontendUrl}/api/auth/verify-email?token=${verificationToken}`;
    
    // Define email content
    const mailOptions = {
      from: emailConfig.from,
      to: to,
      subject: 'Email Verification - Sleepy Tiger Farmhouse',
      html: `
        <h2>Sleepy Tiger Farmhouse Email Verification</h2>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}" target="_blank">Verify Email</a>
        <p>If you did not create an account with us, please ignore this email.</p>
        <p>This link will expire in 24 hours.</p>
      `
    };

    // Output email content to console
    console.log('======= EMAIL CONTENT =======');
    console.log('To:', to);
    console.log('Subject:', mailOptions.subject);
    console.log('Body:', mailOptions.html);
    console.log('=============================');

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
}

// Function to send a generic email (can be used for other purposes)
async function sendEmail(mailOptions) {
  try {
    // Output email content to console
    console.log('======= EMAIL CONTENT =======');
    console.log('To:', mailOptions.to);
    console.log('Subject:', mailOptions.subject);
    console.log('Body:', mailOptions.html || mailOptions.text);
    console.log('=============================');

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

module.exports = {
  sendVerificationEmail,
  sendEmail
};