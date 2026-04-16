const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const coinsRoutes = require('./routes/coins');
const onrampRoutes = require('./routes/onramp');
const virgopayRoutes = require('./routes/virgopay');
const { apiKeyAuth } = require('./middleware/api-key-auth');
const { isAuthEnabled } = require('./config/api-keys');

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
app.use('/api/', limiter);

// API key authentication (optional: set API_KEYS env to enable)
app.use('/api', apiKeyAuth);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Partner API routes - partner ID via ref_id (query or body), not in URL path
// URL format: /api/get-quote?ref_id=id0001&..., /api/onramp/quote with ref_id in body, etc.
app.use('/api', (req, res, next) => {
  req.partnerId = req.query.ref_id || (req.body && req.body.ref_id);
  if (req.partnerId) {
    console.log('ref_id (partner) from request:', req.partnerId);
  }
  next();
});
app.use('/api', coinsRoutes);
app.use('/api', onrampRoutes);
app.use('/api', virgopayRoutes);

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
  console.log(`API auth: ${isAuthEnabled() ? 'ON (API_KEYS set)' : 'OFF (set API_KEYS to require API key)'}`);
  console.log(`API Routes: http://localhost:${PORT}/api/... (use ref_id in query or body)`);
  console.log(`Example: http://localhost:${PORT}/api/get-quote?ref_id=id0001&sourceCurrency=XDC&targetCurrency=PHP&sourceAmount=50`);
});

module.exports = app;

