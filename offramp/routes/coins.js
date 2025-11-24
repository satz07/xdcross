/**
 * Coins.ph API Routes
 * Wraps Coins.ph API with signature generation
 */

const express = require('express');
const router = express.Router({ mergeParams: true }); // Enable route params from parent route
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { getPartner } = require('../config/partners');
// Signature generation is done inline using CryptoJS to match Postman pre-script exactly

const QUOTE_DATA_FILE = path.join(process.cwd(), '.quote-data.json');

/**
 * Get partner configuration from request
 * Extracts partner ID dynamically from URL path: /api/{partnerId}/...
 */
function getPartnerFromRequest(req) {
  // Extract partner ID directly from URL path
  // URL format: /api/id0001/get-quote -> extract 'id0001'
  // Try multiple sources to extract partnerId from URL
  console.log("req-------------", req.params);
  let partnerId = req.params.partnerId;
  
  // If not in params, extract directly from URL path
  if (!partnerId) {
    // Extract from req.path or req.originalUrl
    // Format: /api/id0001/get-quote or /id0001/get-quote
    const urlPath = req.path || req.originalUrl || '';
    const pathParts = urlPath.split('/').filter(part => part); // Remove empty parts
    
    // Find partnerId - it should be after 'api' or be the first part
    const apiIndex = pathParts.indexOf('api');
    if (apiIndex >= 0 && pathParts[apiIndex + 1]) {
      partnerId = pathParts[apiIndex + 1];
    } else if (pathParts.length > 0) {
      // If no 'api' found, take first part
      partnerId = pathParts[0];
    }
  }
  
  if (!partnerId) {
    throw new Error('Partner ID not found in URL path. Expected format: /api/{partnerId}/endpoint');
  }
  
  const partner = getPartner(partnerId);
  
  if (!partner) {
    throw new Error(`Partner '${partnerId}' not found or not configured`);
  }
  
  console.log('Partner ID extracted from URL:', partnerId);
  console.log('Partner config:', { name: partner.name, baseUrl: partner.baseUrl });
  
  return partner;
}

// Helper function to save quote data (timestamp and signature)
function saveQuoteData(timestamp, signature) {
  try {
    const data = { timestamp, signature };
    fs.writeFileSync(QUOTE_DATA_FILE, JSON.stringify(data, null, 2));
    console.log('Saved quote data:', data);
  } catch (error) {
    console.error('Error saving quote data:', error);
  }
}

// Helper function to load quote data
function loadQuoteData() {
  try {
    if (fs.existsSync(QUOTE_DATA_FILE)) {
      const data = fs.readFileSync(QUOTE_DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading quote data:', error);
  }
  return null;
}

/**
 * Get Quote - Partner API
 * POST /api/{partnerId}/get-quote
 * 
 * Signature generation matches Postman pre-script exactly:
 * 1. Get query string from URL
 * 2. Replace {{timestamp}} with actual timestamp
 * 3. Remove &signature={{sign}} placeholder
 * 4. Generate HMAC SHA256 signature
 * 5. Add signature to request
 */
router.post('/get-quote', async (req, res) => {
  try {
    // Get partner configuration (abstracts partner details from user)
    const partner = getPartnerFromRequest(req);
    const apiKey = partner.apiKey;
    const secret = partner.secret;
    const baseUrl = partner.baseUrl;

    // Get the full URL with query string
    const urlWithQuery = req.originalUrl || req.url;
    const fullUrl = `${req.protocol}://${req.get('host')}${urlWithQuery}`;
    
    // EXACT MATCH TO POSTMAN PRE-SCRIPT:
    // let path = "openapi/convert/v1/get-quote";
    const path = "openapi/convert/v1/get-quote";
    
    // let timestamp = new Date().getTime().toString();
    // Use server time - if there's a time sync issue, this will help
    // For time sync issues, you can add an offset: new Date().getTime() + offset
    const timestamp = new Date().getTime().toString();
    
    // Log time sync info for debugging
    const serverTime = Date.now();
    console.log('=== TIME SYNC CHECK ===');
    console.log('Server time (ms):', serverTime);
    console.log('Timestamp used:', timestamp);
    console.log('Time difference:', serverTime - parseInt(timestamp), 'ms');
    console.log('========================');
    
    // pm.environment.set("path",path)
    // pm.environment.set("timestamp",timestamp);
    
    // let bodyJson = request;
    const bodyJson = {
      id: req.body?.id || 'request-id',
      name: 'get-quote',
      description: req.body?.description,
      headers: req.headers,
      method: req.method,
      url: fullUrl,
      data: req.body || {}
    };
    console.log("bodyJson", bodyJson);
    
    // Build string to sign - CRITICAL: Must match exactly what server expects
    // Extract query string from original URL (what server actually sees)
    const queryStartIndex = fullUrl.indexOf('?');
    let param = queryStartIndex >= 0 
      ? fullUrl.substring(queryStartIndex + 1, fullUrl.length) 
      : '';
    
    // Also try from req.originalUrl directly (what Express sees)
    const expressQueryString = req.originalUrl.includes('?') 
      ? req.originalUrl.substring(req.originalUrl.indexOf('?') + 1)
      : '';
    
    console.log('=== SIGNATURE STRING BUILDING ===');
    console.log('Full URL:', fullUrl);
    console.log('Query from fullUrl:', param);
    console.log('Query from req.originalUrl:', expressQueryString);
    console.log('req.query (parsed):', req.query);
    
    // Use the query string from the URL (not parsed req.query, as order matters!)
    let str = param || expressQueryString;
    
    // str = param.replace("{{timestamp}}",pm.environment.get("timestamp"));
    str = str.replace("{{timestamp}}", timestamp);
    
    // str = str.replace("&signature={{sign}}","");
    str = str.replace("&signature={{sign}}", "");
    str = str.replace("signature={{sign}}", ""); // Also handle if it's first param
    
    // Remove recvWindow if present (MUST be removed before adding timestamp)
    // Original Postman had recvWindow=null, but Coins.ph rejects it - remove completely
    // Try multiple patterns to ensure it's removed
    str = str.replace(/[&?]recvWindow=[^&]*/g, '');
    str = str.replace(/recvWindow=[^&]*&?/g, '');
    str = str.replace(/&recvWindow=[^&]*/g, '');
    str = str.replace(/\?recvWindow=[^&]*/g, '?');
    // Clean up any double ampersands or question marks that might result
    str = str.replace(/&&+/g, '&').replace(/\?\?+/g, '?').replace(/^&|&$/g, '').replace(/^\?|\?$/g, '');
    
    // If timestamp wasn't in the original query string, add it
    if (!str.includes('timestamp=')) {
      str = str ? `${str}&timestamp=${timestamp}` : `timestamp=${timestamp}`;
    }
    
    // Add recvWindow to allow for time sync differences (in milliseconds)
    // Default: 60000ms (60 seconds) - adjust if needed for your server
    // The error says timestamp is outside recv window, so we need to add this
    const recvWindow = process.env.RECV_WINDOW || '60000'; // 60 seconds default
    if (!str.includes('recvWindow=')) {
      str = str ? `${str}&recvWindow=${recvWindow}` : `recvWindow=${recvWindow}`;
    }
    
    // Remove signature if it exists (we'll add it after signing)
    str = str.replace(/[&?]signature=[^&]*/g, '');
    // Clean up any double ampersands
    str = str.replace(/&&+/g, '&').replace(/^&|&$/g, '');
    
    console.log("String to sign (final):", str);
    console.log("Contains recvWindow:", str.includes('recvWindow'));
    console.log("Time check - Server time:", new Date().toISOString());
    console.log("Time check - Timestamp used:", timestamp);
    console.log("Time check - Difference:", Math.abs(Date.now() - parseInt(timestamp)), "ms");
    console.log("==================================");

    // MATCHING POSTMAN PRE-SCRIPT:
    // let signature = CryptoJS.HmacSHA256(str,pm.environment.get("secret"));
    // signature = CryptoJS.enc.Hex.stringify(signature);
    const CryptoJS = require('crypto-js');
    
    // Verify signature generation
    console.log('=== SIGNATURE GENERATION ===');
    console.log('String to sign:', str);
    console.log('Secret length:', secret ? secret.length : 0);
    
    let signature = CryptoJS.HmacSHA256(str, secret);
    signature = CryptoJS.enc.Hex.stringify(signature);
    
    // Verify by regenerating
    const verifySig = CryptoJS.enc.Hex.stringify(CryptoJS.HmacSHA256(str, secret));
    console.log('Generated signature:', signature);
    console.log('Verification match:', signature === verifySig);
    console.log('================================');

    // Build final URL with signature (using partner's base URL)
    const finalQueryString = str ? `${str}&signature=${signature}` : `signature=${signature}`;
    const url = `${baseUrl}/openapi/convert/v1/get-quote?${finalQueryString}`;

    // Log the final request
    console.log('');
    console.log('=== FINAL REQUEST ===');
    console.log('Final URL:', url);
    console.log('Request Headers:', JSON.stringify({
      'X-COINS-APIKEY': apiKey
    }, null, 2));
    console.log('==================================================');
    console.log('');
    
    // Generate exact curl command for testing on different server
    const curlCommand = `curl -X POST \\
  -H "X-COINS-APIKEY: ${apiKey}" \\
  
  "${url}"`; 
    console.log('=== EXACT CURL COMMAND (for testing) ===');
    console.log(curlCommand);
    console.log('');
    console.log('=== SINGLE LINE CURL (copy-paste ready) ===');
    console.log(`curl -X POST -H "X-COINS-APIKEY: ${apiKey}" "${url}"`);
    console.log('==========================================');
    console.log('');

    // Make request to partner API (matching axios config)
    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: url,
      headers: {
        'X-COINS-APIKEY': apiKey
      },
      timeout: 30000
    };

    // Log request details before sending
    console.log('=== AXIOS REQUEST CONFIG ===');
    console.log('Method:', config.method);
    console.log('URL:', config.url);
    console.log('Headers:', JSON.stringify(config.headers, null, 2));
    console.log('Has body:', !!config.data);
    console.log('Server time:', new Date().toISOString());
    console.log('Server timestamp (ms):', Date.now());
    console.log('Timestamp used:', timestamp);
    console.log('Time difference:', Date.now() - parseInt(timestamp), 'ms');
    console.log('================================');
    
    // Test: Try with Node.js http module instead of axios to rule out axios issues
    const response = await axios.request(config);

    // Save timestamp and signature for use in accept-quote
    saveQuoteData(timestamp, signature);

    // Return only the data - mask all partner details from end user
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    // Handle partner configuration errors
    if (error.message && error.message.includes('Partner')) {
      return res.status(400).json({
        success: false,
        error: {
          message: error.message,
          status: 400
        }
      });
    }
    
    // Detailed error logging for debugging
    console.error('=== GET-QUOTE ERROR DETAILS ===');
    console.error('Error message:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', JSON.stringify(error.response.headers, null, 2));
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      console.error('Request URL:', error.config?.url);
      console.error('Request method:', error.config?.method);
      console.error('Request headers:', JSON.stringify(error.config?.headers, null, 2));
    } else if (error.request) {
      console.error('No response received from partner API');
      console.error('Request config:', JSON.stringify(error.config, null, 2));
    } else {
      console.error('Error setting up request:', error.message);
    }
    console.error('================================');
    
    if (error.response) {
      res.status(error.response.status).json({
        success: false,
        error: {
          message: error.message,
          status: error.response.status,
          data: error.response.data
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          message: error.message,
          status: 500
        }
      });
    }
  }
});

/**
 * Accept Quote - Partner API
 * POST /api/{partnerId}/accept-quote
 * 
 * Signature generation matches Postman pre-script exactly:
 * 1. Get query string from URL
 * 2. Replace {{timestamp}} with actual timestamp
 * 3. Remove &signature={{sign}} placeholder
 * 4. Generate HMAC SHA256 signature
 * 5. Add signature to request
 */
router.post('/accept-quote', async (req, res) => {
  try {
    // Get partner configuration (abstracts partner details from user)
    const partner = getPartnerFromRequest(req);
    const apiKey = partner.apiKey;
    const secret = partner.secret;
    const baseUrl = partner.baseUrl;

    // Get the full URL with query string
    const urlWithQuery = req.originalUrl || req.url;
    const fullUrl = `${req.protocol}://${req.get('host')}${urlWithQuery}`;
    
    // EXACT MATCH TO POSTMAN PRE-SCRIPT:
    // let path = "openapi/convert/v1/accept-quote";
    const path = "openapi/convert/v1/accept-quote";
    
    // let timestamp = new Date().getTime().toString();
    // Use server time - if there's a time sync issue, this will help
    // For time sync issues, you can add an offset: new Date().getTime() + offset
    const timestamp = new Date().getTime().toString();
    
    // Log time sync info for debugging
    const serverTime = Date.now();
    console.log('=== TIME SYNC CHECK ===');
    console.log('Server time (ms):', serverTime);
    console.log('Timestamp used:', timestamp);
    console.log('Time difference:', serverTime - parseInt(timestamp), 'ms');
    console.log('========================');
    
    // let param = request.url.substr(request.url.indexOf("?")+1,request.url.length-1)
    const queryStartIndex = fullUrl.indexOf('?');
    let param = queryStartIndex >= 0 
      ? fullUrl.substring(queryStartIndex + 1, fullUrl.length) 
      : '';
    
    // str = param.replace("{{timestamp}}",pm.environment.get("timestamp"));
    let str = param.replace("{{timestamp}}", timestamp);
    
    // str = str.replace("&signature={{sign}}","");
    str = str.replace("&signature={{sign}}", "");
    
    // If timestamp wasn't in the original query string, add it
    if (!str.includes('timestamp=')) {
      str = str ? `${str}&timestamp=${timestamp}` : `timestamp=${timestamp}`;
    }
    
    console.log("str", str);

    // MATCHING POSTMAN PRE-SCRIPT (same logic as get-quote):
    // let signature = CryptoJS.HmacSHA256(str,pm.environment.get("secret"));
    // signature = CryptoJS.enc.Hex.stringify(signature);
    const CryptoJS = require('crypto-js');
    let signature = CryptoJS.HmacSHA256(str, secret);
    signature = CryptoJS.enc.Hex.stringify(signature);
    
    // pm.environment.set("sign", signature);
    console.log("signature", signature);

    // Build final URL with signature (using partner's base URL)
    const finalQueryString = str ? `${str}&signature=${signature}` : `signature=${signature}`;
    const url = `${baseUrl}/openapi/convert/v1/accept-quote?${finalQueryString}`;

    // Log the final request
    console.log('');
    console.log('=== FINAL REQUEST ===');
    console.log('Final URL:', url);
    console.log('Request Headers:', JSON.stringify({
      'X-COINS-APIKEY': apiKey
    }, null, 2));
    console.log('==================================================');
    console.log('');
    
    // Generate exact curl command for testing on different server
    const curlCommand = `curl -X POST \\
  -H "X-COINS-APIKEY: ${apiKey}" \\
  "${url}"`;
    
    console.log('=== EXACT CURL COMMAND (for testing) ===');
    console.log(curlCommand);
    console.log('');
    console.log('=== SINGLE LINE CURL (copy-paste ready) ===');
    console.log(`curl -X POST -H "X-COINS-APIKEY: ${apiKey}" "${url}"`);
    console.log('==========================================');
    console.log('');

    // Make request to partner API (matching axios config)
    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: url,
      headers: {
        'X-COINS-APIKEY': apiKey
      },
      timeout: 30000
    };

    const response = await axios.request(config);

    // Return only the data - mask all partner details from end user
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    // Handle partner configuration errors
    if (error.message && error.message.includes('Partner')) {
      return res.status(400).json({
        success: false,
        error: {
          message: error.message,
          status: 400
        }
      });
    }
    
    if (error.response) {
      res.status(error.response.status).json({
        success: false,
        error: {
          message: error.message,
          status: error.response.status,
          data: error.response.data
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          message: error.message,
          status: 500
        }
      });
    }
  }
});

/**
 * Cash Out - Partner API
 * POST /api/{partnerId}/cash-out
 * 
 * Signature generation uses request body (not query string):
 * 1. Get raw request body
 * 2. Generate timestamp
 * 3. Generate HMAC SHA256 signature from body
 * 4. Add signature to query string
 * 5. Add timestamp to header
 */
router.post('/cash-out', async (req, res) => {
  try {
    // Get partner configuration (abstracts partner details from user)
    const partner = getPartnerFromRequest(req);
    const apiKey = partner.apiKey;
    const secret = partner.secret;
    const baseUrl = partner.baseUrl;

    // EXACT MATCH TO POSTMAN PRE-SCRIPT:
    // var str_requestBody = pm.request.body.raw
    // IMPORTANT: Use raw body if available, otherwise stringify (must match Postman exactly)
    // The raw body preserves the exact format from the client
    const strRequestBody = req.rawBody || JSON.stringify(req.body);
    
    // let timestamp = (new Date()).getTime().toString();
    const timestamp = new Date().getTime().toString();
    
    // let path = "openapi/fiat/v1/cash-out";
    const path = "openapi/fiat/v1/cash-out";
    
    // let signature = CryptoJS.HmacSHA256(signatureBody, pm.environment.get("secret"))
    // signature = CryptoJS.enc.Hex.stringify(signature)
    const CryptoJS = require('crypto-js');
    
    console.log('=== Cash Out Request ===');
    console.log('Request Body (parsed):', JSON.stringify(req.body, null, 2));
    console.log('Request Body (stringified for signature):', strRequestBody);
    console.log('Body length:', strRequestBody.length);
    console.log('Timestamp:', timestamp);
    
    let signature = CryptoJS.HmacSHA256(strRequestBody, secret);
    signature = CryptoJS.enc.Hex.stringify(signature);
    
    console.log('Signature:', signature);
    console.log('');

    // Build URL with signature in query string (timestamp goes in header, not query)
    // Using partner's base URL (abstracted from user)
    const url = `${baseUrl}/${path}?signature=${signature}`;

    // Log the final request
    console.log('=== FINAL REQUEST ===');
    console.log('Final URL:', url);
    console.log('Request Headers:', JSON.stringify({
      'X-COINS-APIKEY': apiKey,
      'timestamp': timestamp
    }, null, 2));
    console.log('Request Body:', req.body);
    console.log('==================================================');
    console.log('');
    
    // Generate exact curl command for testing on different server
    const bodyEscaped = strRequestBody.replace(/"/g, '\\"');
    const curlCommand = `curl -X POST \\
  -H "X-COINS-APIKEY: ${apiKey}" \\
  -H "timestamp: ${timestamp}" \\
  -d "${bodyEscaped}" \\
  "${url}"`;
    
    console.log('=== EXACT CURL COMMAND (for testing) ===');
    console.log(curlCommand);
    console.log('');
    console.log('=== SINGLE LINE CURL (copy-paste ready) ===');
    console.log(`curl -X POST -H "X-COINS-APIKEY: ${apiKey}" -H "timestamp: ${timestamp}" -d '${strRequestBody}' "${url}"`);
    console.log('==========================================');
    console.log('');

    // Make request to partner API (matching axios config)
    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: url,
      headers: {
        'X-COINS-APIKEY': apiKey,
        'timestamp': timestamp
      },
      data: strRequestBody,
      timeout: 30000
    };

    const response = await axios.request(config);

    // Return only the data - mask all partner details from end user
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    // Handle partner configuration errors
    if (error.message && error.message.includes('Partner')) {
      return res.status(400).json({
        success: false,
        error: {
          message: error.message,
          status: 400
        }
      });
    }
    
    if (error.response) {
      res.status(error.response.status).json({
        success: false,
        error: {
          message: error.message,
          status: error.response.status,
          data: error.response.data
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          message: error.message,
          status: 500
        }
      });
    }
  }
});

module.exports = router;

