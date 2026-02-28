# Get Exchange Rate

Combined endpoint that returns the final PHP amount for a given fiat amount (AED or INR). Chains onramp (fiat → USDC) and offramp (USDC → PHP) in one call.

**Supported routes:** AED → PHP, INR → PHP (via USDC on XDC chain)

**Endpoint:** `POST /api/getExchangeRate`

**Base URL:** `https://xdc.cash` — include `ref_id=<your_ref_id>` in the request body.

---

## Request

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| ref_id | string | Yes | Your reference ID |
| fromCurrency | string | Yes | `AED` or `INR` |
| toCurrency | string | Yes | `PHP` |
| fromAmount | string | Yes | Fiat amount to convert |
| chain | string | Yes | `XDC` |
| paymentMethodType | string | Yes | `AED-BANK-TRANSFER` (UAE), `UPI` or `IMPS` (India) |

---

## AED → PHP Example

**cURL**
```bash
curl -X POST "https://xdc.cash/api/getExchangeRate" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "ref_id=<your_ref_id>&fromCurrency=AED&toCurrency=PHP&fromAmount=200&chain=XDC&paymentMethodType=AED-BANK-TRANSFER"
```

**Request Body (form-urlencoded)**
```
fromCurrency=AED
toCurrency=PHP
fromAmount=200
chain=XDC
paymentMethodType=AED-BANK-TRANSFER
```

---

## INR → PHP Example

**cURL**
```bash
curl -X POST "https://xdc.cash/api/getExchangeRate" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "ref_id=<your_ref_id>&fromCurrency=INR&toCurrency=PHP&fromAmount=1000&chain=XDC&paymentMethodType=UPI"
```

---

## Response

```json
{
  "status": 1,
  "code": 200,
  "data": {
    "input": {
      "fromCurrency": "AED",
      "toCurrency": "PHP",
      "fromAmount": "200",
      "chain": "XDC",
      "paymentMethodType": "AED-BANK-TRANSFER"
    },
    "step1": {
      "description": "AED to USDC (Onramp)",
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
    },
    "step2": {
      "description": "USDC to PHP (Offramp)",
      "fromCurrency": "USDC",
      "toCurrency": "PHP",
      "fromAmount": "51.11",
      "toAmount": "268.21",
      "rate": "57.9869",
      "fees": [
        {
          "type": "fiat",
          "onrampFee": "0",
          "gatewayFee": "21",
          "clientFee": "0",
          "tdsFee": "0"
        }
      ]
    },
    "final": {
      "fromCurrency": "AED",
      "toCurrency": "PHP",
      "fromAmount": "200",
      "toAmount": "268.21",
      "effectiveRate": "1.341050",
      "totalFees": {
        "onramp": [...],
        "offramp": [...]
      }
    }
  }
}
```

| Field | Description |
|-------|-------------|
| data.step1 | Onramp quote (fiat → USDC) |
| data.step2 | Offramp quote (USDC → PHP) |
| data.final.toAmount | Final PHP amount the recipient receives |
| data.final.effectiveRate | Effective rate (PHP per 1 unit of fromCurrency) |

---

## Error Response

```json
{
  "status": 0,
  "code": 400,
  "error": {
    "message": "Missing required parameters: fromCurrency, toCurrency, fromAmount, chain",
    "status": 400
  }
}
```
