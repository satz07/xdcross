# Postman Collection Setup Guide

## Import Collection

1. Open Postman
2. Click **Import** button (top left)
3. Select **File** tab
4. Choose `Offramp_API.postman_collection.json`
5. Click **Import**

## Configure Variables

After importing, configure the collection variables:

1. Click on the collection name: **Offramp API Proxy**
2. Click on **Variables** tab
3. Update these variables:

### Required Variables

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `base_url` | Your API server URL | `http://localhost:3002` or `https://your-server.com` |
| `partner_id` | Partner ID from URL path | `id0001` |

### Optional Variables (with defaults)

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `source_currency` | Source currency code | `XDC` |
| `target_currency` | Target currency code | `PHP` |
| `source_amount` | Amount to convert | `50` |
| `quote_id` | Quote ID from get-quote response | `2088568334659666570` |
| `internal_order_id` | Internal order ID for cash-out | `1234` |
| `currency` | Currency for cash-out | `PHP` |
| `amount` | Amount for cash-out | `50` |
| `channel_name` | Channel name for cash-out | `SWIFTPAY_PESONET` |
| `channel_subject` | Channel subject for cash-out | `gcash` |
| `recipient_name` | Recipient name for cash-out | `sandy-open-api-test` |
| `recipient_account_number` | Recipient account number | `123456789` |

## Using the Collection

### 1. Get Quote

1. Select **Get Quote** request
2. Update query parameters if needed:
   - `sourceCurrency`: Source currency (e.g., XDC, BTC, ETH)
   - `targetCurrency`: Target currency (e.g., PHP, USD)
   - `sourceAmount`: Amount to convert
3. Click **Send**
4. Copy the `quoteId` from the response for the next request

### 2. Accept Quote

1. Select **Accept Quote** request
2. Update `quoteId` variable with the value from get-quote response
3. Click **Send**

### 3. Cash Out

1. Select **Cash Out** request
2. Update the request body variables as needed:
   - `internalOrderId`: Your internal order ID
   - `currency`: Currency code
   - `amount`: Amount
   - `channelName`: Payment channel
   - `channelSubject`: Channel subject
   - `extendInfo.recipientName`: Recipient name
   - `extendInfo.recipientAccountNumber`: Recipient account number
3. Click **Send**

## Notes

- **No signature generation needed!** The proxy automatically handles:
  - Timestamp generation
  - HMAC SHA256 signature generation
  - Partner API key/secret management

- **Partner ID** is extracted from the URL path:
  - `/api/id0001/get-quote` → partner ID is `id0001`
  - `/api/id0002/get-quote` → partner ID is `id0002`

- **All endpoints use POST method**

- **Content-Type** is automatically set to `application/json`

## Example Responses

### Get Quote Response
```json
{
  "success": true,
  "data": {
    "quoteId": "2088568334659666570",
    "sourceCurrency": "XDC",
    "targetCurrency": "PHP",
    "sourceAmount": "50",
    "targetAmount": "2500.00",
    "rate": "50.00"
  }
}
```

### Accept Quote Response
```json
{
  "success": true,
  "data": {
    "orderId": "order-123",
    "status": "pending"
  }
}
```

### Cash Out Response
```json
{
  "success": true,
  "data": {
    "transactionId": "txn-123",
    "status": "processing"
  }
}
```

## Troubleshooting

- **404 Not Found**: Check that `base_url` and `partner_id` are correct
- **400 Bad Request**: Verify query parameters are correct
- **500 Internal Server Error**: Check server logs for details

