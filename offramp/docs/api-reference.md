# API Reference (cURL)

Use this page as a copy-paste reference for all API endpoints. Replace placeholders with your values.

---

## Authentication (API key)

If the server has **API key authentication** enabled, every request must include a valid key in one of these headers:

- **`X-API-Key: <your-api-key>`**
- **`Authorization: Bearer <your-api-key>`**

Example:

```bash
curl -X POST "${BASE_URL}/api/get-quote?ref_id=<your_ref_id>&sourceCurrency=XDC&targetCurrency=PHP&sourceAmount=50" \
  -H "X-API-Key: <your-api-key>"
```

Full setup, multiple keys, and error responses: [Authentication (API key)](AUTH.md).

---

**Placeholders**

| Placeholder | Description |
|-------------|-------------|
| `BASE_URL` | `https://xdc.cash` (production) or `http://localhost:3002` (local) |
| `ref_id=<your_ref_id>` | Your reference ID (query or body). Required on every request. |
| `<your-api-key>` | Your API key (required if the server has API key auth enabled). Send in `X-API-Key` or `Authorization: Bearer` header. |

Use the `ref_id` and API key values provided to you when integrating.

---

## Base URL

- **Production:** `https://xdc.cash`
- **Local:** `http://localhost:3002`

All endpoints live under `/api/`. Include `ref_id` in every request (query string for GET, or in body for POST).

---

## PHP offramp (XDC ↔ PHP) — Get Quote, Accept Quote, Cash Out, Account

### Get Quote

```bash
curl -X POST "${BASE_URL}/api/get-quote?ref_id=<your_ref_id>&sourceCurrency=XDC&targetCurrency=PHP&sourceAmount=50" \
  -H "X-API-Key: <your-api-key>"
```

### Accept Quote

Replace `QUOTE_ID` with the `quoteId` from the get-quote response.

```bash
curl -X POST "${BASE_URL}/api/accept-quote?ref_id=<your_ref_id>&quoteId=QUOTE_ID" \
  -H "X-API-Key: <your-api-key>"
```

### Cash Out

```bash
curl -X POST "${BASE_URL}/api/cash-out" \
  -H "X-API-Key: <your-api-key>" \
  -H "Content-Type: application/json" \
  -d '{"ref_id":"<your_ref_id>","currency":"PHP","amount":"5","channelName":"INSTAPAY","channelSubject":"bpi","extendInfo":{"recipientName":"Name","recipientAccountNumber":"1234567890"}}'
```

### Get Account

```bash
curl -X GET "${BASE_URL}/api/account?ref_id=<your_ref_id>" \
  -H "X-API-Key: <your-api-key>"
```

---

## Onramp (Quote, Create Transaction, Transactions)

### Get Quote

```bash
curl -X POST "${BASE_URL}/api/onramp/quote" \
  -H "X-API-Key: <your-api-key>" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "ref_id=<your_ref_id>&fromCurrency=AED&toCurrency=USDC&fromAmount=200&chain=XDC&paymentMethodType=AED-BANK-TRANSFER"
```

### Create Transaction

```bash
curl -X POST "${BASE_URL}/api/onramp/createTransaction" \
  -H "X-API-Key: <your-api-key>" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "ref_id=<your_ref_id>&chain=XDC&toCurrency=USDC&rate=3.7493&fromAmount=200&depositAddress=0xYourWallet&customerId=YourCustomerId&toAmount=51.1&fromCurrency=AED&paymentMethodType=AED-BANK-TRANSFER&merchantRecognitionId=ref&fiatAccountId=YourFiatAccountId"
```

### Get All User Transactions

```bash
curl -X POST "${BASE_URL}/api/onramp/allUserTransaction" \
  -H "X-API-Key: <your-api-key>" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "ref_id=<your_ref_id>&customerId=YourCustomerId&page=1&pageSize=20"
```

### Get Transaction

```bash
curl -X POST "${BASE_URL}/api/onramp/transaction" \
  -H "X-API-Key: <your-api-key>" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "ref_id=<your_ref_id>&transactionId=TRANSACTION_ID&customerId=YourCustomerId"
```

### Update Reference ID

```bash
curl -X PUT "${BASE_URL}/api/onramp/referenceId" \
  -H "X-API-Key: <your-api-key>" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "ref_id=<your_ref_id>&customerId=YourCustomerId&transactionId=TRANSACTION_ID&referenceId=YourRef"
```

---

## Offramp (Quote, Create Transaction, Transactions)

### Get Quote

```bash
curl -X POST "${BASE_URL}/api/offramp/quote" \
  -H "X-API-Key: <your-api-key>" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "ref_id=<your_ref_id>&fromCurrency=USDC&toCurrency=PHP&fromAmount=5&chain=XDC"
```

### Create Transaction

```bash
curl -X POST "${BASE_URL}/api/offramp/createTransaction" \
  -H "X-API-Key: <your-api-key>" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "ref_id=<your_ref_id>&chain=XDC&customerId=YourCustomerId&fiatAccountId=123456789&fromAmount=5&fromCurrency=USDC&rate=58.3023&toAmount=269.78&toCurrency=PHP&merchantRecognitionId=ref"
```

### Get Transaction

```bash
curl -X POST "${BASE_URL}/api/offramp/transaction" \
  -H "X-API-Key: <your-api-key>" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "ref_id=<your_ref_id>&customerId=YourCustomerId&transactionId=TRANSACTION_ID"
```

### Get All User Transactions

```bash
curl -X POST "${BASE_URL}/api/offramp/allUserTransaction" \
  -H "X-API-Key: <your-api-key>" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "ref_id=<your_ref_id>&customerId=YourCustomerId&page=1&pageSize=20"
```

---

## Get Combined Exchange Rate (e.g. AED → PHP)

```bash
curl -X POST "${BASE_URL}/api/getExchangeRate" \
  -H "X-API-Key: <your-api-key>" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "ref_id=<your_ref_id>&fromCurrency=AED&toCurrency=PHP&fromAmount=200&chain=XDC&paymentMethodType=AED-BANK-TRANSFER"
```

---

## Bank Details

```bash
curl -X POST "${BASE_URL}/api/bank/bankDetails" \
  -H "X-API-Key: <your-api-key>" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "ref_id=<your_ref_id>&customerId=YourCustomerId&fromCurrency=AED&transactionId=TRANSACTION_ID&paymentMethodType=AED-BANK-TRANSFER"
```

---

## Notes

- **ref_id** (reference ID) is required on every request (query or body). Use the value provided to you when integrating.
- **API key:** If the server requires it, send `X-API-Key` or `Authorization: Bearer <key>` on every request. See [Authentication (API key)](AUTH.md).
- **Content-Type:** `application/x-www-form-urlencoded` for most POST endpoints; `application/json` for Cash Out.
- **Methods:** Most endpoints use POST; Account uses GET.
