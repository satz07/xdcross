/**
 * API Key authentication middleware.
 * Reads key from X-API-Key header or Authorization: Bearer <key>.
 * If API_KEYS env is set, requests without a valid key get 401.
 * If API_KEYS is not set, all requests pass (backward compatible).
 */

const { isAuthEnabled, isValidApiKey } = require('../config/api-keys');

function getApiKeyFromRequest(req) {
  const headerKey = req.get('X-API-Key') || req.get('x-api-key');
  if (headerKey) return headerKey;
  const auth = req.get('Authorization');
  if (auth && /^Bearer\s+/i.test(auth)) return auth.replace(/^Bearer\s+/i, '').trim();
  return null;
}

function apiKeyAuth(req, res, next) {
  if (!isAuthEnabled()) return next();

  const key = getApiKeyFromRequest(req);
  if (!key) {
    return res.status(401).json({
      error: {
        message: 'Missing API key. Send X-API-Key header or Authorization: Bearer <key>.',
        status: 401,
        code: 'MISSING_API_KEY'
      }
    });
  }
  if (!isValidApiKey(key)) {
    return res.status(401).json({
      error: {
        message: 'Invalid API key.',
        status: 401,
        code: 'INVALID_API_KEY'
      }
    });
  }
  req.apiKey = key;
  next();
}

module.exports = { apiKeyAuth, getApiKeyFromRequest };
