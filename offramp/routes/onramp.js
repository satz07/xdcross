/**
 * Onramp.money API Routes
 * Wraps Onramp.money API with signature generation
 */

const express = require('express');
const router = express.Router({ mergeParams: true });
const axios = require('axios');
const { getPartner } = require('../config/partners');
const { generateOnrampHeaders, extractBody } = require('../utils/signature-onramp');

/** Body for external Onramp API (strip ref_id which is only for our routing). */
function bodyForExternalApi(body) {
  const b = { ...(body || {}) };
  delete b.ref_id;
  return b;
}

/**
 * Get partner configuration from request
 * Partner ID is taken from ref_id (query or body parameter).
 * Returns { partner, partnerId } for use in internal API calls.
 */
function getPartnerFromRequest(req) {
  const partnerId = req.partnerId || req.query.ref_id || (req.body && req.body.ref_id);

  if (!partnerId) {
    throw new Error('ref_id is required. Pass ref_id in query or body (e.g. ref_id=id0002).');
  }

  const partner = getPartner(partnerId);

  if (!partner) {
    throw new Error(`Partner '${partnerId}' not found or not configured`);
  }

  console.log('Partner ID from ref_id:', partnerId);
  console.log('Partner config:', { name: partner.name, baseUrl: partner.baseUrl });

  return { partner, partnerId };
}

/**
 * Get Quote - Onramp API
 * POST /api/onramp/quote (ref_id in query or body)
 * 
 * Endpoint: https://api.onramp.money/onramp/api/v2/whiteLabel/onramp/quote
 * Content-Type: application/x-www-form-urlencoded
 * Parameters: fromCurrency, toCurrency, fromAmount, chain, paymentMethodType
 */
router.post('/onramp/quote', async (req, res) => {
  console.log('=== ONRAMP ROUTE HIT ===');
  console.log('Route: /onramp/quote');
  console.log('Request path:', req.path);
  console.log('Request originalUrl:', req.originalUrl);
  console.log('Request method:', req.method);
  console.log('Request params:', req.params);
  console.log('========================');
  
  try {
    // Get partner configuration
    const { partner, partnerId } = getPartnerFromRequest(req);
    const apiKey = partner.apiKey;
    const secret = partner.secret;
    const baseUrl = partner.baseUrl;
    
    // Validate credentials before proceeding
    if (!apiKey || !secret) {
      throw new Error(`Missing credentials for partner '${partner.name}'. API Key: ${!!apiKey}, Secret: ${!!secret}`);
    }
    
    console.log('=== Onramp Credentials Check ===');
    console.log('API Key exists:', !!apiKey);
    console.log('Secret exists:', !!secret);
    console.log('API Key length:', apiKey ? apiKey.length : 0);
    console.log('Secret length:', secret ? secret.length : 0);
    console.log('===============================');
    
    // Extract body from request (ref_id stripped before forwarding to external API)
    const body = bodyForExternalApi(extractBody(req));

    // Map unsupported payment methods for INR: Onramp API rejects INR-BANK-TRANSFER
    if (body.fromCurrency === 'INR' && body.paymentMethodType === 'INR-BANK-TRANSFER') {
      body.paymentMethodType = 'IMPS';
      console.log('Mapped INR-BANK-TRANSFER -> IMPS (Onramp unsupported)');
    }
    
    // Generate signature and headers
    const headers = generateOnrampHeaders({ apiKey, secret, body });
    
    // Add Content-Type header
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    
    // Build full URL: https://api.onramp.money/onramp/api/v2/whiteLabel/onramp/quote
    const apiUrl = `${baseUrl}/onramp/quote`;
    
    console.log('=== Onramp Get Quote Request ===');
    console.log('Base URL:', baseUrl);
    console.log('Full API URL:', apiUrl);
    console.log('Headers:', JSON.stringify(headers, null, 2));
    console.log('Body:', body);
    console.log('================================');
    
    // Make request to Onramp API
    const response = await axios.post(apiUrl, new URLSearchParams(body), {
      headers: headers,
      timeout: 30000
    });
    
    console.log('=== Onramp Get Quote Response ===');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    console.log('=================================');
    
    // Return response
    res.status(response.status).json(response.data);
    
  } catch (error) {
    console.error('Onramp Get Quote Error:', error.message);
    if (error.response) {
      console.error('Onramp API response status:', error.response.status);
      console.error('Onramp API response data:', JSON.stringify(error.response.data, null, 2));
    }
    console.error('Error stack:', error.stack);
    
    // Handle signature generation errors specifically
    if (error.message.includes('Secret key is required') || 
        error.message.includes('API key is required') ||
        error.message.includes('Missing credentials')) {
      return res.status(500).json({
        error: {
          message: error.message,
          status: 500,
          hint: 'Check that ONRAMP_API_KEY and ONRAMP_SECRET environment variables are set, or that the partner config has valid credentials'
        }
      });
    }
    
    if (error.response) {
      // API responded with error
      res.status(error.response.status).json({
        error: {
          message: error.response.data?.message || 'Onramp API error',
          status: error.response.status,
          data: error.response.data
        }
      });
    } else if (error.request) {
      // Request made but no response
      res.status(503).json({
        error: {
          message: 'No response from Onramp API',
          status: 503
        }
      });
    } else {
      // Error setting up request
      res.status(500).json({
        error: {
          message: error.message || 'Internal server error',
          status: 500
        }
      });
    }
  }
});

/**
 * Create Transaction - Onramp API
 * POST /api/onramp/createTransaction (ref_id in query or body)
 * 
 * Endpoint: https://api.onramp.money/onramp/api/v2/whiteLabel/onramp/createTransaction
 * Content-Type: application/x-www-form-urlencoded
 * Parameters: chain, toCurrency, rate, fromAmount, depositAddress, customerId, toAmount, 
 *            fromCurrency, paymentMethodType, merchantRecognitionId, fiatAccountId
 */
router.post('/onramp/createTransaction', async (req, res) => {
  console.log('=== ONRAMP ROUTE HIT ===');
  console.log('Route: /onramp/createTransaction');
  console.log('Request path:', req.path);
  console.log('Request originalUrl:', req.originalUrl);
  console.log('Request method:', req.method);
  console.log('Request params:', req.params);
  console.log('========================');
  
  try {
    // Get partner configuration
    const { partner, partnerId } = getPartnerFromRequest(req);
    const apiKey = partner.apiKey;
    const secret = partner.secret;
    const baseUrl = partner.baseUrl;
    
    // Validate credentials before proceeding
    if (!apiKey || !secret) {
      throw new Error(`Missing credentials for partner '${partner.name}'. API Key: ${!!apiKey}, Secret: ${!!secret}`);
    }
    
    console.log('=== Onramp Credentials Check ===');
    console.log('API Key exists:', !!apiKey);
    console.log('Secret exists:', !!secret);
    console.log('API Key length:', apiKey ? apiKey.length : 0);
    console.log('Secret length:', secret ? secret.length : 0);
    console.log('===============================');
    
    // Extract body from request
    const body = bodyForExternalApi(extractBody(req));
    
    // Validate required parameters for createTransaction
    const requiredParams = ['chain', 'fromCurrency', 'toCurrency', 'fromAmount', 'toAmount', 'rate', 'paymentMethodType', 'depositAddress', 'customerId'];
    const missingParams = requiredParams.filter(param => !body[param]);
    
    if (missingParams.length > 0) {
      console.error('=== Missing Required Parameters ===');
      console.error('Missing:', missingParams);
      console.error('Received:', Object.keys(body));
      console.error('===================================');
      return res.status(400).json({
        error: {
          message: `Missing required parameters: ${missingParams.join(', ')}`,
          status: 400,
          missing: missingParams,
          received: Object.keys(body)
        }
      });
    }

    // If toAmount is 0, fetch from quote API (client often sends 0 when quote fails or isn't called)
    let toAmountNum = parseFloat(body.toAmount);
    if (!toAmountNum || toAmountNum <= 0) {
      console.log('=== toAmount is 0, fetching from onramp/quote ===');
      try {
        const quoteBody = {
          fromCurrency: body.fromCurrency,
          toCurrency: body.toCurrency || 'USDC',
          fromAmount: body.fromAmount,
          chain: body.chain,
          paymentMethodType: body.paymentMethodType
        };
        const quoteResponse = await callOnrampQuote(partnerId, quoteBody);
        if (quoteResponse?.status === 1 && quoteResponse?.data?.toAmount) {
          body.toAmount = quoteResponse.data.toAmount;
          toAmountNum = parseFloat(body.toAmount);
          console.log('Fetched toAmount from quote:', body.toAmount);
        }
      } catch (quoteErr) {
        console.error('Quote fetch failed:', quoteErr.message);
      }
      if (!toAmountNum || toAmountNum <= 0) {
        return res.status(400).json({
          error: {
            message: 'toAmount must be > 0. Call onramp/quote first, or ensure paymentMethodType is supported (e.g. UPI/IMPS for INR).',
            status: 400
          }
        });
      }
    }
    
    // Generate signature and headers
    const headers = generateOnrampHeaders({ apiKey, secret, body });
    
    // Add Content-Type header
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    
    // Build full URL: https://api.onramp.money/onramp/api/v2/whiteLabel/onramp/createTransaction
    const apiUrl = `${baseUrl}/onramp/createTransaction`;
    
    console.log('=== Onramp Create Transaction Request ===');
    console.log('Base URL:', baseUrl);
    console.log('Full API URL:', apiUrl);
    console.log('Headers:', JSON.stringify(headers, null, 2));
    console.log('Body:', body);
    console.log('==========================================');
    
    // Make request to Onramp API
    const response = await axios.post(apiUrl, new URLSearchParams(body), {
      headers: headers,
      timeout: 30000
    });
    
    console.log('=== Onramp Create Transaction Response ===');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    console.log('==========================================');
    
    // Return response
    res.status(response.status).json(response.data);
    
  } catch (error) {
    console.error('Onramp Create Transaction Error:', error.message);
    console.error('Error stack:', error.stack);
    
    // Handle signature generation errors specifically
    if (error.message.includes('Secret key is required') || 
        error.message.includes('API key is required') ||
        error.message.includes('Missing credentials')) {
      return res.status(500).json({
        error: {
          message: error.message,
          status: 500,
          hint: 'Check that ONRAMP_API_KEY and ONRAMP_SECRET environment variables are set, or that the partner config has valid credentials'
        }
      });
    }
    
    if (error.response) {
      // API responded with error
      res.status(error.response.status).json({
        error: {
          message: error.response.data?.message || 'Onramp API error',
          status: error.response.status,
          data: error.response.data
        }
      });
    } else if (error.request) {
      // Request made but no response
      res.status(503).json({
        error: {
          message: 'No response from Onramp API',
          status: 503
        }
      });
    } else {
      // Error setting up request
      res.status(500).json({
        error: {
          message: error.message || 'Internal server error',
          status: 500
        }
      });
    }
  }
});

/**
 * Get All User Transactions - Onramp API
 * POST /api/onramp/allUserTransaction (ref_id in query or body)
 * 
 * Endpoint: https://api.onramp.money/onramp/api/v2/whiteLabel/onramp/allUserTransaction
 * Content-Type: application/x-www-form-urlencoded
 * Parameters: customerId, page, pageSize
 */
router.post('/onramp/allUserTransaction', async (req, res) => {
  console.log('=== ONRAMP ROUTE HIT ===');
  console.log('Route: /onramp/allUserTransaction');
  console.log('Request path:', req.path);
  console.log('Request originalUrl:', req.originalUrl);
  console.log('Request method:', req.method);
  console.log('Request params:', req.params);
  console.log('========================');
  
  try {
    // Get partner configuration
    const { partner, partnerId } = getPartnerFromRequest(req);
    const apiKey = partner.apiKey;
    const secret = partner.secret;
    const baseUrl = partner.baseUrl;
    
    // Validate credentials before proceeding
    if (!apiKey || !secret) {
      throw new Error(`Missing credentials for partner '${partner.name}'. API Key: ${!!apiKey}, Secret: ${!!secret}`);
    }
    
    console.log('=== Onramp Credentials Check ===');
    console.log('API Key exists:', !!apiKey);
    console.log('Secret exists:', !!secret);
    console.log('API Key length:', apiKey ? apiKey.length : 0);
    console.log('Secret length:', secret ? secret.length : 0);
    console.log('===============================');
    
    // Extract body from request
    const body = bodyForExternalApi(extractBody(req));
    
    // Generate signature and headers
    const headers = generateOnrampHeaders({ apiKey, secret, body });
    
    // Add Content-Type header
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    
    // Build full URL: https://api.onramp.money/onramp/api/v2/whiteLabel/onramp/allUserTransaction
    const apiUrl = `${baseUrl}/onramp/allUserTransaction`;
    
    console.log('=== Onramp All User Transaction Request ===');
    console.log('Base URL:', baseUrl);
    console.log('Full API URL:', apiUrl);
    console.log('Headers:', JSON.stringify(headers, null, 2));
    console.log('Body:', body);
    console.log('============================================');
    
    // Make request to Onramp API
    const response = await axios.post(apiUrl, new URLSearchParams(body), {
      headers: headers,
      timeout: 30000
    });
    
    console.log('=== Onramp All User Transaction Response ===');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    console.log('============================================');
    
    // Return response
    res.status(response.status).json(response.data);
    
  } catch (error) {
    console.error('Onramp All User Transaction Error:', error.message);
    console.error('Error stack:', error.stack);
    
    // Handle signature generation errors specifically
    if (error.message.includes('Secret key is required') || 
        error.message.includes('API key is required') ||
        error.message.includes('Missing credentials')) {
      return res.status(500).json({
        error: {
          message: error.message,
          status: 500,
          hint: 'Check that ONRAMP_API_KEY and ONRAMP_SECRET environment variables are set, or that the partner config has valid credentials'
        }
      });
    }
    
    if (error.response) {
      // API responded with error
      res.status(error.response.status).json({
        error: {
          message: error.response.data?.message || 'Onramp API error',
          status: error.response.status,
          data: error.response.data
        }
      });
    } else if (error.request) {
      // Request made but no response
      res.status(503).json({
        error: {
          message: 'No response from Onramp API',
          status: 503
        }
      });
    } else {
      // Error setting up request
      res.status(500).json({
        error: {
          message: error.message || 'Internal server error',
          status: 500
        }
      });
    }
  }
});

/**
 * Get Onramp Transaction - Onramp API
 * POST /api/onramp/transaction (ref_id in query or body)
 * 
 * Endpoint: https://api.onramp.money/onramp/api/v2/whiteLabel/onramp/transaction
 * Content-Type: application/x-www-form-urlencoded
 * Parameters: transactionId, customerId
 */
router.post('/onramp/transaction', async (req, res) => {
  try {
    const { partner, partnerId } = getPartnerFromRequest(req);
    const apiKey = partner.apiKey;
    const secret = partner.secret;
    const baseUrl = partner.baseUrl;

    if (!apiKey || !secret) {
      throw new Error(`Missing credentials for partner '${partner.name}'. API Key: ${!!apiKey}, Secret: ${!!secret}`);
    }

    const body = bodyForExternalApi(extractBody(req));
    const headers = generateOnrampHeaders({ apiKey, secret, body });
    headers['Content-Type'] = 'application/x-www-form-urlencoded';

    const apiUrl = `${baseUrl}/onramp/transaction`;

    const response = await axios.post(apiUrl, new URLSearchParams(body), {
      headers: headers,
      timeout: 30000
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Onramp Transaction Error:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data || { error: error.response.data });
    } else {
      res.status(500).json({ error: { message: error.message || 'Internal server error' } });
    }
  }
});

/**
 * Update Onramp Reference ID - Onramp API
 * PUT /api/onramp/referenceId (ref_id in query or body)
 * 
 * Endpoint: https://api.onramp.money/onramp/api/v2/whiteLabel/onramp/referenceId
 * Content-Type: application/x-www-form-urlencoded
 * Parameters: customerId, transactionId, referenceId
 */
router.put('/onramp/referenceId', async (req, res) => {
  try {
    const { partner, partnerId } = getPartnerFromRequest(req);
    const apiKey = partner.apiKey;
    const secret = partner.secret;
    const baseUrl = partner.baseUrl;

    if (!apiKey || !secret) {
      throw new Error(`Missing credentials for partner '${partner.name}'. API Key: ${!!apiKey}, Secret: ${!!secret}`);
    }

    const body = bodyForExternalApi(extractBody(req));
    const headers = generateOnrampHeaders({ apiKey, secret, body });
    headers['Content-Type'] = 'application/x-www-form-urlencoded';

    const apiUrl = `${baseUrl}/onramp/referenceId`;

    const response = await axios.put(apiUrl, new URLSearchParams(body), {
      headers: headers,
      timeout: 30000
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Onramp ReferenceId Error:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data || { error: error.response.data });
    } else {
      res.status(500).json({ error: { message: error.message || 'Internal server error' } });
    }
  }
});

/**
 * Get Bank Details - Onramp API
 * POST /api/bank/bankDetails (ref_id in query or body)
 * 
 * Endpoint: https://api.onramp.money/onramp/api/v2/whiteLabel/bank/bankDetails
 * Content-Type: application/x-www-form-urlencoded
 * Parameters: customerId, fromCurrency, transactionId, paymentMethodType
 */
router.post('/bank/bankDetails', async (req, res) => {
  console.log('=== ONRAMP ROUTE HIT ===');
  console.log('Route: /bank/bankDetails');
  console.log('Request path:', req.path);
  console.log('Request originalUrl:', req.originalUrl);
  console.log('Request method:', req.method);
  console.log('Request params:', req.params);
  console.log('========================');
  
  try {
    // Get partner configuration
    const { partner, partnerId } = getPartnerFromRequest(req);
    const apiKey = partner.apiKey;
    const secret = partner.secret;
    const baseUrl = partner.baseUrl;
    
    // Validate credentials before proceeding
    if (!apiKey || !secret) {
      throw new Error(`Missing credentials for partner '${partner.name}'. API Key: ${!!apiKey}, Secret: ${!!secret}`);
    }
    
    console.log('=== Onramp Credentials Check ===');
    console.log('API Key exists:', !!apiKey);
    console.log('Secret exists:', !!secret);
    console.log('API Key length:', apiKey ? apiKey.length : 0);
    console.log('Secret length:', secret ? secret.length : 0);
    console.log('===============================');
    
    // Extract body from request
    const body = bodyForExternalApi(extractBody(req));
    
    // Generate signature and headers
    const headers = generateOnrampHeaders({ apiKey, secret, body });
    
    // Add Content-Type header
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    
    // Build full URL: https://api.onramp.money/onramp/api/v2/whiteLabel/bank/bankDetails
    const apiUrl = `${baseUrl}/bank/bankDetails`;
    
    console.log('=== Onramp Bank Details Request ===');
    console.log('Base URL:', baseUrl);
    console.log('Full API URL:', apiUrl);
    console.log('Headers:', JSON.stringify(headers, null, 2));
    console.log('Body:', body);
    console.log('===================================');
    
    // Make request to Onramp API
    const response = await axios.post(apiUrl, new URLSearchParams(body), {
      headers: headers,
      timeout: 30000
    });
    
    console.log('=== Onramp Bank Details Response ===');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    console.log('====================================');
    
    // Return response
    res.status(response.status).json(response.data);
    
  } catch (error) {
    console.error('Onramp Bank Details Error:', error.message);
    console.error('Error stack:', error.stack);
    
    // Handle signature generation errors specifically
    if (error.message.includes('Secret key is required') || 
        error.message.includes('API key is required') ||
        error.message.includes('Missing credentials')) {
      return res.status(500).json({
        error: {
          message: error.message,
          status: 500,
          hint: 'Check that ONRAMP_API_KEY and ONRAMP_SECRET environment variables are set, or that the partner config has valid credentials'
        }
      });
    }
    
    if (error.response) {
      // API responded with error
      res.status(error.response.status).json({
        error: {
          message: error.response.data?.message || 'Onramp API error',
          status: error.response.status,
          data: error.response.data
        }
      });
    } else if (error.request) {
      // Request made but no response
      res.status(503).json({
        error: {
          message: 'No response from Onramp API',
          status: 503
        }
      });
    } else {
      // Error setting up request
      res.status(500).json({
        error: {
          message: error.message || 'Internal server error',
          status: 500
        }
      });
    }
  }
});

/**
 * Get Offramp Quote - Onramp API
 * POST /api/offramp/quote (ref_id in query or body)
 * 
 * Endpoint: https://api.onramp.money/onramp/api/v2/whiteLabel/offramp/quote
 * Content-Type: application/x-www-form-urlencoded
 * Parameters: fromCurrency, toCurrency, fromAmount, chain
 */
router.post('/offramp/quote', async (req, res) => {
  console.log('=== ONRAMP ROUTE HIT ===');
  console.log('Route: /offramp/quote');
  console.log('Request path:', req.path);
  console.log('Request originalUrl:', req.originalUrl);
  console.log('Request method:', req.method);
  console.log('Request params:', req.params);
  console.log('========================');
  
  try {
    // Get partner configuration
    const { partner, partnerId } = getPartnerFromRequest(req);
    const apiKey = partner.apiKey;
    const secret = partner.secret;
    const baseUrl = partner.baseUrl;
    
    // Validate credentials before proceeding
    if (!apiKey || !secret) {
      throw new Error(`Missing credentials for partner '${partner.name}'. API Key: ${!!apiKey}, Secret: ${!!secret}`);
    }
    
    console.log('=== Onramp Credentials Check ===');
    console.log('API Key exists:', !!apiKey);
    console.log('Secret exists:', !!secret);
    console.log('API Key length:', apiKey ? apiKey.length : 0);
    console.log('Secret length:', secret ? secret.length : 0);
    console.log('===============================');
    
    // Extract body from request
    const body = bodyForExternalApi(extractBody(req));
    
    // Generate signature and headers
    const headers = generateOnrampHeaders({ apiKey, secret, body });
    
    // Add Content-Type header
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    
    // Build full URL: https://api.onramp.money/onramp/api/v2/whiteLabel/offramp/quote
    const apiUrl = `${baseUrl}/offramp/quote`;
    
    console.log('=== Onramp Offramp Quote Request ===');
    console.log('Base URL:', baseUrl);
    console.log('Full API URL:', apiUrl);
    console.log('Headers:', JSON.stringify(headers, null, 2));
    console.log('Body:', body);
    console.log('====================================');
    
    // Make request to Onramp API
    const response = await axios.post(apiUrl, new URLSearchParams(body), {
      headers: headers,
      timeout: 30000
    });
    
    console.log('=== Onramp Offramp Quote Response ===');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    console.log('=====================================');
    
    // Return response
    res.status(response.status).json(response.data);
    
  } catch (error) {
    console.error('Onramp Offramp Quote Error:', error.message);
    console.error('Error stack:', error.stack);
    
    // Handle signature generation errors specifically
    if (error.message.includes('Secret key is required') || 
        error.message.includes('API key is required') ||
        error.message.includes('Missing credentials')) {
      return res.status(500).json({
        error: {
          message: error.message,
          status: 500,
          hint: 'Check that ONRAMP_API_KEY and ONRAMP_SECRET environment variables are set, or that the partner config has valid credentials'
        }
      });
    }
    
    if (error.response) {
      // API responded with error
      res.status(error.response.status).json({
        error: {
          message: error.response.data?.message || 'Onramp API error',
          status: error.response.status,
          data: error.response.data
        }
      });
    } else if (error.request) {
      // Request made but no response
      res.status(503).json({
        error: {
          message: 'No response from Onramp API',
          status: 503
        }
      });
    } else {
      // Error setting up request
      res.status(500).json({
        error: {
          message: error.message || 'Internal server error',
          status: 500
        }
      });
    }
  }
});

/**
 * Create Offramp Transaction - Onramp API
 * POST /api/offramp/createTransaction (ref_id in query or body)
 * 
 * Endpoint: https://api.onramp.money/onramp/api/v2/whiteLabel/offramp/createTransaction
 * Content-Type: application/x-www-form-urlencoded
 * Parameters: chain, customerId, fiatAccountId, fromAmount, fromCurrency, rate, toAmount, toCurrency, merchantRecognitionId
 */
router.post('/offramp/createTransaction', async (req, res) => {
  console.log('=== ONRAMP ROUTE HIT ===');
  console.log('Route: /offramp/createTransaction');
  console.log('Request path:', req.path);
  console.log('Request originalUrl:', req.originalUrl);
  console.log('Request method:', req.method);
  console.log('Request params:', req.params);
  console.log('========================');
  
  try {
    // Get partner configuration
    const { partner, partnerId } = getPartnerFromRequest(req);
    const apiKey = partner.apiKey;
    const secret = partner.secret;
    const baseUrl = partner.baseUrl;
    
    // Validate credentials before proceeding
    if (!apiKey || !secret) {
      throw new Error(`Missing credentials for partner '${partner.name}'. API Key: ${!!apiKey}, Secret: ${!!secret}`);
    }
    
    console.log('=== Onramp Credentials Check ===');
    console.log('API Key exists:', !!apiKey);
    console.log('Secret exists:', !!secret);
    console.log('API Key length:', apiKey ? apiKey.length : 0);
    console.log('Secret length:', secret ? secret.length : 0);
    console.log('===============================');
    
    // Extract body from request
    const body = bodyForExternalApi(extractBody(req));
    
    // Generate signature and headers
    const headers = generateOnrampHeaders({ apiKey, secret, body });
    
    // Add Content-Type header
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    
    // Build full URL: https://api.onramp.money/onramp/api/v2/whiteLabel/offramp/createTransaction
    const apiUrl = `${baseUrl}/offramp/createTransaction`;
    
    console.log('=== Onramp Offramp Create Transaction Request ===');
    console.log('Base URL:', baseUrl);
    console.log('Full API URL:', apiUrl);
    console.log('Headers:', JSON.stringify(headers, null, 2));
    console.log('Body:', body);
    console.log('==================================================');
    
    // Make request to Onramp API
    const response = await axios.post(apiUrl, new URLSearchParams(body), {
      headers: headers,
      timeout: 30000
    });
    
    console.log('=== Onramp Offramp Create Transaction Response ===');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    console.log('==================================================');
    
    // Return response
    res.status(response.status).json(response.data);
    
  } catch (error) {
    console.error('Onramp Offramp Create Transaction Error:', error.message);
    console.error('Error stack:', error.stack);
    
    // Handle signature generation errors specifically
    if (error.message.includes('Secret key is required') || 
        error.message.includes('API key is required') ||
        error.message.includes('Missing credentials')) {
      return res.status(500).json({
        error: {
          message: error.message,
          status: 500,
          hint: 'Check that ONRAMP_API_KEY and ONRAMP_SECRET environment variables are set, or that the partner config has valid credentials'
        }
      });
    }
    
    if (error.response) {
      // API responded with error
      res.status(error.response.status).json({
        error: {
          message: error.response.data?.message || 'Onramp API error',
          status: error.response.status,
          data: error.response.data
        }
      });
    } else if (error.request) {
      // Request made but no response
      res.status(503).json({
        error: {
          message: 'No response from Onramp API',
          status: 503
        }
      });
    } else {
      // Error setting up request
      res.status(500).json({
        error: {
          message: error.message || 'Internal server error',
          status: 500
        }
      });
    }
  }
});

/**
 * Get All User Offramp Transactions - Onramp API
 * POST /api/offramp/allUserTransaction (ref_id in query or body)
 * 
 * Endpoint: https://api.onramp.money/onramp/api/v2/whiteLabel/offramp/allUserTransaction
 * Content-Type: application/x-www-form-urlencoded
 * Parameters: customerId, page, pageSize
 */
router.post('/offramp/allUserTransaction', async (req, res) => {
  console.log('=== ONRAMP ROUTE HIT ===');
  console.log('Route: /offramp/allUserTransaction');
  console.log('Request path:', req.path);
  console.log('Request originalUrl:', req.originalUrl);
  console.log('Request method:', req.method);
  console.log('Request params:', req.params);
  console.log('========================');
  
  try {
    // Get partner configuration
    const { partner, partnerId } = getPartnerFromRequest(req);
    const apiKey = partner.apiKey;
    const secret = partner.secret;
    const baseUrl = partner.baseUrl;
    
    // Validate credentials before proceeding
    if (!apiKey || !secret) {
      throw new Error(`Missing credentials for partner '${partner.name}'. API Key: ${!!apiKey}, Secret: ${!!secret}`);
    }
    
    console.log('=== Onramp Credentials Check ===');
    console.log('API Key exists:', !!apiKey);
    console.log('Secret exists:', !!secret);
    console.log('API Key length:', apiKey ? apiKey.length : 0);
    console.log('Secret length:', secret ? secret.length : 0);
    console.log('===============================');
    
    // Extract body from request
    const body = bodyForExternalApi(extractBody(req));
    
    // Generate signature and headers
    const headers = generateOnrampHeaders({ apiKey, secret, body });
    
    // Add Content-Type header
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    
    // Build full URL: https://api.onramp.money/onramp/api/v2/whiteLabel/offramp/allUserTransaction
    const apiUrl = `${baseUrl}/offramp/allUserTransaction`;
    
    console.log('=== Onramp Offramp All User Transaction Request ===');
    console.log('Base URL:', baseUrl);
    console.log('Full API URL:', apiUrl);
    console.log('Headers:', JSON.stringify(headers, null, 2));
    console.log('Body:', body);
    console.log('=====================================================');
    
    // Make request to Onramp API
    const response = await axios.post(apiUrl, new URLSearchParams(body), {
      headers: headers,
      timeout: 30000
    });
    
    console.log('=== Onramp Offramp All User Transaction Response ===');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    console.log('=====================================================');
    
    // Return response
    res.status(response.status).json(response.data);
    
  } catch (error) {
    console.error('Onramp Offramp All User Transaction Error:', error.message);
    console.error('Error stack:', error.stack);
    
    // Handle signature generation errors specifically
    if (error.message.includes('Secret key is required') || 
        error.message.includes('API key is required') ||
        error.message.includes('Missing credentials')) {
      return res.status(500).json({
        error: {
          message: error.message,
          status: 500,
          hint: 'Check that ONRAMP_API_KEY and ONRAMP_SECRET environment variables are set, or that the partner config has valid credentials'
        }
      });
    }
    
    if (error.response) {
      // API responded with error
      res.status(error.response.status).json({
        error: {
          message: error.response.data?.message || 'Onramp API error',
          status: error.response.status,
          data: error.response.data
        }
      });
    } else if (error.request) {
      // Request made but no response
      res.status(503).json({
        error: {
          message: 'No response from Onramp API',
          status: 503
        }
      });
    } else {
      // Error setting up request
      res.status(500).json({
        error: {
          message: error.message || 'Internal server error',
          status: 500
        }
      });
    }
  }
});

/**
 * Get Offramp Transaction - Onramp API
 * POST /api/offramp/transaction (ref_id in query or body)
 * 
 * Endpoint: https://api.onramp.money/onramp/api/v2/whiteLabel/offramp/transaction
 * Content-Type: application/x-www-form-urlencoded
 * Parameters: transactionId, customerId
 */
router.post('/offramp/transaction', async (req, res) => {
  try {
    const { partner, partnerId } = getPartnerFromRequest(req);
    const apiKey = partner.apiKey;
    const secret = partner.secret;
    const baseUrl = partner.baseUrl;

    if (!apiKey || !secret) {
      throw new Error(`Missing credentials for partner '${partner.name}'. API Key: ${!!apiKey}, Secret: ${!!secret}`);
    }

    const body = bodyForExternalApi(extractBody(req));
    const headers = generateOnrampHeaders({ apiKey, secret, body });
    headers['Content-Type'] = 'application/x-www-form-urlencoded';

    const apiUrl = `${baseUrl}/offramp/transaction`;

    const response = await axios.post(apiUrl, new URLSearchParams(body), {
      headers: headers,
      timeout: 30000
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Offramp Transaction Error:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data || { error: error.response.data });
    } else {
      res.status(500).json({ error: { message: error.message || 'Internal server error' } });
    }
  }
});

/**
 * Helper function to call onramp quote endpoint internally
 */
async function callOnrampQuote(partnerId, body) {
  const port = process.env.PORT || 3000;
  const url = `http://localhost:${port}/api/onramp/quote`;
  const bodyWithRef = { ...body, ref_id: partnerId };
  try {
    const response = await axios.post(url, new URLSearchParams(bodyWithRef), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 30000
    });
    return response.data;
  } catch (err) {
    if (err.response) {
      console.error('[callOnrampQuote] Internal quote failed - status:', err.response.status, 'data:', JSON.stringify(err.response.data));
    }
    throw err;
  }
}

/**
 * Helper function to call offramp quote endpoint internally
 */
async function callOfframpQuote(partnerId, body) {
  const port = process.env.PORT || 3000;
  const url = `http://localhost:${port}/api/offramp/quote`;
  const bodyWithRef = { ...body, ref_id: partnerId };
  try {
    const response = await axios.post(url, new URLSearchParams(bodyWithRef), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 30000
    });
    return response.data;
  } catch (err) {
    if (err.response) {
      console.error('[callOfframpQuote] Internal quote failed - status:', err.response.status, 'data:', JSON.stringify(err.response.data));
    }
    throw err;
  }
}

/**
 * Get Combined Exchange Rate - AED to PHP via USDC
 * POST /api/getExchangeRate (ref_id in query or body)
 * 
 * This endpoint combines onramp (AED → USDC) and offramp (USDC → PHP) quotes
 * to show the final PHP amount a user will receive for a given AED amount.
 * 
 * Parameters: fromCurrency (AED), toCurrency (PHP), fromAmount (AED amount), chain, paymentMethodType
 */
router.post('/getExchangeRate', async (req, res) => {
  console.log('=== ONRAMP ROUTE HIT ===');
  console.log('Route: /getExchangeRate');
  console.log('Request path:', req.path);
  console.log('Request originalUrl:', req.originalUrl);
  console.log('Request method:', req.method);
  console.log('Request params:', req.params);
  console.log('========================');
  
  try {
    // Get partner configuration
    const { partner, partnerId } = getPartnerFromRequest(req);
    const apiKey = partner.apiKey;
    const secret = partner.secret;
    
    // Validate credentials before proceeding
    if (!apiKey || !secret) {
      throw new Error(`Missing credentials for partner '${partner.name}'. API Key: ${!!apiKey}, Secret: ${!!secret}`);
    }
    
    // Extract body from request
    const body = bodyForExternalApi(extractBody(req));
    
    // Validate required parameters
    const { fromCurrency, toCurrency, fromAmount, chain, paymentMethodType } = body;
    
    if (!fromCurrency || !toCurrency || !fromAmount || !chain) {
      return res.status(400).json({
        error: {
          message: 'Missing required parameters: fromCurrency, toCurrency, fromAmount, chain are required',
          status: 400
        }
      });
    }
  
    
    console.log('=== Combined Exchange Rate Request ===');
    console.log('Input:', { fromCurrency, toCurrency, fromAmount, chain, paymentMethodType });
    console.log('======================================');

    const fromCurr = fromCurrency.toUpperCase();
    const toCurr = toCurrency.toUpperCase();

    // Step 1: Get onramp quote (AED → USDC)
    console.log('Step 1: Getting onramp quote (AED → USDC)...');
    // Default paymentMethodType: AED uses bank transfer, INR uses IMPS (Onramp rejects INR-BANK-TRANSFER)
    const defaultPaymentMethod = fromCurr === 'INR' ? 'IMPS' : 'AED-BANK-TRANSFER';
    const onrampBody = {
        fromCurrency: fromCurr,
        toCurrency: 'USDC',
        fromAmount: fromAmount,
        chain: chain,
        paymentMethodType: paymentMethodType || defaultPaymentMethod
    };

    const onrampQuote = await callOnrampQuote(partnerId, onrampBody);

    if (!onrampQuote || onrampQuote.status !== 1 || !onrampQuote.data) {
      throw new Error('Failed to get onramp quote: ' + JSON.stringify(onrampQuote));
    }

    const usdcAmount = onrampQuote.data.toAmount;
    console.log('Onramp quote result:', onrampQuote.data);
    console.log('USDC amount received:', usdcAmount);

    // Step 2: Get offramp quote (USDC → PHP)
    console.log('Step 2: Getting offramp quote (USDC → PHP)...');
    const offrampBody = {
      fromCurrency: 'USDC',
      toCurrency: toCurr,
      fromAmount: usdcAmount,
      chain: chain
    };

    const offrampQuote = await callOfframpQuote(partnerId, offrampBody);

    if (!offrampQuote || offrampQuote.status !== 1 || !offrampQuote.data) {
      throw new Error('Failed to get offramp quote: ' + JSON.stringify(offrampQuote));
    }

    const finalPhpAmount = offrampQuote.data.toAmount;
    console.log('Offramp quote result:', offrampQuote.data);
    console.log('Final PHP amount:', finalPhpAmount);
    
    // Step 3: Combine results
    const combinedResult = {
      status: 1,
      code: 200,
      data: {
        input: {
          fromCurrency: fromCurrency.toUpperCase(),
          toCurrency: toCurrency.toUpperCase(),
          fromAmount: fromAmount,
          chain: chain,
          paymentMethodType: paymentMethodType || 'AED-BANK-TRANSFER'
        },
        step1: {
          description: 'AED to USDC (Onramp)',
          fromCurrency: onrampQuote.data.fromCurrency,
          toCurrency: onrampQuote.data.toCurrency,
          fromAmount: onrampQuote.data.fromAmount,
          toAmount: onrampQuote.data.toAmount,
          rate: onrampQuote.data.rate,
          fees: onrampQuote.data.fees
        },
        step2: {
          description: 'USDC to PHP (Offramp)',
          fromCurrency: offrampQuote.data.fromCurrency,
          toCurrency: offrampQuote.data.toCurrency,
          fromAmount: offrampQuote.data.fromAmount,
          toAmount: offrampQuote.data.toAmount,
          rate: offrampQuote.data.rate,
          fees: offrampQuote.data.fees
        },
        final: {
          fromCurrency: fromCurrency.toUpperCase(),
          toCurrency: toCurrency.toUpperCase(),
          fromAmount: fromAmount,
          toAmount: finalPhpAmount,
          effectiveRate: (parseFloat(finalPhpAmount) / parseFloat(fromAmount)).toFixed(6),
          totalFees: {
            onramp: onrampQuote.data.fees || [],
            offramp: offrampQuote.data.fees || []
          }
        }
      }
    };
    
    console.log('=== Combined Exchange Rate Result ===');
    console.log('Final PHP amount:', finalPhpAmount);
    console.log('Effective rate:', combinedResult.data.final.effectiveRate);
    console.log('======================================');
    
    // Return combined result
    res.status(200).json(combinedResult);
    
  } catch (error) {
    console.error('Get Exchange Rate Error:', error.message);
    console.error('Error stack:', error.stack);

    // AED maintenance fallback: when Onramp API is down (503), use fixed rate for AED → PHP
    // Remove this fallback when the API returns. Uses: 1 AED = 15.77 PHP, fixed fee 10 AED
    const isApiDown = error.response?.status === 503 || error.request;
    const fromCurrFallback = (req.body?.fromCurrency || '').toUpperCase();
    const toCurrFallback = (req.body?.toCurrency || '').toUpperCase();
    const isAedToPhp = fromCurrFallback === 'AED' && toCurrFallback === 'PHP';
    if (isApiDown && isAedToPhp) {
      const FIXED_RATE_AED_PHP = 15.77;
      const FIXED_FEE_AED = 10;
      const fromAmt = parseFloat(req.body?.fromAmount || 0) || 0;
      const toAmountPhp = Math.max(0, (fromAmt - FIXED_FEE_AED) * FIXED_RATE_AED_PHP);
      const effectiveRate = fromAmt > 0 ? (toAmountPhp / fromAmt).toFixed(6) : '0';
      console.log('AED maintenance fallback: using fixed rate 1 AED =', FIXED_RATE_AED_PHP, 'PHP, fee', FIXED_FEE_AED, 'AED');
      return res.status(200).json({
        status: 1,
        code: 200,
        maintenanceFallback: true,
        maintenanceComment: 'AED maintenance: Onramp API temporarily unavailable, using fixed rate until API returns',
        data: {
          input: {
            fromCurrency: 'AED',
            toCurrency: 'PHP',
            fromAmount: req.body?.fromAmount || '',
            chain: req.body?.chain || '',
            paymentMethodType: req.body?.paymentMethodType || 'AED-BANK-TRANSFER'
          },
          step1: { description: 'AED to USDC (Onramp) - fallback', fromCurrency: 'AED', toCurrency: 'USDC', fromAmount: req.body?.fromAmount, toAmount: null, rate: null, fees: null },
          step2: { description: 'USDC to PHP (Offramp) - fallback', fromCurrency: 'USDC', toCurrency: 'PHP', fromAmount: null, toAmount: null, rate: null, fees: null },
          final: {
            fromCurrency: 'AED',
            toCurrency: 'PHP',
            fromAmount: req.body?.fromAmount || '',
            toAmount: toAmountPhp.toFixed(2),
            effectiveRate,
            totalFees: {
              onramp: [{ type: 'fiat', gatewayFee: String(FIXED_FEE_AED), onrampFee: '0', clientFee: '0', gasFee: '0' }],
              offramp: []
            },
            totalFeeInSenderCurrency: String(FIXED_FEE_AED),
            totalFeeCurrency: 'AED'
          }
        }
      });
    }

    // Handle signature generation errors specifically
    if (error.message.includes('Secret key is required') ||
        error.message.includes('API key is required') ||
        error.message.includes('Missing credentials')) {
      return res.status(500).json({
        error: {
          message: error.message,
          status: 500,
          hint: 'Check that ONRAMP_API_KEY and ONRAMP_SECRET environment variables are set, or that the partner config has valid credentials'
        }
      });
    }

    if (error.response) {
      // API responded with error
      res.status(error.response.status).json({
        error: {
          message: error.response.data?.message || 'Onramp API error',
          status: error.response.status,
          data: error.response.data
        }
      });
    } else if (error.request) {
      // Request made but no response
      res.status(503).json({
        error: {
          message: 'No response from Onramp API',
          status: 503
        }
      });
    } else {
      // Error setting up request
      res.status(500).json({
        error: {
          message: error.message || 'Internal server error',
          status: 500
        }
      });
    }
  }
});

module.exports = router;
