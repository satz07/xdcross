# XDC Payments Integration Guide

Simple partner guide for XDC Payments endpoints exposed by this API gateway.

---

## Base URL

- Production: `https://api.xdcforpayments.org`
- Local: `http://localhost:3002`

All routes are under `/api`.

---

## Authentication and Partner ID

Send both on every request:

- Header: `X-API-Key: <your-api-key>`
- Partner selector: `ref_id=id0003` (query for GET, body for POST)

---

## 1) Create Customer

`POST /api/customer/create`

### Request

```bash
curl -X POST "https://api.xdcforpayments.org/api/customer/create" \
  -H "X-API-Key: <your-api-key>" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "ref_id": "id0003",
    "email": "user@example.com",
    "phone": "00919791430120"
  }'
```

### Sample Response

```json
{
  "errorCode": 0,
  "msg": "success",
  "data": {
    "id": "04fc0920-f7cc-4ea3-ad08-3a727dd24f02",
    "email": "user@example.com",
    "phone": "00919791430120"
  },
  "success": true
}
```

---

## 2) Get Customer

`GET /api/customer/:customerId`

### Request

```bash
curl -X GET "https://api.xdcforpayments.org/api/customer/04fc0920-f7cc-4ea3-ad08-3a727dd24f02?ref_id=id0003" \
  -H "X-API-Key: <your-api-key>" \
  -H "Accept: application/json"
```

### Sample Response

```json
{
  "errorCode": 0,
  "msg": "success",
  "data": {
    "id": "04fc0920-f7cc-4ea3-ad08-3a727dd24f02",
    "country": "IND",
    "email": "user@example.com",
    "phone": "00919791430120",
    "status": 5
  },
  "success": true
}
```

---

## 3) Market List (Rates)

`GET /api/market/list`

Use this to fetch direct market pairs (for example USD/USDT and USDT/INR).

### A) USD -> USDT (Onramp pair)

```bash
curl -X GET "https://api.xdcforpayments.org/api/market/list?ref_id=id0003&sourceCoin=USD&destinationCoin=USDT&type=1&countryCode=USA" \
  -H "X-API-Key: <your-api-key>" \
  -H "Accept: application/json"
```

Sample:

```json
{
  "errorCode": 0,
  "msg": "success",
  "data": [
    {
      "marketPair": "USD/USDT",
      "type": "onramp",
      "priceDecimals": 4,
      "rate": 0.999,
      "fee": 0.0095,
      "active": 1
    }
  ],
  "success": true
}
```

### B) USDT -> INR (Offramp pair)

```bash
curl -X GET "https://api.xdcforpayments.org/api/market/list?ref_id=id0003&sourceCoin=USDT&destinationCoin=INR&type=2&countryCode=IND" \
  -H "X-API-Key: <your-api-key>" \
  -H "Accept: application/json"
```

Sample:

```json
{
  "errorCode": 0,
  "msg": "success",
  "data": [
    {
      "marketPair": "USDT/INR",
      "type": "offramp",
      "priceDecimals": 8,
      "rate": 89.04763,
      "fee": 0,
      "active": 1
    }
  ],
  "success": true
}
```

---

## 4) Combined Exchange Rate (USD -> INR)

`POST /api/getExchangeRate`

For `ref_id=id0003`, this endpoint calculates:
1. `USD -> USDT` (market/list, `type=1`)
2. `USDT -> INR` (market/list, `type=2`)
3. Final INR amount and effective rate

### Request

```bash
curl -X POST "https://api.xdcforpayments.org/api/getExchangeRate" \
  -H "X-API-Key: <your-api-key>" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "ref_id=id0003" \
  --data-urlencode "fromCurrency=USD" \
  --data-urlencode "toCurrency=INR" \
  --data-urlencode "fromAmount=100" \
  --data-urlencode "chain=XDC" \
  --data-urlencode "fromCountryCode=USA" \
  --data-urlencode "toCountryCode=IND"
```

### Sample Response

```json
{
  "status": 1,
  "code": 200,
  "data": {
    "input": {
      "fromCurrency": "USD",
      "toCurrency": "INR",
      "fromAmount": "100",
      "chain": "XDC",
      "fromCountryCode": "USA",
      "toCountryCode": "IND"
    },
    "step1": {
      "description": "USD to USDT (XDC Payments market/list, type=1, countryCode=USA)",
      "fromCurrency": "USD",
      "toCurrency": "USDT",
      "fromAmount": "100",
      "toAmount": "99.900000",
      "rate": "0.99900000"
    },
    "step2": {
      "description": "USDT to INR (XDC Payments market/list, type=2, countryCode=IND)",
      "fromCurrency": "USDT",
      "toCurrency": "INR",
      "fromAmount": "99.900000",
      "toAmount": "8895.858237",
      "rate": "89.04763000"
    },
    "final": {
      "fromCurrency": "USD",
      "toCurrency": "INR",
      "fromAmount": "100",
      "toAmount": "8895.858237",
      "effectiveRate": "88.95858237",
      "fee": "0.100000"
    }
  }
}
```

---

## 5) Other XDC Payments Endpoints Available

- `POST /api/customer/partial-update`
- `POST /api/customer/update`
- `POST /api/fiatAccount`
- `GET /api/fiatAccount`
- `POST /api/fiatAccount/delete/:fiatAccountId`
- `POST /api/transfer/onramp`
- `POST /api/transfer/offramp`
- `GET /api/transfer/detail`
- `GET /api/transfer`

---

## Common Errors

- `400 ref_id is required` -> Add `ref_id=id0003`
- `401 Unauthorized` -> Invalid or missing `X-API-Key`
- `500 No XDC Payments market path found` -> Requested pair is not available for given `countryCode`

