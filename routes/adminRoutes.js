const express = require('express');
const db = require('../db');
const router = express.Router();

// Admin authorization middleware
function requireAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Admin access required' });
  }
}

// Create admin user (Admin only)
router.post('/users', requireAdmin, async (req, res) => {
  const { username, email, password, first_name, last_name, phone, role } = req.body;
  
  if (!username || !email || !password || !first_name || !last_name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Check if user already exists
    const [existing] = await db.query('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    const [result] = await db.query(
      'INSERT INTO users (username, email, password, first_name, last_name, phone, role, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [username, email, password, first_name, last_name, phone || null, role || 'user', req.session.user.id]
    );
    
    res.status(201).json({ success: true, message: 'User created successfully', user_id: result.insertId });
  } catch (error) {
    console.error('User creation error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Get all users (Admin only)
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT id, username, email, first_name, last_name, phone, role, is_active, created_at,
             (SELECT username FROM users u2 WHERE u2.id = users.created_by) as created_by_username
      FROM users 
      ORDER BY created_at DESC
    `);
    
    res.json(users);
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user (Admin only)
router.put('/users/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { username, email, first_name, last_name, phone, role, is_active } = req.body;
  
  try {
    const [result] = await db.query(
      'UPDATE users SET username = ?, email = ?, first_name = ?, last_name = ?, phone = ?, role = ?, is_active = ? WHERE id = ?',
      [username, email, first_name, last_name, phone, role, is_active, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    console.error('User update error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Deactivate user (Admin only)
router.delete('/users/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  
  // Prevent admin from deactivating themselves
  if (parseInt(id) === req.session.user.id) {
    return res.status(400).json({ error: 'Cannot deactivate your own account' });
  }
  
  try {
    const [result] = await db.query('UPDATE users SET is_active = FALSE WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ success: true, message: 'User deactivated successfully' });
  } catch (error) {
    console.error('User deactivation error:', error);
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
});

// Get all bookings (Admin only)
router.get('/bookings', requireAdmin, async (req, res) => {
  try {
    const [bookings] = await db.query(`
      SELECT b.*, u.username, u.first_name, u.last_name, u.email,
             COALESCE(s.name_en, s.name_cn, s.name_ru) as service_name, s.price as service_price,
             p.payment_method
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN payments p ON b.payment_id = p.id
      WHERE b.is_active = TRUE
      ORDER BY b.created_at DESC
    `);
    
    res.json(bookings);
  } catch (error) {
    console.error('Fetch bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Update booking status (Admin only)
router.put('/bookings/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  
  try {
    const [result] = await db.query(
      'UPDATE bookings SET status = ?, admin_notes = ? WHERE id = ?',
      [status, notes || null, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json({ success: true, message: 'Booking updated successfully' });
  } catch (error) {
    console.error('Booking update error:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// Approve pending booking (Admin only)
router.post('/bookings/:id/approve', requireAdmin, async (req, res) => {
  const { id } = req.params;
  
  try {
    // First, check if the booking is in pending status
    const [bookings] = await db.query('SELECT * FROM bookings WHERE id = ? AND status = ?', [id, 'pending']);
    
    if (bookings.length === 0) {
      return res.status(404).json({ error: 'Pending booking not found' });
    }
    
    // Update booking status to confirmed
    const [result] = await db.query(
      'UPDATE bookings SET status = ? WHERE id = ?',
      ['confirmed', id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json({ success: true, message: 'Booking approved successfully' });
  } catch (error) {
    console.error('Booking approval error:', error);
    res.status(500).json({ error: 'Failed to approve booking' });
  }
});

// Reject pending booking (Admin only)
router.post('/bookings/:id/reject', requireAdmin, async (req, res) => {
  const { id } = req.params;
  
  try {
    // First, check if the booking is in pending status
    const [bookings] = await db.query('SELECT * FROM bookings WHERE id = ? AND status = ?', [id, 'pending']);
    
    if (bookings.length === 0) {
      return res.status(404).json({ error: 'Pending booking not found' });
    }
    
    // Update booking status to refunded
    const [result] = await db.query(
      'UPDATE bookings SET status = ? WHERE id = ?',
      ['refunded', id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json({ success: true, message: 'Booking rejected successfully' });
  } catch (error) {
    console.error('Booking rejection error:', error);
    res.status(500).json({ error: 'Failed to reject booking' });
  }
});

// Complete confirmed booking (Admin only)
router.post('/bookings/:id/complete', requireAdmin, async (req, res) => {
  const { id } = req.params;
  
  try {
    // First, check if the booking is in confirmed status
    const [bookings] = await db.query('SELECT * FROM bookings WHERE id = ? AND status = ?', [id, 'confirmed']);
    
    if (bookings.length === 0) {
      return res.status(404).json({ error: 'Confirmed booking not found' });
    }
    
    // Update booking status to completed
    const [result] = await db.query(
      'UPDATE bookings SET status = ? WHERE id = ?',
      ['completed', id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json({ success: true, message: 'Booking marked as completed successfully' });
  } catch (error) {
    console.error('Booking completion error:', error);
    res.status(500).json({ error: 'Failed to mark booking as completed' });
  }
});

// Get all services (Admin only)
router.get('/services', requireAdmin, async (req, res) => {
  try {
    const [services] = await db.query(`
      SELECT s.*, 
             COALESCE(s.name_en, s.name_cn, s.name_ru) as display_name,
             COALESCE(s.category_en, s.category_cn, s.category_ru) as display_category,
             COALESCE(s.description_en, s.description_cn, s.description_ru) as display_description,
             (SELECT COUNT(*) FROM bookings WHERE service_id = s.id) as booking_count
      FROM services s
      ORDER BY s.created_at DESC
    `);
    
    res.json(services);
  } catch (error) {
    console.error('Fetch services error:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// Create service (Admin only)
router.post('/services', requireAdmin, async (req, res) => {
  const { name_en, name_cn, name_ru, description_en, description_cn, description_ru, price, category_en, category_cn, category_ru, image_url, is_active } = req.body;
  
  if (!name_en || !description_en || !price) {
    return res.status(400).json({ error: 'Missing required fields (name_en, description_en, price)' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO services (name_en, name_cn, name_ru, description_en, description_cn, description_ru, price, category_en, category_cn, category_ru, image_url, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name_en, name_cn || null, name_ru || null, description_en, description_cn || null, description_ru || null, price, category_en || null, category_cn || null, category_ru || null, image_url || null, is_active !== false]
    );
    
    res.status(201).json({ success: true, message: 'Service created successfully', service_id: result.insertId });
  } catch (error) {
    console.error('Service creation error:', error);
    res.status(500).json({ error: 'Failed to create service' });
  }
});

// Update service (Admin only)
router.put('/services/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { name_en, name_cn, name_ru, description_en, description_cn, description_ru, price, category_en, category_cn, category_ru, image_url, is_active } = req.body;
  
  try {
    const [result] = await db.query(
      'UPDATE services SET name_en = ?, name_cn = ?, name_ru = ?, description_en = ?, description_cn = ?, description_ru = ?, price = ?, category_en = ?, category_cn = ?, category_ru = ?, image_url = ?, is_active = ? WHERE id = ?',
      [name_en, name_cn, name_ru, description_en, description_cn, description_ru, price, category_en, category_cn, category_ru, image_url, is_active, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    res.json({ success: true, message: 'Service updated successfully' });
  } catch (error) {
    console.error('Service update error:', error);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

// Deactivate service (Admin only)
router.delete('/services/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  
  try {
    const [result] = await db.query('UPDATE services SET is_active = FALSE WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    res.json({ success: true, message: 'Service deactivated successfully' });
  } catch (error) {
    console.error('Service deactivation error:', error);
    res.status(500).json({ error: 'Failed to deactivate service' });
  }
});

// Permanently delete service (Admin only)
router.delete('/services/:id/permanent', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    // First check if there are any active bookings for this service
    const [bookings] = await db.query(
      'SELECT COUNT(*) as count FROM bookings WHERE service_id = ? AND is_active = TRUE', 
      [id]
    );
    
    if (bookings[0].count > 0) {
      return res.status(409).json({ 
        error: 'Cannot delete service with existing active bookings. Please deactivate it instead.' 
      });
    }
    
    // If no active bookings, proceed with deletion
    const [result] = await db.query('DELETE FROM services WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json({ success: true, message: 'Service deleted permanently' });
  } catch (error) {
    // MySQL FK constraint error (ER_ROW_IS_REFERENCED_2)
    if (error && (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451)) {
      return res.status(409).json({ error: 'Cannot delete service with existing bookings. Please deactivate it instead.' });
    }
    console.error('Service permanent deletion error:', error);
    res.status(500).json({ error: 'Failed to delete service permanently' });
  }
});

// Permanently delete user (Admin only)
router.delete('/users/:id/permanent', requireAdmin, async (req, res) => {
  const { id } = req.params;

  // Prevent admin from deleting themselves
  if (parseInt(id) === req.session.user.id) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }

  try {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('User deletion error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Delete booking (soft delete - Admin only)
router.delete('/bookings/:id', requireAdmin, async (req, res) => {
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

module.exports = router;