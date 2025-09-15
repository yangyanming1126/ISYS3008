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
             COALESCE(s.name_en, s.name_cn, s.name_ru) as service_name, s.price as service_price
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN services s ON b.service_id = s.id
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

// Get all services (Admin only)
router.get('/services', requireAdmin, async (req, res) => {
  try {
    const [services] = await db.query(`
      SELECT s.*, 
             COALESCE(s.name_en, s.name_cn, s.name_ru) as display_name,
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

module.exports = router;