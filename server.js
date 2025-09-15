const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const app = express();

// Import route modules
const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Direct configuration (no dotenv needed)
const SESSION_SECRET = 'sleepy-tiger-secret-key-2024';
const PORT = 3000;

// Middleware
app.use(cors({
  origin: true, // Allow all origins for development
  credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// ====================================
// SERVER STARTUP
// ====================================
app.listen(PORT, () => {
  console.log(`Website: http://localhost:${PORT}`);
  console.log('Default admin credentials: admin / admin123');
});