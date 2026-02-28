# Coins.ph API

XDC ↔ PHP conversion via Coins.ph. Uses partner ID `id0001`.

**Base URL:** `https://xdc.cash/api/id0001`

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
curl -X POST "https://xdc.cash/api/id0001/get-quote?sourceCurrency=XDC&targetCurrency=PHP&sourceAmount=50"
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
curl -X POST "https://xdc.cash/api/id0001/accept-quote?quoteId=20907530396610106886"
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
curl -X POST "https://xdc.cash/api/id0001/cash-out" \
  -H "Content-Type: application/json" \
  -d '{
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
curl -X GET "https://xdc.cash/api/id0001/account"
```

**Response**
```json
{
  "accountId": "...",
  "balance": "...",
  "currency": "PHP"
}
```
