const express = require('express');
const db = require('../db');
const { sendVerificationEmail } = require('../services/emailService');
const { generateToken, generateExpirationTime } = require('../services/utils');
const router = express.Router();

function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    res.status(401).json({ error: 'Authentication required' });
  }
}

// User Registration
router.post('/register', async (req, res) => {
  const { username, email, password, first_name, last_name, phone } = req.body;

  if (!username || !email || !password || !first_name || !last_name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Check if user already exists
    const [existing] = await db.query('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Generate email verification token
    const verificationToken = generateToken();
    const tokenExpiration = generateExpirationTime(24); // 24 hours

    // Insert new user (plain text password as requested)
    const [result] = await db.query(
      'INSERT INTO users (username, email, password, first_name, last_name, phone, role, email_verification_token, email_verification_token_expires) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [username, email, password, first_name, last_name, phone || null, 'user', verificationToken, tokenExpiration]
    );
    
    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Note: We don't return an error to the user if email fails, as the registration itself succeeded
    }
    
    res.status(201).json({ success: true, message: 'User registered successfully. Please check your email to verify your account.', user_id: result.insertId });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// User Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username/email and password are required' });
  }

  try {
    // Check if user exists with either username or email
    const [users] = await db.query(
      'SELECT id, username, email, password, role, first_name, last_name, phone, is_active, is_email_verified FROM users WHERE (username = ? OR email = ?) AND is_active = TRUE',
      [username, username]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid username/email or password' });
    }

    const user = users[0];
    
    // Plain text password comparison (as requested)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid username/email or password' });
    }

    // Create session (allow login even if email is not verified)
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      is_email_verified: user.is_email_verified
    };

    res.json({ 
      success: true, 
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        is_email_verified: user.is_email_verified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// User Logout
router.post('/logout', requireAuth, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

// Get User Profile
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, username, email, first_name, last_name, phone, role, created_at, is_email_verified FROM users WHERE id = ?',
      [req.session.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update User Profile
router.put('/profile', requireAuth, async (req, res) => {
  const { first_name, last_name, phone } = req.body;
  const userId = req.session.user.id;

  try {
    await db.query(
      'UPDATE users SET first_name = ?, last_name = ?, phone = ? WHERE id = ?',
      [first_name, last_name, phone, userId]
    );

    // Update session data
    req.session.user.first_name = first_name;
    req.session.user.last_name = last_name;

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Session check endpoint
router.get('/check', async (req, res) => {
  if (req.session && req.session.user) {
    // Get updated user info from database to ensure we have latest data
    try {
      const [users] = await db.query(
        'SELECT id, username, email, first_name, last_name, phone, role, is_email_verified FROM users WHERE id = ? AND is_active = TRUE',
        [req.session.user.id]
      );
      
      if (users.length > 0) {
        const user = users[0];
        // Update session with latest info
        req.session.user = {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone,
          is_email_verified: user.is_email_verified
        };
        
        res.json({ 
          authenticated: true, 
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            first_name: user.first_name,
            last_name: user.last_name,
            phone: user.phone,
            is_email_verified: user.is_email_verified
          }
        });
      } else {
        // User not found or deactivated, destroy session
        req.session.destroy(() => {});
        res.json({ authenticated: false });
      }
    } catch (error) {
      console.error('Session check error:', error);
      res.json({ authenticated: false });
    }
  } else {
    res.json({ authenticated: false });
  }
});

// Email verification endpoint
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send('Missing verification token');
  }

  try {
    // Find user with this token
    const [users] = await db.query(
      'SELECT id, email, email_verification_token_expires FROM users WHERE email_verification_token = ? AND is_active = TRUE',
      [token]
    );

    if (users.length === 0) {
      return res.status(400).send('Invalid or expired verification token');
    }

    const user = users[0];

    // Check if token has expired
    const now = new Date();
    if (new Date(user.email_verification_token_expires) < now) {
      return res.status(400).send('Verification token has expired');
    }

    // Update user as verified and clear token
    await db.query(
      'UPDATE users SET is_email_verified = TRUE, email_verification_token = NULL, email_verification_token_expires = NULL WHERE id = ?',
      [user.id]
    );

    res.send('Email verified successfully! You can now log in to your account.');
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).send('Email verification failed');
  }
});

// Resend verification email endpoint
router.post('/send-verification-email', requireAuth, async (req, res) => {
  try {
    // Get user from database
    const [users] = await db.query(
      'SELECT id, email, is_email_verified FROM users WHERE id = ? AND is_active = TRUE',
      [req.session.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];

    // Check if email is already verified
    if (user.is_email_verified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    // Generate new verification token
    const verificationToken = generateToken();
    const tokenExpiration = generateExpirationTime(24); // 24 hours

    // Update user with new token (this will overwrite any existing token)
    await db.query(
      'UPDATE users SET email_verification_token = ?, email_verification_token_expires = ? WHERE id = ?',
      [verificationToken, tokenExpiration, user.id]
    );

    // Send verification email
    await sendVerificationEmail(user.email, verificationToken);

    res.json({ 
      success: true, 
      message: 'Verification email sent successfully! Please check your inbox.' 
    });
  } catch (error) {
    console.error('Resend verification email error:', error);
    res.status(500).json({ error: 'Failed to send verification email' });
  }
});

module.exports = router;