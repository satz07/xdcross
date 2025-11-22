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
  // Extract partner ID from URL path (e.g., /api/id0001/get-quote -> id0001)
  const partnerId = req.params.partnerId;
  
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
 * Get Quote - Coins.ph API
 * POST /api/coins/get-quote
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
    const timestamp = new Date().getTime().toString();
    
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

    // MATCHING POSTMAN PRE-SCRIPT:
    // let signature = CryptoJS.HmacSHA256(str,pm.environment.get("secret"));
    // signature = CryptoJS.enc.Hex.stringify(signature);
    const CryptoJS = require('crypto-js');
    let signature = CryptoJS.HmacSHA256(str, secret);
    signature = CryptoJS.enc.Hex.stringify(signature);
    
    // pm.environment.set("sign", signature);
    console.log("signature", signature);

    // Build final URL with signature (using partner's base URL)
    const finalQueryString = str ? `${str}&signature=${signature}` : `signature=${signature}`;
    const url = `${baseUrl}/openapi/convert/v1/get-quote?${finalQueryString}`;

    // Log the final request
    console.log('');
    console.log('=== FINAL REQUEST ===');
    console.log('Final URL:', url);
    console.log('Request Headers:', JSON.stringify({
      'X-COINS-APIKEY': apiKey,
      'Content-Type': 'application/json'
    }, null, 2));
    console.log('==================================================');
    console.log('');

    // Make request to Coins.ph API (matching axios config)
    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: url,
      headers: {
        'X-COINS-APIKEY': apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    };

    const response = await axios.request(config);

    // Save timestamp and signature for use in accept-quote
    saveQuoteData(timestamp, signature);

    res.json({
      success: true,
      source: partner.name || 'partner',
      partner: partner.name,
      data: response.data,
      timestamp: timestamp,
      signature: signature,
      requestParams: {
        ...req.query,
        timestamp: timestamp,
        signature: signature
      }
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
 * Accept Quote - Coins.ph API
 * POST /api/coins/accept-quote
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
    const timestamp = new Date().getTime().toString();
    
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
      'X-COINS-APIKEY': apiKey,
      'Content-Type': 'application/json'
    }, null, 2));
    console.log('==================================================');
    console.log('');

    // Make request to Coins.ph API (matching axios config)
    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: url,
      headers: {
        'X-COINS-APIKEY': apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    };

    const response = await axios.request(config);

    res.json({
      success: true,
      source: partner.name || 'partner',
      partner: partner.name,
      data: response.data,
      timestamp: timestamp,
      signature: signature,
      requestParams: {
        ...req.query,
        timestamp: timestamp,
        signature: signature
      }
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
 * Cash Out - Coins.ph API
 * POST /api/coins/cash-out
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
    const strRequestBody = JSON.stringify(req.body);
    
    // let timestamp = (new Date()).getTime().toString();
    const timestamp = new Date().getTime().toString();
    
    // let path = "openapi/fiat/v1/cash-out";
    const path = "openapi/fiat/v1/cash-out";
    
    // let signature = CryptoJS.HmacSHA256(signatureBody, pm.environment.get("secret"))
    // signature = CryptoJS.enc.Hex.stringify(signature)
    const CryptoJS = require('crypto-js');
    let signature = CryptoJS.HmacSHA256(strRequestBody, secret);
    signature = CryptoJS.enc.Hex.stringify(signature);
    
    console.log('=== Cash Out Request ===');
    console.log('Request Body:', strRequestBody);
    console.log('Timestamp:', timestamp);
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
      'timestamp': timestamp,
      'Content-Type': 'application/json'
    }, null, 2));
    console.log('Request Body:', req.body);
    console.log('==================================================');
    console.log('');

    // Make request to Coins.ph API (matching axios config)
    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: url,
      headers: {
        'X-COINS-APIKEY': apiKey,
        'timestamp': timestamp,
        'Content-Type': 'application/json'
      },
      data: strRequestBody,
      timeout: 30000
    };

    const response = await axios.request(config);

    res.json({
      success: true,
      source: partner.name || 'partner',
      partner: partner.name,
      data: response.data,
      timestamp: timestamp,
      signature: signature,
      requestBody: req.body
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

