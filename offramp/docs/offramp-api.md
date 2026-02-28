# Offramp Operations

Convert USDC (XDC) to fiat (PHP). All endpoints use partner ID `id0002`.

**Base URL:** `https://xdc.cash/api/id0002`

---

## Get Quote

Fetch conversion rate and quote for USDC → PHP.

**Endpoint:** `POST /offramp/quote`

**Request**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| fromCurrency | string | Yes | `USDC` |
| toCurrency | string | Yes | `PHP` |
| fromAmount | string | Yes | USDC amount to sell |
| chain | string | Yes | `XDC` |

**cURL**
```bash
curl -X POST "https://xdc.cash/api/id0002/offramp/quote" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "fromCurrency=USDC&toCurrency=PHP&fromAmount=5&chain=XDC"
```

**Response**
```json
{
  "status": 1,
  "code": 200,
  "data": {
    "fromCurrency": "USDC",
    "toCurrency": "PHP",
    "fromAmount": "5",
    "toAmount": "269.78",
    "rate": "57.627",
    "fees": [
      {
        "type": "fiat",
        "onrampFee": "0",
        "gatewayFee": "21",
        "clientFee": "0",
        "tdsFee": "0"
      }
    ]
  }
}
```

---

## Create Transaction

Initiate an offramp (sell) transaction. Use values from the quote response.

**Endpoint:** `POST /offramp/createTransaction`

**Request**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| chain | string | Yes | `XDC` |
| fromCurrency | string | Yes | `USDC` |
| toCurrency | string | Yes | `PHP` |
| fromAmount | string | Yes | USDC amount |
| toAmount | string | Yes | PHP amount (from quote) |
| rate | string | Yes | Rate (from quote) |
| customerId | string | Yes | Customer ID |
| fiatAccountId | string | Yes | Recipient bank account ID |
| merchantRecognitionId | string | No | Your reference ID |

**cURL**
```bash
curl -X POST "https://xdc.cash/api/id0002/offramp/createTransaction" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "chain=XDC&customerId=O2FYxMiaeX_79613&fiatAccountId=123456789&fromAmount=5&fromCurrency=USDC&rate=58.3023&toAmount=269.78&toCurrency=PHP&merchantRecognitionId=ref123"
```

**Response**
```json
{
  "status": 1,
  "code": 200,
  "data": {
    "transactionId": "443468",
    "status": "pending",
    "fromAmount": "5",
    "toAmount": "269.78",
    "fromCurrency": "USDC",
    "toCurrency": "PHP",
    "depositAddress": "0x..."
  }
}
```

---

## Get Transaction

Fetch a single offramp transaction by ID.

**Endpoint:** `POST /offramp/transaction`

**Request**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| transactionId | string | Yes | Transaction ID |
| customerId | string | Yes | Customer ID |

**cURL**
```bash
curl -X POST "https://xdc.cash/api/id0002/offramp/transaction" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "customerId=3u1YBqhoi3_82586&transactionId=443468"
```

**Response**
```json
{
  "status": 1,
  "code": 200,
  "data": {
    "transactionId": "443468",
    "status": "completed",
    "fromCurrency": "USDC",
    "toCurrency": "PHP",
    "fromAmount": "5",
    "toAmount": "269.78",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

## Get All User Transactions

List all offramp transactions for a customer.

**Endpoint:** `POST /offramp/allUserTransaction`

**Request**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| customerId | string | Yes | Customer ID |
| page | string | No | Page number (default: 1) |
| pageSize | string | No | Items per page (default: 20) |

**cURL**
```bash
curl -X POST "https://xdc.cash/api/id0002/offramp/allUserTransaction" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "customerId=O2FYxMiaeX_79613&page=1&pageSize=20"
```

**Response**
```json
{
  "status": 1,
  "code": 200,
  "data": {
    "list": [...],
    "total": 5,
    "page": 1,
    "pageSize": 20
  }
}
```
