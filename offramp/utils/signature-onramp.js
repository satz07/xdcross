/**
 * Onramp.money Signature Generator
 * Matches Postman pre-script logic for onramp partner
 * 
 * Signature generation:
 * 1. Extract body from form-urlencoded or formdata
 * 2. Create object: { body, timestamp }
 * 3. Base64 encode JSON.stringify(obj)
 * 4. HMAC SHA512 with secret
 * 5. Headers: apiKey, payload, signature, timestamp
 */

const CryptoJS = require('crypto-js');

/**
 * Extract body from request (form-urlencoded or formdata)
 * @param {Object} req - Express request object
 * @returns {Object} Body object
 */
function extractBody(req) {
  // Check if body is already parsed (from express.urlencoded middleware)
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    return req.body;
  }
  
  // If body is empty, return empty object
  return {};
}

/**
 * Generate onramp signature
 * @param {Object} options - Configuration options
 * @param {Object} options.body - Request body (form data)
 * @param {string} options.secret - Secret key for signing
 * @returns {Object} Object with payload, signature, and timestamp
 */
function generateOnrampSignature({ body, secret }) {
  // Validate secret
  if (!secret || typeof secret !== 'string' || secret.trim() === '') {
    const errorMsg = `Secret key is required and must be a non-empty string. Received: ${typeof secret} - ${secret ? 'has value' : 'empty/undefined'}`;
    console.error('=== SIGNATURE GENERATION ERROR ===');
    console.error(errorMsg);
    console.error('Secret type:', typeof secret);
    console.error('Secret value:', secret ? '***SET***' : 'NOT SET');
    throw new Error(errorMsg);
  }
  
  try {
    // Generate timestamp
    const timestamp = Date.now().toString();
    
    // Create object with body and timestamp
    const obj = {
      body: body || {},
      timestamp
    };
    
    // Base64 encode JSON string
    const payload = CryptoJS.enc.Base64.stringify(
      CryptoJS.enc.Utf8.parse(JSON.stringify(obj))
    );
    
    // Generate HMAC SHA512 signature
    // CryptoJS.HmacSHA512 expects the secret as a string
    const signature = CryptoJS.enc.Hex.stringify(
      CryptoJS.HmacSHA512(payload, String(secret))
    );
    
    return {
      payload,
      signature,
      timestamp
    };
  } catch (error) {
    console.error('=== CRYPTOJS ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Secret type:', typeof secret);
    console.error('Secret length:', secret ? secret.length : 0);
    throw new Error(`Signature generation failed: ${error.message}`);
  }
}

/**
 * Generate headers for onramp API request
 * @param {Object} options - Configuration options
 * @param {string} options.apiKey - API key
 * @param {string} options.secret - Secret key
 * @param {Object} options.body - Request body
 * @returns {Object} Headers object
 */
function generateOnrampHeaders({ apiKey, secret, body }) {
  // Validate apiKey
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
    throw new Error('API key is required and must be a non-empty string');
  }
  
  // Validate secret (will throw if invalid)
  const { payload, signature, timestamp } = generateOnrampSignature({ body, secret });
  
  return {
    'apiKey': String(apiKey),
    'payload': payload,
    'signature': signature,
    'timestamp': timestamp
  };
}

module.exports = {
  generateOnrampSignature,
  generateOnrampHeaders,
  extractBody
};
