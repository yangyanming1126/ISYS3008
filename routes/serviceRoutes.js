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

// Get services with language support
router.get('/', async (req, res) => {
  const lang = req.query.lang || 'en';
  
  try {
    let query = 'SELECT id, price, image_url, is_active, created_at, updated_at';
    
    // Add language-specific fields
    if (lang === 'cn') {
      query += ', COALESCE(name_cn, name_en, name_ru) as localized_name, COALESCE(description_cn, description_en, description_ru) as localized_description, COALESCE(category_cn, category_en, category_ru) as localized_category';
      query += ', name_cn as name, description_cn as description, category_cn as category';
    } else if (lang === 'ru') {
      query += ', COALESCE(name_ru, name_en, name_cn) as localized_name, COALESCE(description_ru, description_en, description_cn) as localized_description, COALESCE(category_ru, category_en, category_cn) as localized_category';
      query += ', name_ru as name, description_ru as description, category_ru as category';
    } else {
      query += ', COALESCE(name_en, name_cn, name_ru) as localized_name, COALESCE(description_en, description_cn, description_ru) as localized_description, COALESCE(category_en, category_cn, category_ru) as localized_category';
      query += ', name_en as name, description_en as description, category_en as category';
    }
    
    query += ' FROM services WHERE is_active = TRUE ORDER BY COALESCE(category_en, category_cn, category_ru), COALESCE(name_en, name_cn, name_ru)';
    
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// Get single service with language support
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const lang = req.query.lang || 'en';
  
  try {
    let query = 'SELECT id, price, image_url, is_active, created_at, updated_at';
    
    if (lang === 'cn') {
      query += ', COALESCE(name_cn, name_en, name_ru) as localized_name, COALESCE(description_cn, description_en, description_ru) as localized_description, COALESCE(category_cn, category_en, category_ru) as localized_category';
      query += ', name_cn as name, description_cn as description, category_cn as category';
    } else if (lang === 'ru') {
      query += ', COALESCE(name_ru, name_en, name_cn) as localized_name, COALESCE(description_ru, description_en, description_cn) as localized_description, COALESCE(category_ru, category_en, category_cn) as localized_category';
      query += ', name_ru as name, description_ru as description, category_ru as category';
    } else {
      query += ', COALESCE(name_en, name_cn, name_ru) as localized_name, COALESCE(description_en, description_cn, description_ru) as localized_description, COALESCE(category_en, category_cn, category_ru) as localized_category';
      query += ', name_en as name, description_en as description, category_en as category';
    }
    
    query += ' FROM services WHERE id = ? AND is_active = TRUE';
    
    const [rows] = await db.query(query, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// Create service (Admin only)
router.post('/', requireAdmin, async (req, res) => {
  const { name_cn, name_en, name_ru, description_cn, description_en, description_ru, price, category_cn, category_en, category_ru, image_url } = req.body;

  if (!price || (!category_cn && !category_en && !category_ru)) {
    return res.status(400).json({ error: 'Missing required fields: price and at least one category field' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO services (name_cn, name_en, name_ru, description_cn, description_en, description_ru, price, category_cn, category_en, category_ru, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name_cn, name_en, name_ru, description_cn, description_en, description_ru, price, category_cn, category_en, category_ru, image_url]
    );
    
    res.status(201).json({ success: true, message: 'Service created successfully', service_id: result.insertId });
  } catch (error) {
    console.error('Service creation error:', error);
    res.status(500).json({ error: 'Failed to create service' });
  }
});

// Update service (Admin only)
router.put('/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { name_cn, name_en, name_ru, description_cn, description_en, description_ru, price, category_cn, category_en, category_ru, image_url } = req.body;

  try {
    const [result] = await db.query(
      'UPDATE services SET name_cn = ?, name_en = ?, name_ru = ?, description_cn = ?, description_en = ?, description_ru = ?, price = ?, category_cn = ?, category_en = ?, category_ru = ?, image_url = ? WHERE id = ?',
      [name_cn, name_en, name_ru, description_cn, description_en, description_ru, price, category_cn, category_en, category_ru, image_url, id]
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

// Delete service (Admin only - soft delete)
router.delete('/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  
  try {
    const [result] = await db.query('UPDATE services SET is_active = FALSE WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    res.json({ success: true, message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Service deletion error:', error);
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

module.exports = router;