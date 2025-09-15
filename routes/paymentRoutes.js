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

// Admin authorization middleware
function requireAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Admin access required' });
  }
}

// Process virtual payment
router.post('/process', requireAuth, async (req, res) => {
  const { booking_id, payment_method } = req.body;
  
  if (!booking_id) {
    return res.status(400).json({ error: 'Booking ID is required' });
  }

  try {
    // Get booking details
    const [bookings] = await db.query(`
      SELECT b.*, s.price as service_price, COALESCE(s.name_en, s.name_cn, s.name_ru) as service_name 
      FROM bookings b 
      JOIN services s ON b.service_id = s.id 
      WHERE b.id = ? AND (b.user_id = ? OR ? = (SELECT role FROM users WHERE id = ?))
    `, [booking_id, req.session.user.id, 'admin', req.session.user.id]);
    
    if (bookings.length === 0) {
      return res.status(404).json({ error: 'Booking not found or access denied' });
    }
    
    const booking = bookings[0];
    
    // Check if already paid
    if (booking.payment_id) {
      return res.status(400).json({ error: 'Booking is already paid' });
    }
    
    // Generate virtual transaction ID
    const transactionId = `ST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create payment record
    const [paymentResult] = await db.query(
      'INSERT INTO payments (booking_id, amount, currency, payment_method, transaction_id, status, processed_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [booking_id, booking.service_price, 'AUD', payment_method || 'virtual', transactionId, 'completed']
    );
    
    // Update booking with payment_id
    await db.query(
      'UPDATE bookings SET payment_id = ?, status = ? WHERE id = ?',
      [paymentResult.insertId, 'confirmed', booking_id]
    );
    
    res.json({ 
      success: true, 
      message: 'Virtual payment processed successfully!',
      payment: {
        id: paymentResult.insertId,
        transaction_id: transactionId,
        amount: booking.service_price,
        currency: 'AUD',
        status: 'completed',
        service_name: booking.service_name
      }
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

// Get payment details
router.get('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  
  try {
    const [payments] = await db.query(`
      SELECT p.*, b.name as customer_name, COALESCE(s.name_en, s.name_cn, s.name_ru) as service_name
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN services s ON b.service_id = s.id
      WHERE p.id = ? AND (b.user_id = ? OR ? = (SELECT role FROM users WHERE id = ?))
    `, [id, req.session.user.id, 'admin', req.session.user.id]);
    
    if (payments.length === 0) {
      return res.status(404).json({ error: 'Payment not found or access denied' });
    }
    
    res.json(payments[0]);
  } catch (error) {
    console.error('Payment fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch payment details' });
  }
});

module.exports = router;