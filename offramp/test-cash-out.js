/**
 * Test script for Cash-Out API endpoint
 * 
 * This script tests the cash-out endpoint by making a direct request
 * to the proxy API, which then forwards it to the partner API.
 * 
 * Usage: node test-cash-out.js
 */

const axios = require('axios');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3002';
const PARTNER_ID = process.env.PARTNER_ID || 'id0001';
const API_BASE = `${BASE_URL}/${PARTNER_ID}`;

// Test data - matches the axios example
const testData = {
  "currency": "PHP",
  "amount": "5",
  "channelName": "INSTAPAY",
  "channelSubject": "bpi",
  "extendInfo": {
    "recipientName": "Rebecah Dausen",
    "recipientAccountNumber": "0566698575"
  }
};

/**
 * Test cash-out endpoint
 */
async function testCashOut() {
  console.log('==========================================');
  console.log('Testing Cash-Out API Endpoint');
  console.log('==========================================');
  console.log('');
  console.log('Configuration:');
  console.log(`  Base URL: ${BASE_URL}`);
  console.log(`  Partner ID: ${PARTNER_ID}`);
  console.log(`  Endpoint: ${API_BASE}/cash-out`);
  console.log('');
  console.log('Request Body:');
  console.log(JSON.stringify(testData, null, 2));
  console.log('');
  console.log('Making request...');
  console.log('');

  try {
    // Make request to proxy API
    // The proxy will handle signature generation and forward to partner API
    const response = await axios.post(
      `${API_BASE}/cash-out`,
      testData,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    console.log('✅ SUCCESS');
    console.log('Status:', response.status);
    console.log('Response:');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('');
    console.log('==========================================');

    return response.data;
  } catch (error) {
    console.log('❌ ERROR');
    console.log('');

    if (error.response) {
      // Server responded with error status
      console.log('Status:', error.response.status);
      console.log('Response Headers:', JSON.stringify(error.response.headers, null, 2));
      console.log('Response Data:', JSON.stringify(error.response.data, null, 2));
      console.log('');
      console.log('Request URL:', error.config?.url);
      console.log('Request Method:', error.config?.method);
      console.log('Request Headers:', JSON.stringify(error.config?.headers, null, 2));
      console.log('Request Data:', error.config?.data);
    } else if (error.request) {
      // Request was made but no response received
      console.log('No response received from server');
      console.log('Request config:', JSON.stringify(error.config, null, 2));
    } else {
      // Error setting up request
      console.log('Error:', error.message);
    }

    console.log('');
    console.log('==========================================');
    throw error;
  }
}

/**
 * Test with direct axios request (for comparison)
 * This matches the exact axios example provided
 */
async function testDirectAxios() {
  console.log('');
  console.log('==========================================');
  console.log('Direct Axios Test (for comparison)');
  console.log('==========================================');
  console.log('');
  console.log('This test shows how the request would look');
  console.log('if made directly to the partner API (with signature)');
  console.log('');
  console.log('Note: This will fail without valid signature/timestamp');
  console.log('It is only for reference to compare request format');
  console.log('');

  // This is just for reference - will fail without valid signature
  const data = JSON.stringify(testData);
  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://api.pro.coins.ph/openapi/fiat/v1/cash-out?signature=INVALID_SIGNATURE_FOR_REFERENCE',
    headers: {
      'X-COINS-APIKEY': 'HRqjJcBxjppZAvVyzZvdxMI95O74jPDYbd2sbGaBecvPIHd6jl4FgHs78wQKNUCE',
      'timestamp': new Date().getTime().toString(),
      'Content-Type': 'application/json'
    },
    data: data
  };

  console.log('Axios Config:');
  console.log(JSON.stringify(config, null, 2));
  console.log('');
  console.log('Data (body):');
  console.log(data);
  console.log('');
  console.log('Data type:', typeof data);
  console.log('Data length:', data.length);
  console.log('');
  console.log('==========================================');
}

// Main execution
(async () => {
  try {
    // Test 1: Test through proxy API (this is what you should use)
    await testCashOut();

    // Test 2: Show direct axios format (for reference only)
    // Uncomment to see the format comparison
    // await testDirectAxios();

  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
})();

