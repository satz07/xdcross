/**
 * Signature Generation Utility
 * Matches Postman pre-script logic with correct secret encoding handling
 * Supports base64url, base64, and UTF-8 secret formats
 */

const CryptoJS = require('crypto-js');

/**
 * Convert secret string to WordArray based on encoding format
 * @param {string} secret - Secret key
 * @param {string} format - Encoding format: 'utf8', 'hex', 'base64', 'base64url'
 * @returns {Object} CryptoJS WordArray
 */
function toWordArrayFromSecret(secret, format = 'utf8') {
  if (format === 'hex') return CryptoJS.enc.Hex.parse(secret);
  
  if (format === 'base64' || format === 'base64url') {
    // Normalize base64url -> base64
    let s = secret;
    if (format === 'base64url') {
      s = s.replace(/-/g, '+').replace(/_/g, '/');
    }
    // Pad
    const pad = s.length % 4;
    if (pad) s = s + '='.repeat(4 - pad);
    return CryptoJS.enc.Base64.parse(s);
  }
  
  return CryptoJS.enc.Utf8.parse(secret);
}

/**
 * Strip signature placeholder from query string
 * @param {string} qs - Query string
 * @returns {string} Query string without signature placeholder
 */
function stripSigPlaceholder(qs) {
  let s = qs.replace(/&signature=\{\{sign\}\}(?=(&|$))/g, '');
  s = s.replace(/^signature=\{\{sign\}\}&/, '');
  s = s.replace(/^signature=\{\{sign\}\}$/, '');
  if (s.endsWith('&')) s = s.slice(0, -1);
  return s;
}

/**
 * Build string to sign from URL
 * @param {string} fullUrl - Full URL with query string
 * @param {string} timestamp - Timestamp to replace {{timestamp}}
 * @param {string} includePath - Optional path to include (e.g., "openapi/convert/v1/get-quote")
 * @returns {string} String to sign
 */
function buildStringToSign(fullUrl, timestamp, includePath = '') {
  const qIndex = fullUrl.indexOf('?');
  const param = qIndex >= 0 ? fullUrl.slice(qIndex + 1) : '';
  
  let qs = param.replace('{{timestamp}}', timestamp);
  qs = stripSigPlaceholder(qs);
  
  return includePath ? `${includePath}?${qs}` : qs;
}

/**
 * Generate HMAC SHA256 signature in hex format
 * @param {string} message - Message to sign
 * @param {Object} secretWordArray - Secret as CryptoJS WordArray
 * @returns {string} Hexadecimal signature
 */
function hmacSha256Hex(message, secretWordArray) {
  const mac = CryptoJS.HmacSHA256(message, secretWordArray);
  return CryptoJS.enc.Hex.stringify(mac); // lower-case hex
}

/**
 * Generate signature with automatic secret encoding detection
 * Tries base64url, base64, then UTF-8
 * @param {Object} options - Configuration options
 * @param {string} options.url - Full URL with query string
 * @param {string} options.timestamp - Timestamp to use
 * @param {string} options.secret - Secret key
 * @param {string} options.includePath - Optional path to include in signature
 * @param {string} options.secretFormat - Force secret format: 'base64url', 'base64', 'utf8', or 'auto' (default)
 * @returns {Object} Object with stringToSign, signature, and format used
 */
function generateSignature({
  url,
  timestamp,
  secret,
  includePath = '',
  secretFormat = 'auto'
}) {
  const toSign = buildStringToSign(url, timestamp, includePath);
  
  // If format is specified, use it; otherwise try all
  const formats = secretFormat === 'auto' 
    ? ['base64url', 'base64', 'utf8']
    : [secretFormat];
  
  const candidates = formats.map(format => ({
    name: format,
    key: toWordArrayFromSecret(secret, format)
  }));
  
  // Generate signature for each format
  const results = candidates.map(c => ({
    format: c.name,
    stringToSign: toSign,
    signature: hmacSha256Hex(toSign, c.key)
  }));
  
  // Return the first result (or all if auto-detecting)
  if (secretFormat !== 'auto' || results.length === 1) {
    return {
      stringToSign: toSign,
      signature: results[0].signature,
      format: results[0].format
    };
  }
  
  // Return all results for comparison
  return {
    stringToSign: toSign,
    results: results,
    signature: results[0].signature, // Default to first
    format: results[0].format
  };
}

/**
 * Build signed query string (matching Postman pre-script)
 * @param {string} url - Full URL with query string
 * @param {string} secret - Secret key for signing
 * @param {string} includePath - Optional path to include in signature
 * @param {string} secretFormat - Secret encoding format ('auto', 'base64url', 'base64', 'utf8')
 * @returns {Object} Object with query string, timestamp, signature, and format
 */
const buildSignedQueryString = (url, secret, includePath = '', secretFormat = 'auto') => {
  // Generate timestamp (matching: let timestamp = new Date().getTime().toString();)
  const timestamp = new Date().getTime().toString();
  
  // Generate signature with automatic format detection
  const result = generateSignature({ url, timestamp, secret, includePath, secretFormat });
  
  // Get the final query string (without signature placeholder)
  const finalQueryString = result.stringToSign;
  
  return {
    queryString: finalQueryString,
    timestamp,
    signature: result.signature,
    format: result.format,
    allFormats: result.results || [result]
  };
};

module.exports = {
  generateSignature,
  buildSignedQueryString,
  toWordArrayFromSecret,
  stripSigPlaceholder,
  buildStringToSign
};
