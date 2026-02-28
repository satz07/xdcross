# PHP offramp (XDC ↔ PHP)

XDC ↔ PHP conversion. Include `ref_id=<your_ref_id>` in every request (query or body).

**Base URL:** `https://xdc.cash/api`

---

## Get Quote

**Endpoint:** `POST /get-quote`

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| sourceCurrency | string | Yes | `XDC` |
| targetCurrency | string | Yes | `PHP` |
| sourceAmount | string | Yes | XDC amount |

**cURL**
```bash
curl -X POST "https://xdc.cash/api/get-quote?ref_id=<your_ref_id>&sourceCurrency=XDC&targetCurrency=PHP&sourceAmount=50" \
  -H "X-API-Key: <your-api-key>"
```

**Response**
```json
{
  "quoteId": "20907530396610106886",
  "sourceAmount": "50",
  "targetAmount": "2500",
  "rate": "50",
  "expiresAt": "..."
}
```

---

## Accept Quote

**Endpoint:** `POST /accept-quote`

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| quoteId | string | Yes | Quote ID from get-quote response |

**cURL**
```bash
curl -X POST "https://xdc.cash/api/accept-quote?ref_id=<your_ref_id>&quoteId=20907530396610106886" \
  -H "X-API-Key: <your-api-key>"
```

**Response**
```json
{
  "orderId": "...",
  "status": "pending",
  "depositAddress": "0x..."
}
```

---

## Cash Out

**Endpoint:** `POST /cash-out`

**Content-Type:** `application/json`

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| currency | string | Yes | `PHP` |
| amount | string | Yes | Amount |
| channelName | string | Yes | `INSTAPAY`, `SWIFTPAY_PESONET` |
| channelSubject | string | Yes | `bpi`, `gcash`, etc. |
| extendInfo | object | Yes | Recipient details |
| extendInfo.recipientName | string | Yes | Recipient name |
| extendInfo.recipientAccountNumber | string | Yes | Bank account number |
| internalOrderId | string | No | Your reference ID |

**cURL**
```bash
curl -X POST "https://xdc.cash/api/cash-out" \
  -H "X-API-Key: <your-api-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "ref_id": "<your_ref_id>",
    "internalOrderId": "ord123",
    "currency": "PHP",
    "amount": "50",
    "channelName": "SWIFTPAY_PESONET",
    "channelSubject": "gcash",
    "extendInfo": {
      "recipientName": "Juan Dela Cruz",
      "recipientAccountNumber": "123456789"
    }
  }'
```

**Response**
```json
{
  "orderId": "...",
  "status": "pending",
  "amount": "50",
  "currency": "PHP"
}
```

---

## Get Account

**Endpoint:** `GET /account`

**cURL**
```bash
curl -X GET "https://xdc.cash/api/account?ref_id=<your_ref_id>" \
  -H "X-API-Key: <your-api-key>"
```

**Response**
```json
{
  "accountId": "...",
  "balance": "...",
  "currency": "PHP"
}
```
