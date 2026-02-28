# Onramp Operations

Convert fiat (AED, INR) to USDC on the XDC chain. All endpoints use partner ID `id0002`.

**Base URL:** `https://xdc.cash/api/id0002`

---

## Get Quote

Fetch conversion rate and quote for fiat → USDC.

**Endpoint:** `POST /onramp/quote`

**Request**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| fromCurrency | string | Yes | Source fiat: `AED`, `INR` |
| toCurrency | string | Yes | Target: `USDC` |
| fromAmount | string | Yes | Amount to convert |
| chain | string | Yes | `XDC` |
| paymentMethodType | string | Yes | `AED-BANK-TRANSFER` (UAE) or `UPI`, `IMPS` (India) |

**cURL**
```bash
curl -X POST "https://xdc.cash/api/id0002/onramp/quote" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "fromCurrency=AED&toCurrency=USDC&fromAmount=200&chain=XDC&paymentMethodType=AED-BANK-TRANSFER"
```

**Response**
```json
{
  "status": 1,
  "code": 200,
  "data": {
    "fromCurrency": "AED",
    "toCurrency": "USDC",
    "fromAmount": "200",
    "toAmount": "51.11",
    "rate": "3.7486",
    "fees": [
      {
        "type": "fiat",
        "onrampFee": "0",
        "clientFee": "0",
        "gatewayFee": "2.5",
        "gasFee": "0"
      }
    ]
  }
}
```

---

## Create Transaction

Initiate an onramp transaction. Use values from the quote response.

**Endpoint:** `POST /onramp/createTransaction`

**Request**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| chain | string | Yes | `XDC` |
| fromCurrency | string | Yes | `AED` or `INR` |
| toCurrency | string | Yes | `USDC` |
| fromAmount | string | Yes | Fiat amount |
| toAmount | string | Yes | USDC amount (from quote) |
| rate | string | Yes | Rate (from quote) |
| paymentMethodType | string | Yes | Payment method |
| depositAddress | string | Yes | User's XDC wallet address |
| customerId | string | Yes | Your customer identifier |
| fiatAccountId | string | Yes | Fiat account/bank ID |
| merchantRecognitionId | string | No | Your reference ID |

**cURL**
```bash
curl -X POST "https://xdc.cash/api/id0002/onramp/createTransaction" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "chain=XDC&toCurrency=USDC&rate=3.7493&fromAmount=200&depositAddress=0x7eCd41036D5C0D25A8d1270e388ea240308d06Df&customerId=O2FYxMiaeX_79613&toAmount=51.1&fromCurrency=AED&paymentMethodType=AED-BANK-TRANSFER&merchantRecognitionId=ref123&fiatAccountId=2efc8ca96e833bbb6c0c06dd7c948b52"
```

**Response**
```json
{
  "status": 1,
  "code": 200,
  "data": {
    "transactionId": "1560780",
    "status": "pending",
    "depositAddress": "0x7eCd41036D5C0D25A8d1270e388ea240308d06Df",
    "fromAmount": "200",
    "toAmount": "51.1",
    "fromCurrency": "AED",
    "toCurrency": "USDC"
  }
}
```

---

## Get Transaction

Fetch a single onramp transaction by ID.

**Endpoint:** `POST /onramp/transaction`

**Request**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| transactionId | string | Yes | Transaction ID |
| customerId | string | Yes | Customer ID |

**cURL**
```bash
curl -X POST "https://xdc.cash/api/id0002/onramp/transaction" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "transactionId=1560780&customerId=O2FYxMiaeX_79613"
```

**Response**
```json
{
  "status": 1,
  "code": 200,
  "data": {
    "transactionId": "1560780",
    "status": "completed",
    "fromCurrency": "AED",
    "toCurrency": "USDC",
    "fromAmount": "200",
    "toAmount": "51.1",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

## Get All User Transactions

List all onramp transactions for a customer.

**Endpoint:** `POST /onramp/allUserTransaction`

**Request**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| customerId | string | Yes | Customer ID |
| page | string | No | Page number (default: 1) |
| pageSize | string | No | Items per page (default: 20) |

**cURL**
```bash
curl -X POST "https://xdc.cash/api/id0002/onramp/allUserTransaction" \
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
    "total": 10,
    "page": 1,
    "pageSize": 20
  }
}
```

---

## Update Reference ID

Update the merchant reference ID for an onramp transaction.

**Endpoint:** `PUT /onramp/referenceId`

**Request**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| transactionId | string | Yes | Transaction ID |
| customerId | string | Yes | Customer ID |
| referenceId | string | Yes | Your reference (e.g. order ID) |

**cURL**
```bash
curl -X PUT "https://xdc.cash/api/id0002/onramp/referenceId" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "customerId=qA7M4kehLG_83597&transactionId=1562612&referenceId=TRN12345"
```

**Response**
```json
{
  "status": 1,
  "code": 200,
  "data": {
    "transactionId": "1562612",
    "referenceId": "TRN12345"
  }
}
```

---

## Bank Details

Fetch bank payment details for an onramp transaction (e.g. for bank transfer flow).

**Endpoint:** `POST /bank/bankDetails`

**Request**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| customerId | string | Yes | Customer ID |
| fromCurrency | string | Yes | `AED` or `INR` |
| transactionId | string | Yes | Transaction ID |
| paymentMethodType | string | Yes | Payment method |

**cURL**
```bash
curl -X POST "https://xdc.cash/api/id0002/bank/bankDetails" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "customerId=O2FYxMiaeX_79613&fromCurrency=AED&transactionId=1545994&paymentMethodType=AED-BANK-TRANSFER"
```

**Response**
```json
{
  "status": 1,
  "code": 200,
  "data": {
    "bankName": "...",
    "accountNumber": "...",
    "accountName": "...",
    "reference": "...",
    "amount": "200",
    "currency": "AED"
  }
}
```
