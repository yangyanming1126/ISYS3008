const express = require('express');
const cors = require('cors');
const db = require('./db');
const app = express();
const path = require('path');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// 获取服务列表
app.get('/api/services', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM services');
    res.json(rows);
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// 接收预约提交
app.post('/api/bookings', async (req, res) => {
  const { name, phone, date, service_id } = req.body;

  if (!name || !phone || !date || !service_id) {
    return res.status(400).json({ error: 'Missing booking information' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO bookings (name, phone, date, service_id) VALUES (?, ?, ?, ?)',
      [name, phone, date, service_id]
    );
    res.status(201).json({ success: true, message: 'Booking created', id: result.insertId });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 监听端口
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

