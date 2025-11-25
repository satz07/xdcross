const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const coinsRoutes = require('./routes/coins');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());

// Body parser middleware - CRITICAL for JSON requests
// Use verify option to capture raw body for cash-out signature
app.use(express.json({ 
  limit: '1mb',
  verify: (req, res, buf) => {
    // Capture raw body before parsing (needed for cash-out signature generation)
    // This preserves the exact format from the client
    if (req.path && req.path.includes('cash-out')) {
      req.rawBody = buf.toString('utf8');
    }
  }
}));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// Debug middleware - Log what actually arrives at server (after body parsing)
app.use((req, res, next) => {
  console.log('');
  console.log('=== INCOMING REQUEST (Server View) ===');
  console.log('Method:', req.method);
  console.log('Original URL:', req.originalUrl);
  console.log('Path:', req.path);
  console.log('Query (parsed):', req.query);
  console.log('Query String (raw):', req.originalUrl.includes('?') ? req.originalUrl.substring(req.originalUrl.indexOf('?') + 1) : '');
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body (parsed):', req.body);
  console.log('Protocol:', req.protocol);
  console.log('Host:', req.get('host'));
  console.log('========================');
  console.log('');
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/', limiter); // Apply to all routes

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Partner API routes - dynamic partner ID from URL path
// URL format: /{partnerId}/get-quote, /{partnerId}/accept-quote, etc.
app.use('/:partnerId', coinsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API Routes: http://localhost:${PORT}/{partnerId}/...`);
  console.log(`Example: http://localhost:${PORT}/id0001/get-quote`);
});

module.exports = app;

