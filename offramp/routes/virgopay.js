/**
 * VirgoPAY API Routes
 * Signed proxy routes for VirgoPAY endpoints.
 */

const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const { getPartner } = require('../config/partners');

const router = express.Router({ mergeParams: true });

function getPartnerFromRequest(req) {
  const partnerId = req.partnerId || req.query.ref_id || (req.body && req.body.ref_id);

  if (!partnerId) {
    throw new Error('ref_id is required. Pass ref_id in query or body (e.g. ref_id=id0003).');
  }

  const partner = getPartner(partnerId);
  if (!partner) {
    throw new Error(`Partner '${partnerId}' not found or not configured`);
  }

  return { partner, partnerId };
}

function buildSigningObject(method, req) {
  const signingObject = {};
  const upperMethod = (method || '').toUpperCase();

  if (upperMethod === 'GET') {
    Object.entries(req.query || {}).forEach(([key, value]) => {
      if (key !== 'ref_id') {
        signingObject[key] = value;
      }
    });
  } else if (['POST', 'PUT', 'PATCH'].includes(upperMethod)) {
    Object.assign(signingObject, req.body || {});
    delete signingObject.ref_id;
  }

  return signingObject;
}

function buildVirgoHeaders(partner, signingObject, countryCodeOverride) {
  const apiKey = partner.apiKey;
  const secret = partner.secret;
  const countryCode = countryCodeOverride || partner.countryCode;
  const timestamp = Math.floor(Date.now() / 1000).toString();

  const payloadObject = { ...signingObject, apiKey, timestamp };
  const payload = JSON.stringify(payloadObject);
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-API-KEY': apiKey,
    'X-TIMESTAMP': timestamp,
    'X-HMAC': signature,
    'COUNTRY-CODE': countryCode
  };
}

function resolveMarketCountryCode(query, partner) {
  const override = query && query.countryCode;
  if (override) {
    return String(override).toUpperCase();
  }

  const type = String((query && query.type) || '');
  const sourceCoin = String((query && query.sourceCoin) || '').toUpperCase();
  const destinationCoin = String((query && query.destinationCoin) || '').toUpperCase();
  const currencyToCountryCode = {
    USD: 'USA',
    INR: 'IND'
  };

  if (type === '1' && currencyToCountryCode[sourceCoin]) {
    return currencyToCountryCode[sourceCoin];
  }

  if (type === '2' && currencyToCountryCode[destinationCoin]) {
    return currencyToCountryCode[destinationCoin];
  }

  return partner.countryCode;
}

function maskVirgoHeaders(headers) {
  return {
    ...headers,
    'X-API-KEY': headers['X-API-KEY'] ? '***' : undefined,
    'X-HMAC': headers['X-HMAC'] ? '***' : undefined
  };
}

/**
 * Create customer (VirgoPAY)
 * POST /api/customer/create
 * Requires ref_id=id0003 in body or query.
 */
router.post('/customer/create', async (req, res) => {
  try {
    const { partner } = getPartnerFromRequest(req);
    const { apiKey, secret, countryCode, baseUrl } = partner;

    if (!apiKey || !secret || !countryCode) {
      return res.status(500).json({
        error: {
          message: 'Missing VirgoPAY credentials. Set VIRGOPAY_API_KEY, VIRGOPAY_SECRET, VIRGOPAY_COUNTRY_CODE.',
          status: 500
        }
      });
    }

    const requestBody = { ...(req.body || {}) };
    delete requestBody.ref_id;

    const signingObject = buildSigningObject('POST', { ...req, body: requestBody });
    const headers = buildVirgoHeaders(partner, signingObject);
    const url = `${baseUrl.replace(/\/+$/, '')}/api/v1/customer/create`;

    const response = await axios.post(url, requestBody, {
      headers,
      timeout: 30000
    });

    return res.status(response.status).json(response.data);
  } catch (error) {
    if (error.message && (error.message.includes('Partner') || error.message.includes('ref_id'))) {
      return res.status(400).json({
        error: {
          message: error.message,
          status: 400
        }
      });
    }

    if (error.response) {
      return res.status(error.response.status).json({
        error: {
          message: error.response.data?.message || 'VirgoPAY API error',
          status: error.response.status,
          data: error.response.data
        }
      });
    }

    return res.status(500).json({
      error: {
        message: error.message || 'Internal server error',
        status: 500
      }
    });
  }
});

/**
 * Get customer by ID (VirgoPAY)
 * GET /api/customer/:customerId
 * Requires ref_id=id0003 in query.
 */
router.get('/customer/:customerId', async (req, res) => {
  try {
    const { partner } = getPartnerFromRequest(req);
    const { apiKey, secret, countryCode, baseUrl } = partner;

    if (!apiKey || !secret || !countryCode) {
      return res.status(500).json({
        error: {
          message: 'Missing VirgoPAY credentials. Set VIRGOPAY_API_KEY, VIRGOPAY_SECRET, VIRGOPAY_COUNTRY_CODE.',
          status: 500
        }
      });
    }

    const signingObject = buildSigningObject('GET', req);
    const headers = buildVirgoHeaders(partner, signingObject);
    const customerId = encodeURIComponent(req.params.customerId);
    const url = `${baseUrl.replace(/\/+$/, '')}/api/v1/customer/${customerId}`;

    const response = await axios.get(url, {
      headers,
      timeout: 30000
    });

    return res.status(response.status).json(response.data);
  } catch (error) {
    if (error.message && (error.message.includes('Partner') || error.message.includes('ref_id'))) {
      return res.status(400).json({
        error: {
          message: error.message,
          status: 400
        }
      });
    }

    if (error.response) {
      return res.status(error.response.status).json({
        error: {
          message: error.response.data?.message || 'VirgoPAY API error',
          status: error.response.status,
          data: error.response.data
        }
      });
    }

    return res.status(500).json({
      error: {
        message: error.message || 'Internal server error',
        status: 500
      }
    });
  }
});

/**
 * Partial update customer (VirgoPAY)
 * POST /api/customer/partial-update
 * Requires ref_id=id0003 in body or query.
 */
router.post('/customer/partial-update', async (req, res) => {
  try {
    const { partner } = getPartnerFromRequest(req);
    const { apiKey, secret, countryCode, baseUrl } = partner;

    if (!apiKey || !secret || !countryCode) {
      return res.status(500).json({
        error: {
          message: 'Missing VirgoPAY credentials. Set VIRGOPAY_API_KEY, VIRGOPAY_SECRET, VIRGOPAY_COUNTRY_CODE.',
          status: 500
        }
      });
    }

    const requestBody = { ...(req.body || {}) };
    delete requestBody.ref_id;

    const signingObject = buildSigningObject('POST', { ...req, body: requestBody });
    const headers = buildVirgoHeaders(partner, signingObject);
    const url = `${baseUrl.replace(/\/+$/, '')}/api/v1/customer/partial-update`;

    const response = await axios.post(url, requestBody, {
      headers,
      timeout: 30000
    });

    return res.status(response.status).json(response.data);
  } catch (error) {
    if (error.message && (error.message.includes('Partner') || error.message.includes('ref_id'))) {
      return res.status(400).json({
        error: {
          message: error.message,
          status: 400
        }
      });
    }

    if (error.response) {
      return res.status(error.response.status).json({
        error: {
          message: error.response.data?.message || 'VirgoPAY API error',
          status: error.response.status,
          data: error.response.data
        }
      });
    }

    return res.status(500).json({
      error: {
        message: error.message || 'Internal server error',
        status: 500
      }
    });
  }
});

/**
 * Full update customer (VirgoPAY)
 * POST /api/customer/update
 * Requires ref_id=id0003 in body or query.
 */
router.post('/customer/update', async (req, res) => {
  try {
    const { partner } = getPartnerFromRequest(req);
    const { apiKey, secret, countryCode, baseUrl } = partner;

    if (!apiKey || !secret || !countryCode) {
      return res.status(500).json({
        error: {
          message: 'Missing VirgoPAY credentials. Set VIRGOPAY_API_KEY, VIRGOPAY_SECRET, VIRGOPAY_COUNTRY_CODE.',
          status: 500
        }
      });
    }

    const requestBody = { ...(req.body || {}) };
    delete requestBody.ref_id;

    const signingObject = buildSigningObject('POST', { ...req, body: requestBody });
    const headers = buildVirgoHeaders(partner, signingObject);
    const url = `${baseUrl.replace(/\/+$/, '')}/api/v1/customer/update`;

    const response = await axios.post(url, requestBody, {
      headers,
      timeout: 30000
    });

    return res.status(response.status).json(response.data);
  } catch (error) {
    if (error.message && (error.message.includes('Partner') || error.message.includes('ref_id'))) {
      return res.status(400).json({
        error: {
          message: error.message,
          status: 400
        }
      });
    }

    if (error.response) {
      return res.status(error.response.status).json({
        error: {
          message: error.response.data?.message || 'VirgoPAY API error',
          status: error.response.status,
          data: error.response.data
        }
      });
    }

    return res.status(500).json({
      error: {
        message: error.message || 'Internal server error',
        status: 500
      }
    });
  }
});

/**
 * Create fiat account (VirgoPAY)
 * POST /api/fiatAccount
 * Requires ref_id=id0003 in body or query.
 */
router.post('/fiatAccount', async (req, res) => {
  try {
    const { partner } = getPartnerFromRequest(req);
    const { apiKey, secret, countryCode, baseUrl } = partner;

    if (!apiKey || !secret || !countryCode) {
      return res.status(500).json({
        error: {
          message: 'Missing VirgoPAY credentials. Set VIRGOPAY_API_KEY, VIRGOPAY_SECRET, VIRGOPAY_COUNTRY_CODE.',
          status: 500
        }
      });
    }

    const requestBody = { ...(req.body || {}) };
    delete requestBody.ref_id;

    const signingObject = buildSigningObject('POST', { ...req, body: requestBody });
    const headers = buildVirgoHeaders(partner, signingObject);
    const url = `${baseUrl.replace(/\/+$/, '')}/api/v1/fiatAccount`;

    const response = await axios.post(url, requestBody, {
      headers,
      timeout: 30000
    });

    return res.status(response.status).json(response.data);
  } catch (error) {
    if (error.message && (error.message.includes('Partner') || error.message.includes('ref_id'))) {
      return res.status(400).json({
        error: {
          message: error.message,
          status: 400
        }
      });
    }

    if (error.response) {
      return res.status(error.response.status).json({
        error: {
          message: error.response.data?.message || 'VirgoPAY API error',
          status: error.response.status,
          data: error.response.data
        }
      });
    }

    return res.status(500).json({
      error: {
        message: error.message || 'Internal server error',
        status: 500
      }
    });
  }
});

/**
 * List fiat accounts (VirgoPAY)
 * GET /api/fiatAccount
 * Requires ref_id=id0003 and customerId in query.
 */
router.get('/fiatAccount', async (req, res) => {
  try {
    const { partner } = getPartnerFromRequest(req);
    const { apiKey, secret, countryCode, baseUrl } = partner;

    if (!apiKey || !secret || !countryCode) {
      return res.status(500).json({
        error: {
          message: 'Missing VirgoPAY credentials. Set VIRGOPAY_API_KEY, VIRGOPAY_SECRET, VIRGOPAY_COUNTRY_CODE.',
          status: 500
        }
      });
    }

    const signingObject = buildSigningObject('GET', req);
    const headers = buildVirgoHeaders(partner, signingObject);
    const url = `${baseUrl.replace(/\/+$/, '')}/api/v1/fiatAccount`;
    const params = { ...(req.query || {}) };
    delete params.ref_id;

    const response = await axios.get(url, {
      headers,
      params,
      timeout: 30000
    });

    return res.status(response.status).json(response.data);
  } catch (error) {
    if (error.message && (error.message.includes('Partner') || error.message.includes('ref_id'))) {
      return res.status(400).json({
        error: {
          message: error.message,
          status: 400
        }
      });
    }

    if (error.response) {
      return res.status(error.response.status).json({
        error: {
          message: error.response.data?.message || 'VirgoPAY API error',
          status: error.response.status,
          data: error.response.data
        }
      });
    }

    return res.status(500).json({
      error: {
        message: error.message || 'Internal server error',
        status: 500
      }
    });
  }
});

/**
 * Delete fiat account (VirgoPAY)
 * POST /api/fiatAccount/delete/:fiatAccountId
 * Requires ref_id=id0003 in query.
 */
router.post('/fiatAccount/delete/:fiatAccountId', async (req, res) => {
  try {
    const { partner } = getPartnerFromRequest(req);
    const { apiKey, secret, countryCode, baseUrl } = partner;

    if (!apiKey || !secret || !countryCode) {
      return res.status(500).json({
        error: {
          message: 'Missing VirgoPAY credentials. Set VIRGOPAY_API_KEY, VIRGOPAY_SECRET, VIRGOPAY_COUNTRY_CODE.',
          status: 500
        }
      });
    }

    const signingObject = buildSigningObject('POST', req);
    const headers = buildVirgoHeaders(partner, signingObject);
    const fiatAccountId = encodeURIComponent(req.params.fiatAccountId);
    const url = `${baseUrl.replace(/\/+$/, '')}/api/v1/fiatAccount/delete/${fiatAccountId}`;

    const response = await axios.post(url, null, {
      headers,
      timeout: 30000
    });

    return res.status(response.status).json(response.data);
  } catch (error) {
    if (error.message && (error.message.includes('Partner') || error.message.includes('ref_id'))) {
      return res.status(400).json({
        error: {
          message: error.message,
          status: 400
        }
      });
    }

    if (error.response) {
      return res.status(error.response.status).json({
        error: {
          message: error.response.data?.message || 'VirgoPAY API error',
          status: error.response.status,
          data: error.response.data
        }
      });
    }

    return res.status(500).json({
      error: {
        message: error.message || 'Internal server error',
        status: 500
      }
    });
  }
});

/**
 * Create onramp transfer (VirgoPAY)
 * POST /api/transfer/onramp
 * Requires ref_id=id0003 in body or query.
 */
router.post('/transfer/onramp', async (req, res) => {
  try {
    const { partner } = getPartnerFromRequest(req);
    const { apiKey, secret, countryCode, baseUrl } = partner;

    if (!apiKey || !secret || !countryCode) {
      return res.status(500).json({
        error: {
          message: 'Missing VirgoPAY credentials. Set VIRGOPAY_API_KEY, VIRGOPAY_SECRET, VIRGOPAY_COUNTRY_CODE.',
          status: 500
        }
      });
    }

    const requestBody = { ...(req.body || {}) };
    delete requestBody.ref_id;

    const signingObject = buildSigningObject('POST', { ...req, body: requestBody });
    const headers = buildVirgoHeaders(partner, signingObject);
    const url = `${baseUrl.replace(/\/+$/, '')}/api/v1/transfer/onramp`;

    const response = await axios.post(url, requestBody, {
      headers,
      timeout: 30000
    });

    return res.status(response.status).json(response.data);
  } catch (error) {
    if (error.message && (error.message.includes('Partner') || error.message.includes('ref_id'))) {
      return res.status(400).json({
        error: {
          message: error.message,
          status: 400
        }
      });
    }

    if (error.response) {
      return res.status(error.response.status).json({
        error: {
          message: error.response.data?.message || 'VirgoPAY API error',
          status: error.response.status,
          data: error.response.data
        }
      });
    }

    return res.status(500).json({
      error: {
        message: error.message || 'Internal server error',
        status: 500
      }
    });
  }
});

/**
 * Create offramp transfer (VirgoPAY)
 * POST /api/transfer/offramp
 * Requires ref_id=id0003 in body or query.
 */
router.post('/transfer/offramp', async (req, res) => {
  try {
    const { partner } = getPartnerFromRequest(req);
    const { apiKey, secret, countryCode, baseUrl } = partner;

    if (!apiKey || !secret || !countryCode) {
      return res.status(500).json({
        error: {
          message: 'Missing VirgoPAY credentials. Set VIRGOPAY_API_KEY, VIRGOPAY_SECRET, VIRGOPAY_COUNTRY_CODE.',
          status: 500
        }
      });
    }

    const requestBody = { ...(req.body || {}) };
    delete requestBody.ref_id;

    const signingObject = buildSigningObject('POST', { ...req, body: requestBody });
    const headers = buildVirgoHeaders(partner, signingObject);
    const url = `${baseUrl.replace(/\/+$/, '')}/api/v1/transfer/offramp`;

    const response = await axios.post(url, requestBody, {
      headers,
      timeout: 30000
    });

    return res.status(response.status).json(response.data);
  } catch (error) {
    if (error.message && (error.message.includes('Partner') || error.message.includes('ref_id'))) {
      return res.status(400).json({
        error: {
          message: error.message,
          status: 400
        }
      });
    }

    if (error.response) {
      return res.status(error.response.status).json({
        error: {
          message: error.response.data?.message || 'VirgoPAY API error',
          status: error.response.status,
          data: error.response.data
        }
      });
    }

    return res.status(500).json({
      error: {
        message: error.message || 'Internal server error',
        status: 500
      }
    });
  }
});

/**
 * Get transfer detail (VirgoPAY)
 * GET /api/transfer/detail
 * Requires ref_id=id0003 and transferId in query.
 */
router.get('/transfer/detail', async (req, res) => {
  try {
    const { partner } = getPartnerFromRequest(req);
    const { apiKey, secret, countryCode, baseUrl } = partner;

    if (!apiKey || !secret || !countryCode) {
      return res.status(500).json({
        error: {
          message: 'Missing VirgoPAY credentials. Set VIRGOPAY_API_KEY, VIRGOPAY_SECRET, VIRGOPAY_COUNTRY_CODE.',
          status: 500
        }
      });
    }

    const signingObject = buildSigningObject('GET', req);
    const headers = buildVirgoHeaders(partner, signingObject);
    const url = `${baseUrl.replace(/\/+$/, '')}/api/v1/transfer/detail`;
    const params = { ...(req.query || {}) };
    delete params.ref_id;

    const response = await axios.get(url, {
      headers,
      params,
      timeout: 30000
    });

    return res.status(response.status).json(response.data);
  } catch (error) {
    if (error.message && (error.message.includes('Partner') || error.message.includes('ref_id'))) {
      return res.status(400).json({
        error: {
          message: error.message,
          status: 400
        }
      });
    }

    if (error.response) {
      return res.status(error.response.status).json({
        error: {
          message: error.response.data?.message || 'VirgoPAY API error',
          status: error.response.status,
          data: error.response.data
        }
      });
    }

    return res.status(500).json({
      error: {
        message: error.message || 'Internal server error',
        status: 500
      }
    });
  }
});

/**
 * List transfers (VirgoPAY)
 * GET /api/transfer
 * Requires ref_id=id0003. Supports same query params as VirgoPAY (id, customerId, type, status, page, size, countryCode, etc.).
 */
router.get('/transfer', async (req, res) => {
  try {
    const { partner } = getPartnerFromRequest(req);
    const { apiKey, secret, countryCode, baseUrl } = partner;

    if (!apiKey || !secret || !countryCode) {
      return res.status(500).json({
        error: {
          message: 'Missing VirgoPAY credentials. Set VIRGOPAY_API_KEY, VIRGOPAY_SECRET, VIRGOPAY_COUNTRY_CODE.',
          status: 500
        }
      });
    }

    const signingObject = buildSigningObject('GET', req);
    const headers = buildVirgoHeaders(partner, signingObject);
    const url = `${baseUrl.replace(/\/+$/, '')}/api/v1/transfer`;
    const params = { ...(req.query || {}) };
    delete params.ref_id;

    const response = await axios.get(url, {
      headers,
      params,
      timeout: 30000
    });

    return res.status(response.status).json(response.data);
  } catch (error) {
    if (error.message && (error.message.includes('Partner') || error.message.includes('ref_id'))) {
      return res.status(400).json({
        error: {
          message: error.message,
          status: 400
        }
      });
    }

    if (error.response) {
      return res.status(error.response.status).json({
        error: {
          message: error.response.data?.message || 'VirgoPAY API error',
          status: error.response.status,
          data: error.response.data
        }
      });
    }

    return res.status(500).json({
      error: {
        message: error.message || 'Internal server error',
        status: 500
      }
    });
  }
});

/**
 * List market pairs (VirgoPAY)
 * GET /api/market/list
 * Requires ref_id=id0003. Example query: sourceCoin, destinationCoin, type.
 */
router.get('/market/list', async (req, res) => {
  try {
    const { partner } = getPartnerFromRequest(req);
    const { apiKey, secret, countryCode, baseUrl } = partner;

    if (!apiKey || !secret || !countryCode) {
      return res.status(500).json({
        error: {
          message: 'Missing VirgoPAY credentials. Set VIRGOPAY_API_KEY, VIRGOPAY_SECRET, VIRGOPAY_COUNTRY_CODE.',
          status: 500
        }
      });
    }

    const params = { ...(req.query || {}) };
    delete params.ref_id;
    const missingFields = ['sourceCoin', 'destinationCoin', 'type'].filter((k) => !params[k]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: {
          message: `Missing required query params: ${missingFields.join(', ')}`,
          status: 400
        }
      });
    }

    if (!['1', '2'].includes(String(params.type))) {
      return res.status(400).json({
        error: {
          message: "Invalid 'type'. Allowed values: 1 (onramp), 2 (offramp)",
          status: 400
        }
      });
    }

    const signingObject = buildSigningObject('GET', req);
    const marketCountryCode = resolveMarketCountryCode(req.query, partner);
    const headers = buildVirgoHeaders(partner, signingObject, marketCountryCode);
    const url = `${baseUrl.replace(/\/+$/, '')}/api/v1/market/list`;
    const outgoingHeaders = maskVirgoHeaders(headers);

    console.log('[virgopay/market/list] inbound query:', req.query);
    console.log('[virgopay/market/list] resolved country code:', marketCountryCode);
    console.log('[virgopay/market/list] signing object:', signingObject);
    console.log('[virgopay/market/list] outbound url:', url);
    console.log('[virgopay/market/list] outbound params:', params);
    console.log('[virgopay/market/list] outbound headers:', outgoingHeaders);

    const response = await axios.get(url, {
      headers,
      params,
      timeout: 30000
    });

    const rowCount = Array.isArray(response.data?.data) ? response.data.data.length : null;
    console.log('[virgopay/market/list] upstream status:', response.status);
    console.log('[virgopay/market/list] upstream rowCount:', rowCount);
    if (rowCount === 0) {
      console.warn('[virgopay/market/list] upstream returned empty data array');
    }

    return res.status(response.status).json(response.data);
  } catch (error) {
    if (error.message && (error.message.includes('Partner') || error.message.includes('ref_id'))) {
      return res.status(400).json({
        error: {
          message: error.message,
          status: 400
        }
      });
    }

    if (error.response) {
      console.error('[virgopay/market/list] upstream error status:', error.response.status);
      console.error('[virgopay/market/list] upstream error data:', error.response.data);
      return res.status(error.response.status).json({
        error: {
          message: error.response.data?.message || 'VirgoPAY API error',
          status: error.response.status,
          data: error.response.data
        }
      });
    }

    return res.status(500).json({
      error: {
        message: error.message || 'Internal server error',
        status: 500
      }
    });
  }
});

module.exports = router;

