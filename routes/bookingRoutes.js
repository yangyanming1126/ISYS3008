const express = require('express');
const db = require('../db');
const router = express.Router();

// Authentication middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    res.status(401).json({ error: 'Authentication required' });
  }
}

// Email verification middleware
async function requireVerifiedEmail(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Check if user's email is verified
  if (!req.session.user.is_email_verified) {
    return res.status(403).json({ error: 'Please verify your email address before making bookings' });
  }

  next();
}

// Admin authorization middleware
function requireAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Admin access required' });
  }
}

// Create booking (supports both logged-in users and guests)
router.post('/', requireVerifiedEmail, async (req, res) => {
  const { name, phone, date, service_id, notes } = req.body;
  const user_id = req.session.user ? req.session.user.id : null;

  if (!name || !phone || !date || !service_id) {
    return res.status(400).json({ error: 'Missing booking information' });
  }

  // Date validation - ensure MM/DD/YYYY format is handled properly
  const bookingDate = new Date(date);
  if (isNaN(bookingDate.getTime())) {
    return res.status(400).json({ error: 'Invalid date format. Please use MM/DD/YYYY' });
  }

  try {
    // Check if service exists
    const [services] = await db.query('SELECT id, price FROM services WHERE id = ? AND is_active = TRUE', [service_id]);
    if (services.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const [result] = await db.query(
      'INSERT INTO bookings (user_id, name, phone, date, service_id, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user_id, name, phone, date, service_id, notes || null, 'pending']
    );
    
    res.status(201).json({ 
      success: true, 
      message: 'Booking created successfully', 
      booking_id: result.insertId,
      service_price: services[0].price
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Get user's bookings (requires authentication)
router.get('/my', requireAuth, async (req, res) => {
  try {
    const [bookings] = await db.query(`
      SELECT b.*, s.name_en as service_name_en, s.name_cn as service_name_cn, s.name_ru as service_name_ru, 
             s.price as service_price, s.category_en as category_en, s.category_cn as category_cn, s.category_ru as category_ru,
             p.amount as paid_amount, p.status as payment_status, p.transaction_id
      FROM bookings b 
      JOIN services s ON b.service_id = s.id 
      LEFT JOIN payments p ON b.payment_id = p.id
      WHERE b.user_id = ? AND b.is_active = TRUE
      ORDER BY b.date DESC, b.created_at DESC
    `, [req.session.user.id]);
    
    res.json(bookings);
  } catch (error) {
    console.error('Fetch bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get all bookings (Admin only)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const [bookings] = await db.query(`
      SELECT b.*, u.username, u.email as user_email, COALESCE(s.name_en, s.name_cn, s.name_ru) as service_name, 
             s.price as service_price, COALESCE(s.category_en, s.category_cn, s.category_ru) as category,
             p.amount as paid_amount, p.status as payment_status, p.transaction_id
      FROM bookings b 
      LEFT JOIN users u ON b.user_id = u.id
      JOIN services s ON b.service_id = s.id 
      LEFT JOIN payments p ON b.payment_id = p.id
      WHERE b.is_active = TRUE
      ORDER BY b.date DESC, b.created_at DESC
    `);
    
    res.json(bookings);
  } catch (error) {
    console.error('Fetch admin bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Update booking status (Admin only)
router.put('/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  
  const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed', 'refunded'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const [result] = await db.query(
      'UPDATE bookings SET status = ?, notes = ? WHERE id = ?',
      [status, notes || null, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json({ success: true, message: 'Booking status updated successfully' });
  } catch (error) {
    console.error('Booking update error:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// Delete booking (soft delete - Admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  
  try {
    // Soft delete: set is_active to FALSE
    const [result] = await db.query(
      'UPDATE bookings SET is_active = FALSE WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json({ success: true, message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Booking deletion error:', error);
    res.status(500).json({ error: 'Failed to delete booking' });
  }
});

// Checkout at the counter (Update booking status for counter payment)
router.post('/:id/counter-checkout', requireAuth, async (req, res) => {
  const { id } = req.params;
  
  try {
    // Update booking status to 'confirmed' for counter checkout
    const [result] = await db.query(
      'UPDATE bookings SET status = ? WHERE id = ? AND (user_id = ? OR ? = (SELECT role FROM users WHERE id = ?))',
      ['confirmed', id, req.session.user.id, 'admin', req.session.user.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Booking not found or access denied' });
    }
    
    res.json({ success: true, message: 'Booking confirmed for counter checkout' });
  } catch (error) {
    console.error('Counter checkout error:', error);
    res.status(500).json({ error: 'Failed to process counter checkout' });
  }
});

module.exports = router;