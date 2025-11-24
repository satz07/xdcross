#!/bin/bash

# Test script for all API endpoints
# Usage: ./test-all.sh

BASE_URL="http://localhost:3002"
API_BASE="${BASE_URL}/api/id0001"

echo "=========================================="
echo "Testing All API Endpoints"
echo "=========================================="
echo ""

# Test 1: Get Quote
echo "1. Testing GET-QUOTE endpoint..."
echo "----------------------------------------"
GET_QUOTE_RESPONSE=$(curl -s -X POST "${API_BASE}/get-quote?sourceCurrency=XDC&targetCurrency=PHP&sourceAmount=50")
echo "$GET_QUOTE_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$GET_QUOTE_RESPONSE"
echo ""
echo ""

# Extract quoteId from get-quote response
# Response structure: {"success":true,"data":{"status":0,"error":"OK","data":{"quoteId":"...",...}}}
QUOTE_ID=$(echo "$GET_QUOTE_RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('data', {}).get('data', {}).get('quoteId', ''))" 2>/dev/null)

if [ -z "$QUOTE_ID" ] || [ "$QUOTE_ID" == "None" ]; then
    echo "⚠️  Warning: Could not extract quoteId from get-quote response"
    echo "Response was: $GET_QUOTE_RESPONSE"
    echo ""
    QUOTE_ID="20907530396610106886"  # Fallback
    echo "Using fallback quoteId: $QUOTE_ID"
else
    echo "✅ Extracted quoteId: $QUOTE_ID"
fi
echo ""

# Test 2: Accept Quote (using quoteId from get-quote response)
echo "2. Testing ACCEPT-QUOTE endpoint..."
echo "----------------------------------------"
echo "Using quoteId from get-quote: $QUOTE_ID"
ACCEPT_QUOTE_RESPONSE=$(curl -s -X POST "${API_BASE}/accept-quote?quoteId=${QUOTE_ID}")
echo "$ACCEPT_QUOTE_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$ACCEPT_QUOTE_RESPONSE"
echo ""
echo ""

# Test 3: Cash Out
echo "3. Testing CASH-OUT endpoint..."
echo "----------------------------------------"
curl -X POST \
  -d '{"internalOrderId":"1234","currency":"PHP","amount":"50","channelName":"SWIFTPAY_PESONET","channelSubject":"gcash","extendInfo":{"recipientName":"Rebecah Dausen","recipientAccountNumber":"0566698575"}}' \
  "${API_BASE}/cash-out"
echo ""
echo ""

echo "=========================================="
echo "Testing Complete"
echo "=========================================="

