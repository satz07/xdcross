# Curl Commands for All Endpoints

## Base URL
Replace `BASE_URL` with your server URL:
- Local: `http://localhost:3002`
- Production: `https://xdc.cash` (via Nginx)
- Direct: `http://80.243.180.174:3002`

## 1. Get Quote

```bash
curl -X POST "http://localhost:3002/api/id0001/get-quote?sourceCurrency=XDC&targetCurrency=PHP&sourceAmount=50"
```

**With variables:**
```bash
BASE_URL="http://localhost:3002"
curl -X POST "${BASE_URL}/api/id0001/get-quote?sourceCurrency=XDC&targetCurrency=PHP&sourceAmount=50"
```

## 2. Accept Quote

**Note:** Replace `QUOTE_ID` with the actual `quoteId` from get-quote response.

```bash
curl -X POST "http://localhost:3002/api/id0001/accept-quote?quoteId=20907530396610106886"
```

**With variables:**
```bash
BASE_URL="http://localhost:3002"
QUOTE_ID="20907530396610106886"
curl -X POST "${BASE_URL}/api/id0001/accept-quote?quoteId=${QUOTE_ID}"
```

## 3. Cash Out

**Simple example (matching test-cash-out.js):**
```bash
curl -X POST \
  -d '{"currency":"PHP","amount":"5","channelName":"INSTAPAY","channelSubject":"bpi","extendInfo":{"recipientName":"Rebecah Dausen","recipientAccountNumber":"0566698575"}}' \
  "http://localhost:3002/api/id0001/cash-out"
```

**With internalOrderId:**
```bash
curl -X POST \
  -d '{"internalOrderId":"1234","currency":"PHP","amount":"50","channelName":"SWIFTPAY_PESONET","channelSubject":"gcash","extendInfo":{"recipientName":"sandy-open-api-test","recipientAccountNumber":"123456789"}}' \
  "http://localhost:3002/api/id0001/cash-out"
```

**With variables:**
```bash
BASE_URL="http://localhost:3002"
curl -X POST \
  -d '{"currency":"PHP","amount":"5","channelName":"INSTAPAY","channelSubject":"bpi","extendInfo":{"recipientName":"Rebecah Dausen","recipientAccountNumber":"0566698575"}}' \
  "${BASE_URL}/api/id0001/cash-out"
```

## 4. Get Account

```bash
curl -X GET "http://localhost:3002/api/id0001/account"
```

**With variables:**
```bash
BASE_URL="http://localhost:3002"
curl -X GET "${BASE_URL}/api/id0001/account"
```

## Single Line Commands (Copy-Paste Ready)

### Get Quote
```bash
curl -X POST "http://localhost:3002/api/id0001/get-quote?sourceCurrency=XDC&targetCurrency=PHP&sourceAmount=50"
```

### Accept Quote
```bash
curl -X POST "http://localhost:3002/api/id0001/accept-quote?quoteId=20907530396610106886"
```

### Cash Out
```bash
# Simple format (matching test-cash-out.js)
curl -X POST -d '{"currency":"PHP","amount":"5","channelName":"INSTAPAY","channelSubject":"bpi","extendInfo":{"recipientName":"Rebecah Dausen","recipientAccountNumber":"0566698575"}}' "http://localhost:3002/api/id0001/cash-out"
```

### Get Account
```bash
curl -X GET "http://localhost:3002/api/id0001/account"
```

## Production URLs (via Nginx)

### Get Quote
```bash
curl -X POST "https://xdc.cash/api/id0001/get-quote?sourceCurrency=XDC&targetCurrency=PHP&sourceAmount=50"
```

### Accept Quote
```bash
curl -X POST "https://xdc.cash/api/id0001/accept-quote?quoteId=20907530396610106886"
```

### Cash Out
```bash
curl -X POST -d '{"internalOrderId":"1234","currency":"PHP","amount":"50","channelName":"SWIFTPAY_PESONET","channelSubject":"gcash","extendInfo":{"recipientName":"sandy-open-api-test","recipientAccountNumber":"123456789"}}' "https://xdc.cash/api/id0001/cash-out"
```

### Get Account
```bash
curl -X GET "https://xdc.cash/api/id0001/account"
```

## Notes

- **No Content-Type header needed** - Server handles it automatically (except for cash-out which requires it)
- **Partner ID** (`id0001`) is extracted from URL path
- **Methods**: Most endpoints use POST, account endpoint uses GET
- **Signature generation is automatic** - No need to configure

## Testing Script

Save as `test-all.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3002"
API_BASE="${BASE_URL}/api/id0001"

echo "Testing Get Quote..."
curl -X POST "${API_BASE}/get-quote?sourceCurrency=XDC&targetCurrency=PHP&sourceAmount=50"
echo ""
echo ""

echo "Testing Accept Quote..."
QUOTE_ID="20907530396610106886"
curl -X POST "${API_BASE}/accept-quote?quoteId=${QUOTE_ID}"
echo ""
echo ""

echo "Testing Cash Out..."
curl -X POST \
  -d '{"internalOrderId":"1234","currency":"PHP","amount":"50","channelName":"SWIFTPAY_PESONET","channelSubject":"gcash","extendInfo":{"recipientName":"sandy-open-api-test","recipientAccountNumber":"123456789"}}' \
  "${API_BASE}/cash-out"
echo ""
```

Make it executable:
```bash
chmod +x test-all.sh
./test-all.sh
```

