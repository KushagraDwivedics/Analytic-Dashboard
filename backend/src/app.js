const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const errorHandler = require('./middleware/error.middleware');
const { initDB, db } = require('./db/database');
const storageService = require('./services/storage.service');

// Load environment variables
dotenv.config();

// Ensure SQLite tables are initialized
initDB();

const app = express();

// Middlewares
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : 'http://localhost:5173';
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.text({ type: ['text/csv', 'application/xml', 'text/xml'], limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const ingestRoutes = require('./routes/ingest.routes');
const analyticsRoutes = require('./routes/analytics.routes');

// Health-check endpoint
app.get('/api/health', (req, res) => {
  try {
    const stats = storageService.getDatabaseStats();
    res.json({
      success: true,
      message: 'Order Analytics API is running',
      environment: process.env.NODE_ENV || 'development',
      stats
    });
  } catch (e) {
    res.json({
      success: true,
      message: 'Order Analytics API is running',
      error: e.message
    });
  }
});

// Mount Routes
app.use('/api/ingest', ingestRoutes);
app.use('/api/analytics', analyticsRoutes);

// Centralized error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Auto-seed baseline data if database is empty
try {
  const shouldSeed = process.env.AUTO_SEED === undefined ? true : process.env.AUTO_SEED === 'true';
  const currentOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
  if (currentOrders === 0 && shouldSeed) {
    console.log('[Bootstrap] No existing orders found in database. Seeding initial dataset...');
    storageService.saveNormalizedData().catch(err => {
      console.warn('[Bootstrap] Auto-seed warning:', err.message);
    });
  }
} catch (e) {
  console.warn('[Bootstrap] DB check notice:', e.message);
}

app.listen(PORT, () => {
  console.log(`Order Analytics Backend running on http://localhost:${PORT}`);
});

module.exports = app;
