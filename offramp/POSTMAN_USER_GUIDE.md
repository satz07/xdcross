# Offramp API Proxy - Postman User Guide

#### Get Quote

1. Select **"Get Quote"** request
2. Update query parameters if needed (or use variables)
3. Copy the `quoteId` from the response for the next step

**Example Response:**
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

#### Accept Quote

1. Select **"Accept Quote"** request
2. Update the `quote_id` variable with the `quoteId` from Get Quote response

**Example Response:**
{
  "success": true,
  "data": {
    "orderId": "order-123",
    "status": "pending"
  }
}


#### Cash Out

1. Select **"Cash Out"** request
2. Update the request body variables:
   - `internal_order_id`: Your internal order ID
   - `currency`: Currency code (e.g., `PHP`)
   - `amount`: Amount
   - `channel_name`: Payment channel (e.g., `SWIFTPAY_PESONET`, `INSTAPAY`)
   - `channel_subject`: Channel subject (e.g., `gcash`, `bpi`)
   - `recipient_name`: Recipient name
   - `recipient_account_number`: Recipient account number

**Example Response:**
{
  "success": true,
  "data": {
    "transactionId": "txn-123",
    "status": "processing"
  }
}
