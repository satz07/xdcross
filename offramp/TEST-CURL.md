# Test Curl Commands

## 1. Get Quote

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  "http://localhost:3002/api/id0001/get-quote?sourceCurrency=XDC&targetCurrency=PHP&sourceAmount=50"
```

**Note:** Partner ID (`id0001`) is automatically extracted from the URL path.

## 2. Accept Quote

**Note:** Replace `QUOTE_ID` with the actual `quoteId` from the get-quote response.

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  "http://localhost:3002/api/id0001/accept-quote?quoteId=2088568334659666570"
```

**Note:** Partner ID (`id0001`) is automatically extracted from the URL path.

## 3. Cash Out

```bash
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
  "http://localhost:3002/api/id0001/cash-out"
```

**Note:** Partner ID (`id0001`) is automatically extracted from the URL path.

## Testing All Endpoints

Run the test script:
```bash
./test-endpoints.sh
```

## Notes

- Default port: `3002` (check your `.env` file)
- Partner ID is automatically extracted from URL path: `/api/{partnerId}/...`
  - Example: `/api/id0001/get-quote` → partner ID is `id0001`
  - Example: `/api/id0002/get-quote` → partner ID is `id0002`
- No need to send partner ID in query params or headers
- Make sure server is running: `PORT=3002 node server.js`

