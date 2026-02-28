# API key authentication

If your integration uses **API key authentication**, you must send your API key with every request to the API. Your key was provided to you when you signed up; do not share it or expose it in client-side code.

---

## How to send your API key

Send the key in **one** of these headers:

| Header | Example |
|--------|--------|
| `X-API-Key` | `X-API-Key: <your-api-key>` |
| `Authorization` | `Authorization: Bearer <your-api-key>` |

Use the same key for all requests. The key is separate from your **reference ID** (`ref_id`), which you still send in the query or body to select the service.

---

## Example requests

**GET or POST with query (e.g. get-quote):**

```bash
curl -X POST "https://xdc.cash/api/get-quote?ref_id=YOUR_REF_ID&sourceCurrency=XDC&targetCurrency=PHP&sourceAmount=50" \
  -H "X-API-Key: <your-api-key>"
```

**POST with body (e.g. onramp quote):**

```bash
curl -X POST "https://xdc.cash/api/onramp/quote" \
  -H "X-API-Key: <your-api-key>" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "ref_id=YOUR_REF_ID&fromCurrency=AED&toCurrency=USDC&fromAmount=200&chain=XDC&paymentMethodType=AED-BANK-TRANSFER"
```

**Using Bearer instead:**

```bash
curl -X POST "https://xdc.cash/api/get-quote?ref_id=YOUR_REF_ID&sourceCurrency=XDC&targetCurrency=PHP&sourceAmount=50" \
  -H "Authorization: Bearer <your-api-key>"
```

Replace `<your-api-key>` with the key you received. Keep it secret and use it only in server-side or secure environments.

---

## If you get 401 Unauthorized

**Missing API key** — you did not send a key, or the header name is wrong:

```json
{
  "error": {
    "message": "Missing API key. Send X-API-Key header or Authorization: Bearer <key>.",
    "status": 401,
    "code": "MISSING_API_KEY"
  }
}
```

**Invalid API key** — the key is wrong or no longer valid:

```json
{
  "error": {
    "message": "Invalid API key.",
    "status": 401,
    "code": "INVALID_API_KEY"
  }
}
```

If you see these, check that you are sending the correct key in `X-API-Key` or `Authorization: Bearer <key>`. If the key was rotated or revoked, you will need a new key from your provider.

---

## Summary

| What | Details |
|------|--------|
| **Header** | `X-API-Key: <your-api-key>` or `Authorization: Bearer <your-api-key>` |
| **When** | On every request to `/api/*` if your integration uses API key authentication |
| **ref_id** | Still required in query or body; it is separate from the API key |
