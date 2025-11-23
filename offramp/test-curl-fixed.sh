#!/bin/bash

# Fixed curl commands for testing - properly escaped URLs

BASE_URL="http://80.243.180.174:3002"
API_BASE="${BASE_URL}/api/id0001"

echo "=========================================="
echo "Testing Offramp API Endpoints"
echo "=========================================="
echo ""

# Test 1: Get Quote
echo "1. Testing GET-QUOTE endpoint..."
echo "----------------------------------------"
curl -X POST \
  -H "Content-Type: application/json" \
  "${API_BASE}/get-quote?sourceCurrency=XDC&targetCurrency=PHP&sourceAmount=50" \
  | python3 -m json.tool 2>/dev/null || cat
echo ""
echo ""

# Test 2: Accept Quote (requires quoteId from get-quote response)
echo "2. Testing ACCEPT-QUOTE endpoint..."
echo "----------------------------------------"
echo "Note: Replace QUOTE_ID with actual quoteId from get-quote response"
curl -X POST \
  -H "Content-Type: application/json" \
  "${API_BASE}/accept-quote?quoteId=2088568334659666570" \
  | python3 -m json.tool 2>/dev/null || cat
echo ""
echo ""

# Test 3: Cash Out
echo "3. Testing CASH-OUT endpoint..."
echo "----------------------------------------"
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "internalOrderId": "1234",
    "currency": "PHP",
    "amount": "50",
    "channelName": "SWIFTPAY_PESONET",
    "channelSubject": "gcash",
    "extendInfo": {
      "recipientName": "sandy-open-api-test",
      "recipientAccountNumber": "123456789"
    }
  }' \
  "${API_BASE}/cash-out" \
  | python3 -m json.tool 2>/dev/null || cat
echo ""
echo ""

echo "=========================================="
echo "Testing Complete"
echo "=========================================="

