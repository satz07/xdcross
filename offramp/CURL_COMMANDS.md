# Curl Commands for All Endpoints

> **GitBook-style docs:** See the `docs/` folder. Run `npm run docs:serve` and open **http://localhost:4000** (or `npm run docs:serve:4001` if port 4000 is in use). The docs use `ref_id=<your_ref_id>` and do not expose partner names.

## Base URL
Replace `BASE_URL` with your server URL:
- Local: `http://localhost:3002`
- Production: `https://xdc.cash` (via Nginx)
- Direct: `http://80.243.180.174:3002`

## Partner ID (ref_id)
Partner is identified by **ref_id** in the request (query string or body), not in the URL path.
- PHP offramp (XDC ↔ PHP): `ref_id=id0001`
- Onramp partner: `ref_id=id0002`
- VirgoPAY (customer / onramp widget): `ref_id=id0003`
Add `ref_id` to every request (e.g. `?ref_id=id0001` for GET/query, `ref_id=id0002` / `id0003` in form/JSON body for POST).

## API key (optional)
If the server has API key authentication enabled, add this header to every request:
- **`X-API-Key: <your-api-key>`**
Replace `<your-api-key>` with the key you were given. Examples below include the header; omit it if your server does not require it.

## 1. Get Quote

```bash
curl -X POST "http://localhost:3002/api/get-quote?ref_id=id0001&sourceCurrency=XDC&targetCurrency=PHP&sourceAmount=50" \
  -H "X-API-Key: <your-api-key>"
```

**With variables:**
```bash
BASE_URL="http://localhost:3002"
curl -X POST "${BASE_URL}/api/get-quote?ref_id=id0001&sourceCurrency=XDC&targetCurrency=PHP&sourceAmount=50" \
  -H "X-API-Key: <your-api-key>"
```

## 2. Accept Quote

**Note:** Replace `QUOTE_ID` with the actual `quoteId` from get-quote response.

```bash
curl -X POST "http://localhost:3002/api/accept-quote?ref_id=id0001&quoteId=20907530396610106886" \
  -H "X-API-Key: <your-api-key>"
```

**With variables:**
```bash
BASE_URL="http://localhost:3002"
QUOTE_ID="20907530396610106886"
curl -X POST "${BASE_URL}/api/accept-quote?ref_id=id0001&quoteId=${QUOTE_ID}" \
  -H "X-API-Key: <your-api-key>"
```

## 3. Cash Out

**Simple example (matching test-cash-out.js):**
```bash
curl -X POST \
  -H "X-API-Key: <your-api-key>" \
  -d '{"ref_id":"id0001","currency":"PHP","amount":"5","channelName":"INSTAPAY","channelSubject":"bpi","extendInfo":{"recipientName":"Rebecah Dausen","recipientAccountNumber":"0566698575"}}' \
  "http://localhost:3002/api/cash-out"
```

**With internalOrderId:**
```bash
curl -X POST \
  -H "X-API-Key: <your-api-key>" \
  -d '{"ref_id":"id0001","internalOrderId":"1234","currency":"PHP","amount":"50","channelName":"SWIFTPAY_PESONET","channelSubject":"gcash","extendInfo":{"recipientName":"sandy-open-api-test","recipientAccountNumber":"123456789"}}' \
  "http://localhost:3002/api/cash-out"
```

**With variables:**
```bash
BASE_URL="http://localhost:3002"
curl -X POST \
  -H "X-API-Key: <your-api-key>" \
  -d '{"ref_id":"id0001","currency":"PHP","amount":"5","channelName":"INSTAPAY","channelSubject":"bpi","extendInfo":{"recipientName":"Rebecah Dausen","recipientAccountNumber":"0566698575"}}' \
  "${BASE_URL}/api/cash-out"
```

## 4. Get Account

```bash
curl -X GET "http://localhost:3002/api/account?ref_id=id0001" \
  -H "X-API-Key: <your-api-key>"
```

**With variables:**
```bash
BASE_URL="http://localhost:3002"
curl -X GET "${BASE_URL}/api/account?ref_id=id0001" \
  -H "X-API-Key: <your-api-key>"
```

## 5. Onramp - Get Quote

**Onramp.money API endpoint:**
```bash
curl -X POST "http://localhost:3002/api/onramp/quote" \
  --header 'X-API-Key: <your-api-key>' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'ref_id=id0002' \
  --data-urlencode 'fromCurrency=AED' \
  --data-urlencode 'toCurrency=USDC' \
  --data-urlencode 'fromAmount=200' \
  --data-urlencode 'chain=XDC' \
  --data-urlencode 'paymentMethodType=AED-BANK-TRANSFER'
```

**With variables:**
```bash
BASE_URL="http://localhost:3002"
curl -X POST "${BASE_URL}/api/onramp/quote" \
  --header 'X-API-Key: <your-api-key>' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'ref_id=id0002' \
  --data-urlencode 'fromCurrency=AED' \
  --data-urlencode 'toCurrency=USDC' \
  --data-urlencode 'fromAmount=200' \
  --data-urlencode 'chain=XDC' \
  --data-urlencode 'paymentMethodType=AED-BANK-TRANSFER'
```

**Single line version:**
```bash
curl -X POST "http://localhost:3002/api/onramp/quote" -H "X-API-Key: <your-api-key>" -H "Content-Type: application/x-www-form-urlencoded" -d "ref_id=id0002&fromCurrency=AED&toCurrency=USDC&fromAmount=200&chain=XDC&paymentMethodType=AED-BANK-TRANSFER"
```

## 6. Onramp - Create Transaction

**Onramp.money API endpoint:**
```bash
curl -X POST "http://localhost:3002/api/onramp/createTransaction" \
  --header 'X-API-Key: <your-api-key>' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'ref_id=id0002' \
  --data-urlencode 'chain=XDC' \
  --data-urlencode 'toCurrency=USDC' \
  --data-urlencode 'rate=3.7493' \
  --data-urlencode 'fromAmount=200' \
  --data-urlencode 'depositAddress=0x7eCd41036D5C0D25A8d1270e388ea240308d06Df' \
  --data-urlencode 'customerId=O2FYxMiaeX_79613' \
  --data-urlencode 'toAmount=51.1' \
  --data-urlencode 'fromCurrency=AED' \
  --data-urlencode 'paymentMethodType=AED-BANK-TRANSFER' \
  --data-urlencode 'merchantRecognitionId=test' \
  --data-urlencode 'fiatAccountId=2efc8ca96e833bbb6c0c06dd7c948b52'
```

**With variables:**
```bash
BASE_URL="http://localhost:3002"
curl -X POST "${BASE_URL}/api/onramp/createTransaction" \
  --header 'X-API-Key: <your-api-key>' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'ref_id=id0002' \
  --data-urlencode 'chain=XDC' \
  --data-urlencode 'toCurrency=USDC' \
  --data-urlencode 'rate=3.7493' \
  --data-urlencode 'fromAmount=200' \
  --data-urlencode 'depositAddress=0x7eCd41036D5C0D25A8d1270e388ea240308d06Df' \
  --data-urlencode 'customerId=O2FYxMiaeX_79613' \
  --data-urlencode 'toAmount=51.1' \
  --data-urlencode 'fromCurrency=AED' \
  --data-urlencode 'paymentMethodType=AED-BANK-TRANSFER' \
  --data-urlencode 'merchantRecognitionId=test' \
  --data-urlencode 'fiatAccountId=2efc8ca96e833bbb6c0c06dd7c948b52'
```

**Single line version:**
```bash
curl -X POST "http://localhost:3002/api/onramp/createTransaction" -H "X-API-Key: <your-api-key>" -H "Content-Type: application/x-www-form-urlencoded" -d "ref_id=id0002&chain=XDC&toCurrency=USDC&rate=3.7493&fromAmount=200&depositAddress=0x7eCd41036D5C0D25A8d1270e388ea240308d06Df&customerId=O2FYxMiaeX_79613&toAmount=51.1&fromCurrency=AED&paymentMethodType=AED-BANK-TRANSFER&merchantRecognitionId=test&fiatAccountId=2efc8ca96e833bbb6c0c06dd7c948b52"
```

## 7. Onramp - Get All User Transactions

**Onramp.money API endpoint:**
```bash
curl -X POST "http://localhost:3002/api/onramp/allUserTransaction" \
  --header 'X-API-Key: <your-api-key>' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'ref_id=id0002' \
  --data-urlencode 'customerId=O2FYxMiaeX_79613' \
  --data-urlencode 'page=1' \
  --data-urlencode 'pageSize=20'
```

**With variables:**
```bash
BASE_URL="http://localhost:3002"
curl -X POST "${BASE_URL}/api/onramp/allUserTransaction" \
  --header 'X-API-Key: <your-api-key>' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'ref_id=id0002' \
  --data-urlencode 'customerId=O2FYxMiaeX_79613' \
  --data-urlencode 'page=1' \
  --data-urlencode 'pageSize=20'
```

**Single line version:**
```bash
curl -X POST "http://localhost:3002/api/onramp/allUserTransaction" -H "X-API-Key: <your-api-key>" -H "Content-Type: application/x-www-form-urlencoded" -d "ref_id=id0002&customerId=O2FYxMiaeX_79613&page=1&pageSize=20"
```

## 7a. Onramp - Get Transaction

**Get a single onramp transaction by ID:**
```bash
curl -X POST "http://localhost:3002/api/onramp/transaction" \
  --header 'X-API-Key: <your-api-key>' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'ref_id=id0002' \
  --data-urlencode 'transactionId=1560780' \
  --data-urlencode 'customerId=O2FYxMiaeX_79613'
```

**With variables:**
```bash
BASE_URL="http://localhost:3002"
TRANSACTION_ID="1560780"
CUSTOMER_ID="O2FYxMiaeX_79613"
curl -X POST "${BASE_URL}/api/onramp/transaction" \
  --header 'X-API-Key: <your-api-key>' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'ref_id=id0002' \
  --data-urlencode "transactionId=${TRANSACTION_ID}" \
  --data-urlencode "customerId=${CUSTOMER_ID}"
```

**Single line version:**
```bash
curl -X POST "http://localhost:3002/api/onramp/transaction" -H "X-API-Key: <your-api-key>" -H "Content-Type: application/x-www-form-urlencoded" -d "ref_id=id0002&transactionId=1560780&customerId=O2FYxMiaeX_79613"
```

## 7b. Onramp - Update Reference ID

**Update reference ID for an onramp transaction:**
```bash
curl -X PUT "http://localhost:3002/api/onramp/referenceId" \
  --header 'X-API-Key: <your-api-key>' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'ref_id=id0002' \
  --data-urlencode 'customerId=qA7M4kehLG_83597' \
  --data-urlencode 'transactionId=1562612' \
  --data-urlencode 'referenceId=TRN12345'
```

**With variables:**
```bash
BASE_URL="http://localhost:3002"
CUSTOMER_ID="qA7M4kehLG_83597"
TRANSACTION_ID="1562612"
REFERENCE_ID="TRN12345"
curl -X PUT "${BASE_URL}/api/onramp/referenceId" \
  --header 'X-API-Key: <your-api-key>' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'ref_id=id0002' \
  --data-urlencode "customerId=${CUSTOMER_ID}" \
  --data-urlencode "transactionId=${TRANSACTION_ID}" \
  --data-urlencode "referenceId=${REFERENCE_ID}"
```

**Single line version:**
```bash
curl -X PUT "http://localhost:3002/api/onramp/referenceId" -H "X-API-Key: <your-api-key>" -H "Content-Type: application/x-www-form-urlencoded" -d "ref_id=id0002&customerId=qA7M4kehLG_83597&transactionId=1562612&referenceId=TRN12345"
```

## 8. Onramp - Offramp Get Quote

**Onramp.money API endpoint:**
```bash
curl -X POST "http://localhost:3002/api/offramp/quote" \
  --header 'X-API-Key: <your-api-key>' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'ref_id=id0002' \
  --data-urlencode 'fromCurrency=USDC' \
  --data-urlencode 'toCurrency=PHP' \
  --data-urlencode 'fromAmount=5' \
  --data-urlencode 'chain=XDC'
```

**With variables:**
```bash
BASE_URL="http://localhost:3002"
curl -X POST "${BASE_URL}/api/offramp/quote" \
  --header 'X-API-Key: <your-api-key>' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'ref_id=id0002' \
  --data-urlencode 'fromCurrency=USDC' \
  --data-urlencode 'toCurrency=PHP' \
  --data-urlencode 'fromAmount=5' \
  --data-urlencode 'chain=XDC'
```

**Single line version:**
```bash
curl -X POST "http://localhost:3002/api/offramp/quote" -H "X-API-Key: <your-api-key>" -H "Content-Type: application/x-www-form-urlencoded" -d "ref_id=id0002&fromCurrency=USDC&toCurrency=PHP&fromAmount=5&chain=XDC"
```

## 9. Onramp - Offramp Create Transaction

**Onramp.money API endpoint:**
```bash
curl -X POST "http://localhost:3002/api/offramp/createTransaction" \
  --header 'X-API-Key: <your-api-key>' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'ref_id=id0002' \
  --data-urlencode 'chain=XDC' \
  --data-urlencode 'customerId=O2FYxMiaeX_79613' \
  --data-urlencode 'fiatAccountId=123456789' \
  --data-urlencode 'fromAmount=5' \
  --data-urlencode 'fromCurrency=USDC' \
  --data-urlencode 'rate=58.3023' \
  --data-urlencode 'toAmount=269.78' \
  --data-urlencode 'toCurrency=PHP' \
  --data-urlencode 'merchantRecognitionId=test'
```

**With variables:**
```bash
BASE_URL="http://localhost:3002"
curl -X POST "${BASE_URL}/api/offramp/createTransaction" \
  --header 'X-API-Key: <your-api-key>' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'ref_id=id0002' \
  --data-urlencode 'chain=XDC' \
  --data-urlencode 'customerId=O2FYxMiaeX_79613' \
  --data-urlencode 'fiatAccountId=123456789' \
  --data-urlencode 'fromAmount=5' \
  --data-urlencode 'fromCurrency=USDC' \
  --data-urlencode 'rate=58.3023' \
  --data-urlencode 'toAmount=269.78' \
  --data-urlencode 'toCurrency=PHP' \
  --data-urlencode 'merchantRecognitionId=test'
```

**Single line version:**
```bash
curl -X POST "http://localhost:3002/api/offramp/createTransaction" -H "X-API-Key: <your-api-key>" -H "Content-Type: application/x-www-form-urlencoded" -d "ref_id=id0002&chain=XDC&customerId=O2FYxMiaeX_79613&fiatAccountId=123456789&fromAmount=5&fromCurrency=USDC&rate=58.3023&toAmount=269.78&toCurrency=PHP&merchantRecognitionId=test"
```

## 9a. Onramp - Offramp Get Transaction

**Get a single offramp transaction by ID:**
```bash
curl -X POST "http://localhost:3002/api/offramp/transaction" \
  --header 'X-API-Key: <your-api-key>' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'ref_id=id0002' \
  --data-urlencode 'customerId=3u1YBqhoi3_82586' \
  --data-urlencode 'transactionId=443468'
```

**With variables:**
```bash
BASE_URL="http://localhost:3002"
TRANSACTION_ID="443468"
CUSTOMER_ID="3u1YBqhoi3_82586"
curl -X POST "${BASE_URL}/api/offramp/transaction" \
  --header 'X-API-Key: <your-api-key>' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'ref_id=id0002' \
  --data-urlencode "transactionId=${TRANSACTION_ID}" \
  --data-urlencode "customerId=${CUSTOMER_ID}"
```

**Single line version:**
```bash
curl -X POST "http://localhost:3002/api/offramp/transaction" -H "X-API-Key: <your-api-key>" -H "Content-Type: application/x-www-form-urlencoded" -d "ref_id=id0002&customerId=3u1YBqhoi3_82586&transactionId=443468"
```

## 10. Onramp - Offramp Get All User Transactions

**Onramp.money API endpoint:**
```bash
curl -X POST "http://localhost:3002/api/offramp/allUserTransaction" \
  --header 'X-API-Key: <your-api-key>' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'ref_id=id0002' \
  --data-urlencode 'customerId=' \
  --data-urlencode 'page=1' \
  --data-urlencode 'pageSize=20'
```

**With variables:**
```bash
BASE_URL="http://localhost:3002"
curl -X POST "${BASE_URL}/api/offramp/allUserTransaction" \
  --header 'X-API-Key: <your-api-key>' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'ref_id=id0002' \
  --data-urlencode 'customerId=' \
  --data-urlencode 'page=1' \
  --data-urlencode 'pageSize=20'
```

**Single line version:**
```bash
curl -X POST "http://localhost:3002/api/offramp/allUserTransaction" -H "X-API-Key: <your-api-key>" -H "Content-Type: application/x-www-form-urlencoded" -d "ref_id=id0002&customerId=&page=1&pageSize=20"
```

## 11. Get Combined Exchange Rate (AED → PHP via USDC)

**Combined endpoint that chains onramp (AED → USDC) and offramp (USDC → PHP) quotes:**
```bash
curl -X POST "http://localhost:3002/api/getExchangeRate" \
  --header 'X-API-Key: <your-api-key>' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'ref_id=id0002' \
  --data-urlencode 'fromCurrency=AED' \
  --data-urlencode 'toCurrency=PHP' \
  --data-urlencode 'fromAmount=200' \
  --data-urlencode 'chain=XDC' \
  --data-urlencode 'paymentMethodType=AED-BANK-TRANSFER'
```

**With variables:**
```bash
BASE_URL="http://localhost:3002"
curl -X POST "${BASE_URL}/api/getExchangeRate" \
  --header 'X-API-Key: <your-api-key>' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'ref_id=id0002' \
  --data-urlencode 'fromCurrency=AED' \
  --data-urlencode 'toCurrency=PHP' \
  --data-urlencode 'fromAmount=200' \
  --data-urlencode 'chain=XDC' \
  --data-urlencode 'paymentMethodType=AED-BANK-TRANSFER'
```

**Single line version:**
```bash
curl -X POST "http://localhost:3002/api/getExchangeRate" -H "X-API-Key: <your-api-key>" -H "Content-Type: application/x-www-form-urlencoded" -d "ref_id=id0002&fromCurrency=AED&toCurrency=PHP&fromAmount=200&chain=XDC&paymentMethodType=AED-BANK-TRANSFER"
```

**USD -> INR (VirgoPAY market/list path):**
```bash
curl -X POST "http://localhost:3002/api/getExchangeRate" \
  --header 'X-API-Key: <your-api-key>' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'ref_id=id0003' \
  --data-urlencode 'fromCurrency=USD' \
  --data-urlencode 'toCurrency=INR' \
  --data-urlencode 'fromAmount=100' \
  --data-urlencode 'chain=XDC'
```

## 12. Onramp - Bank Details

**Onramp.money API endpoint:**
```bash
curl -X POST "http://localhost:3002/api/bank/bankDetails" \
  --header 'X-API-Key: <your-api-key>' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'ref_id=id0002' \
  --data-urlencode 'customerId=O2FYxMiaeX_79613' \
  --data-urlencode 'fromCurrency=AED' \
  --data-urlencode 'transactionId=1545994' \
  --data-urlencode 'paymentMethodType=AED-BANK-TRANSFER'
```

**With variables:**
```bash
BASE_URL="http://localhost:3002"
curl -X POST "${BASE_URL}/api/bank/bankDetails" \
  --header 'X-API-Key: <your-api-key>' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'ref_id=id0002' \
  --data-urlencode 'customerId=O2FYxMiaeX_79613' \
  --data-urlencode 'fromCurrency=AED' \
  --data-urlencode 'transactionId=1545994' \
  --data-urlencode 'paymentMethodType=AED-BANK-TRANSFER'
```

**Single line version:**
```bash
curl -X POST "http://localhost:3002/api/bank/bankDetails" -H "X-API-Key: <your-api-key>" -H "Content-Type: application/x-www-form-urlencoded" -d "ref_id=id0002&customerId=O2FYxMiaeX_79613&fromCurrency=AED&transactionId=1545994&paymentMethodType=AED-BANK-TRANSFER"
```

**Response format:**
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
      "fees": [...]
    },
    "step2": {
      "description": "USDC to PHP (Offramp)",
      "fromCurrency": "USDC",
      "toCurrency": "PHP",
      "fromAmount": "51.11",
      "toAmount": "268.21",
      "rate": "57.9869",
      "fees": [...]
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

## 13. VirgoPAY - Create Customer

VirgoPAY partner uses `ref_id=id0003`. You can optionally pass `countryCode` (query/body) to override `COUNTRY-CODE` header per request.

**Create customer (maps to `POST /api/v1/customer/create` on VirgoPAY):**

```bash
curl -X POST "http://localhost:3002/api/customer/create" \
  -H "X-API-Key: <your-api-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "ref_id": "id0003",
    "countryCode": "IND",
    "email": "satheesh2@xinfin.org",
    "phone": "00919791430120"
  }'
```

**With variables:**

```bash
BASE_URL="http://localhost:3002"
API_KEY="<your-api-key>"

curl -X POST "${BASE_URL}/api/customer/create" \
  -H "X-API-Key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "ref_id": "id0003",
    "countryCode": "IND",
    "email": "satheesh2@xinfin.org",
    "phone": "00919791430120"
  }'
```

## 14. VirgoPAY - Get Customer

Fetch a VirgoPAY customer by ID. The ID is returned by VirgoPAY in the create-customer response.

```bash
curl -X GET "http://localhost:3002/api/customer/1ea57af6-8e30-4a37-aa2f-d7e967a8b957?ref_id=id0003" \
  -H "X-API-Key: <your-api-key>" \
  -H "Accept: application/json"
```

**With variables:**

```bash
BASE_URL="http://localhost:3002"
API_KEY="<your-api-key>"
CUSTOMER_ID="1ea57af6-8e30-4a37-aa2f-d7e967a8b957"

curl -X GET "${BASE_URL}/api/customer/${CUSTOMER_ID}?ref_id=id0003" \
  -H "X-API-Key: ${API_KEY}" \
  -H "Accept: application/json"
```

## 15. VirgoPAY - Partial Update Customer

Update customer KYC/profile details in VirgoPAY.

```bash
curl -X POST "http://localhost:3002/api/customer/partial-update" \
  -H "X-API-Key: <your-api-key>" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "ref_id": "id0003",
    "countryCode": "IND",
    "id": "9c18e722-5a9f-4de1-b739-700e736f7583",
    "firstName": "John",
    "middleName": "Jimmy",
    "lastName": "Doe",
    "dateOfBirth": "2000-12-25",
    "addressProofUrl": "https://www.ontario.ca/files/styles/large/s3/2023-04/DL_2023%20300x200-100-min.jpg",
    "idType": "PASSPORT",
    "idNumber": "D01234567890123",
    "idExpiryDate": "2028-10-07T00:00:00Z",
    "idFrontUrl": "https://www.ontario.ca/files/styles/large/s3/2023-04/DL_2023%20300x200-100-min.jpg",
    "idBackUrl": "https://www.ontario.ca/files/styles/large/s3/2023-04/DL_2023%20300x200-100-min.jpg",
    "idCountryCode": "CAN",
    "idProvince": "ON",
    "selfieUrl": "a-selfie-url",
    "taxIdType": "ssn",
    "taxIdNumber": "123456789",
    "additionalIdNumber": "123456789",
    "isPoliticallyExposed": false,
    "sourceOfFunds": "2,3,6",
    "occupation": "1",
    "employmentStatus": 1,
    "employerName": "VirgoCX",
    "industry": 25,
    "streetNumber": "4950",
    "streetName": "Yonge St",
    "unitNumber": "900",
    "city": "Toronto",
    "province": "ON",
    "addressLineOne": "123 Main Street",
    "postalCode": "M2N 6K1",
    "gender": 1,
    "nationality": "CAN",
    "accountPurpose": "investment_purposes",
    "otherPurpose": "other purpose",
    "actingAsIntermediary": false,
    "expectedMonthlyPayments": "0_4999"
  }'
```

## 16. VirgoPAY - Update Customer

Full update customer KYC/profile details in VirgoPAY.

```bash
curl -X POST "http://localhost:3002/api/customer/update" \
  -H "X-API-Key: <your-api-key>" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "ref_id": "id0003",
    "countryCode": "IND",
    "id": "4d420a31-7d91-4f8c-a818-a33becc27b29",
    "firstName": "John",
    "middleName": "Jimmy",
    "lastName": "Doe",
    "dateOfBirth": "2000-12-25",
    "addressProofUrl": "https://www.ontario.ca/files/styles/large/s3/2023-04/DL_2023%20300x200-100-min.jpg",
    "idType": "PASSPORT",
    "idNumber": "D01234567890123",
    "idExpiryDate": "2028-10-07T00:00:00Z",
    "idFrontUrl": "https://www.ontario.ca/files/styles/large/s3/2023-04/DL_2023%20300x200-100-min.jpg",
    "idBackUrl": "https://www.ontario.ca/files/styles/large/s3/2023-04/DL_2023%20300x200-100-min.jpg",
    "idCountryCode": "CAN",
    "idProvince": "ON",
    "selfieUrl": "a-selfie-url",
    "taxIdType": "ssn",
    "taxIdNumber": "123456789",
    "additionalIdNumber": "123456789",
    "isPoliticallyExposed": false,
    "sourceOfFunds": "2,3,6",
    "occupation": "1",
    "employmentStatus": 1,
    "employerName": "VirgoCX",
    "industry": 25,
    "streetNumber": "4950",
    "streetName": "Yonge St",
    "unitNumber": "900",
    "city": "Toronto",
    "province": "ON",
    "addressLineOne": "123 Main Street",
    "postalCode": "M2N 6K1",
    "gender": 1,
    "nationality": "CAN",
    "accountPurpose": "investment_purposes",
    "otherPurpose": "other purpose",
    "actingAsIntermediary": false,
    "expectedMonthlyPayments": "0_4999"
  }'
```

## 17. VirgoPAY - Create Fiat Account

```bash
curl -X POST "http://localhost:3002/api/fiatAccount" \
  -H "X-API-Key: <your-api-key>" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "ref_id": "id0003",
    "countryCode": "IND",
    "customerId": "1ea57af6-8e30-4a37-aa2f-d7e967a8b957",
    "paymentMethodCode": "IMPS",
    "fiatAccount": {
      "accountNumber": "1234567",
      "bankName": "State Bank of India",
      "routingNumber": "12345"
    }
  }'
```

## 18. VirgoPAY - List Fiat Accounts

```bash
curl -X GET "http://localhost:3002/api/fiatAccount?ref_id=id0003&customerId=1ea57af6-8e30-4a37-aa2f-d7e967a8b957" \
  -H "X-API-Key: <your-api-key>" \
  -H "Accept: application/json"
```

## 19. VirgoPAY - Delete Fiat Account

```bash
curl -X POST "http://localhost:3002/api/fiatAccount/delete/f3af54d0-cdd9-4f65-98b7-4b8ab8a13f31?ref_id=id0003" \
  -H "X-API-Key: <your-api-key>" \
  -H "Accept: application/json"
```

## 20. VirgoPAY - Onramp Transfer

```bash
curl -X POST "http://localhost:3002/api/transfer/onramp" \
  -H "X-API-Key: <your-api-key>" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "ref_id": "id0003",
    "countryCode": "USA",
    "amount": 32.25,
    "customerId": "8629eb45-2c25-47c4-8bfd-552587a47e6e",
    "marketPair": "CAD/USDC",
    "paymentMethodCode": "interactEtransfer",
    "networkName": "UGA",
    "cryptoWallet": {
      "address": "0x32Be343B94f860124dC4fEe278FDCBD38C102D88",
      "networkSymbol": "erc20"
    },
    "fiatAccountId": "705ae478-6541-4ccf-9689-9c0b3c32f4d8"
  }'
```

## 21. VirgoPAY - Offramp Transfer

```bash
curl -X POST "http://localhost:3002/api/transfer/offramp" \
  -H "X-API-Key: <your-api-key>" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "ref_id": "id0003",
    "countryCode": "IND",
    "amount": 100,
    "customerId": "8629eb45-2c25-47c4-8bfd-552587a47e6e",
    "marketPair": "USDC/CAD",
    "fiatAccountId": "705ae478-6541-4ccf-9689-9c0b3c32f4d8",
    "cryptoNetworkSymbol": "erc20"
  }'
```

## 22. VirgoPAY - Transfer Detail

```bash
curl -X GET "http://localhost:3002/api/transfer/detail?ref_id=id0003&transferId=2c149e06-bb12-4741-ba8f-4166c2ba34a0" \
  -H "X-API-Key: <your-api-key>" \
  -H "Accept: application/json"
```

## 23. VirgoPAY - List Transfers

```bash
curl -X GET "http://localhost:3002/api/transfer?ref_id=id0003&id=5802c426-a4f4-486d-966d-f1ac9f222ebb&customerId=47d571c7-9571-4ae7-a5a1-9840e5087910&type=1&status=5&page=1&size=20&countryCode=CAN" \
  -H "X-API-Key: <your-api-key>" \
  -H "Accept: application/json"
```

## 24. VirgoPAY - Market List

```bash
curl -X GET "http://localhost:3002/api/market/list?ref_id=id0003&sourceCoin=USDT&destinationCoin=INR&type=2" \
  -H "X-API-Key: <your-api-key>" \
  -H "Accept: application/json"
```

## Single Line Commands (Copy-Paste Ready)

### Get Quote
```bash
curl -X POST "http://localhost:3002/api/get-quote?ref_id=id0001&sourceCurrency=XDC&targetCurrency=PHP&sourceAmount=50" -H "X-API-Key: <your-api-key>"
```

### Accept Quote
```bash
curl -X POST "http://localhost:3002/api/accept-quote?ref_id=id0001&quoteId=20907530396610106886" -H "X-API-Key: <your-api-key>"
```

### Cash Out
```bash
# Simple format (matching test-cash-out.js)
curl -X POST -H "X-API-Key: <your-api-key>" -d '{"ref_id":"id0001","currency":"PHP","amount":"5","channelName":"INSTAPAY","channelSubject":"bpi","extendInfo":{"recipientName":"Rebecah Dausen","recipientAccountNumber":"0566698575"}}' "http://localhost:3002/api/cash-out"
```

### Get Account
```bash
curl -X GET "http://localhost:3002/api/account?ref_id=id0001" -H "X-API-Key: <your-api-key>"
```

### Onramp Get Quote
```bash
curl -X POST "http://localhost:3002/api/onramp/quote" -H "X-API-Key: <your-api-key>" -H "Content-Type: application/x-www-form-urlencoded" -d "ref_id=id0002&fromCurrency=AED&toCurrency=USDC&fromAmount=200&chain=XDC&paymentMethodType=AED-BANK-TRANSFER"
```

### Onramp Create Transaction
```bash
curl -X POST "http://localhost:3002/api/onramp/createTransaction" -H "X-API-Key: <your-api-key>" -H "Content-Type: application/x-www-form-urlencoded" -d "ref_id=id0002&chain=XDC&toCurrency=USDC&rate=3.7493&fromAmount=200&depositAddress=0x7eCd41036D5C0D25A8d1270e388ea240308d06Df&customerId=O2FYxMiaeX_79613&toAmount=51.1&fromCurrency=AED&paymentMethodType=AED-BANK-TRANSFER&merchantRecognitionId=test&fiatAccountId=2efc8ca96e833bbb6c0c06dd7c948b52"
```

### Onramp Get All User Transactions
```bash
curl -X POST "http://localhost:3002/api/onramp/allUserTransaction" -H "X-API-Key: <your-api-key>" -H "Content-Type: application/x-www-form-urlencoded" -d "ref_id=id0002&customerId=O2FYxMiaeX_79613&page=1&pageSize=20"
```

### Onramp Get Transaction
```bash
curl -X POST "http://localhost:3002/api/onramp/transaction" -H "X-API-Key: <your-api-key>" -H "Content-Type: application/x-www-form-urlencoded" -d "ref_id=id0002&transactionId=1560780&customerId=O2FYxMiaeX_79613"
```

### Onramp Update Reference ID
```bash
curl -X PUT "http://localhost:3002/api/onramp/referenceId" -H "X-API-Key: <your-api-key>" -H "Content-Type: application/x-www-form-urlencoded" -d "ref_id=id0002&customerId=qA7M4kehLG_83597&transactionId=1562612&referenceId=TRN12345"
```

### Onramp Offramp Get Quote
```bash
curl -X POST "http://localhost:3002/api/offramp/quote" -H "X-API-Key: <your-api-key>" -H "Content-Type: application/x-www-form-urlencoded" -d "ref_id=id0002&fromCurrency=USDC&toCurrency=PHP&fromAmount=5&chain=XDC"
```

### Onramp Offramp Create Transaction
```bash
curl -X POST "http://localhost:3002/api/offramp/createTransaction" -H "X-API-Key: <your-api-key>" -H "Content-Type: application/x-www-form-urlencoded" -d "ref_id=id0002&chain=XDC&customerId=O2FYxMiaeX_79613&fiatAccountId=123456789&fromAmount=5&fromCurrency=USDC&rate=58.3023&toAmount=269.78&toCurrency=PHP&merchantRecognitionId=test"
```

### Onramp Offramp Get Transaction
```bash
curl -X POST "http://localhost:3002/api/offramp/transaction" -H "X-API-Key: <your-api-key>" -H "Content-Type: application/x-www-form-urlencoded" -d "ref_id=id0002&customerId=3u1YBqhoi3_82586&transactionId=443468"
```

### Onramp Offramp Get All User Transactions
```bash
curl -X POST "http://localhost:3002/api/offramp/allUserTransaction" -H "X-API-Key: <your-api-key>" -H "Content-Type: application/x-www-form-urlencoded" -d "ref_id=id0002&customerId=&page=1&pageSize=20"
```

### Get Combined Exchange Rate (AED → PHP)
```bash
curl -X POST "http://localhost:3002/api/getExchangeRate" -H "X-API-Key: <your-api-key>" -H "Content-Type: application/x-www-form-urlencoded" -d "ref_id=id0002&fromCurrency=AED&toCurrency=PHP&fromAmount=200&chain=XDC&paymentMethodType=AED-BANK-TRANSFER"
```

## Production URLs (via Nginx)

### Get Quote
```bash
curl -X POST "https://xdc.cash/api/get-quote?ref_id=id0001&sourceCurrency=XDC&targetCurrency=PHP&sourceAmount=50" -H "X-API-Key: <your-api-key>"
```

### Accept Quote
```bash
curl -X POST "https://xdc.cash/api/accept-quote?ref_id=id0001&quoteId=20907530396610106886" -H "X-API-Key: <your-api-key>"
```

### Cash Out
```bash
curl -X POST -H "X-API-Key: <your-api-key>" -d '{"ref_id":"id0001","internalOrderId":"1234","currency":"PHP","amount":"50","channelName":"SWIFTPAY_PESONET","channelSubject":"gcash","extendInfo":{"recipientName":"sandy-open-api-test","recipientAccountNumber":"123456789"}}' "https://xdc.cash/api/cash-out"
```

### Get Account
```bash
curl -X GET "https://xdc.cash/api/account?ref_id=id0001" -H "X-API-Key: <your-api-key>"
```

### Onramp Get Quote
```bash
curl -X POST "https://xdc.cash/api/onramp/quote" -H "X-API-Key: <your-api-key>" -H "Content-Type: application/x-www-form-urlencoded" -d "ref_id=id0002&fromCurrency=AED&toCurrency=USDC&fromAmount=200&chain=XDC&paymentMethodType=AED-BANK-TRANSFER"
```

### Onramp Create Transaction
```bash
curl -X POST "https://xdc.cash/api/onramp/createTransaction" -H "X-API-Key: <your-api-key>" -H "Content-Type: application/x-www-form-urlencoded" -d "ref_id=id0002&chain=XDC&toCurrency=USDC&rate=3.7493&fromAmount=200&depositAddress=0x7eCd41036D5C0D25A8d1270e388ea240308d06Df&customerId=O2FYxMiaeX_79613&toAmount=51.1&fromCurrency=AED&paymentMethodType=AED-BANK-TRANSFER&merchantRecognitionId=test&fiatAccountId=2efc8ca96e833bbb6c0c06dd7c948b52"
```

### Onramp Get All User Transactions
```bash
curl -X POST "https://xdc.cash/api/onramp/allUserTransaction" -H "X-API-Key: <your-api-key>" -H "Content-Type: application/x-www-form-urlencoded" -d "ref_id=id0002&customerId=O2FYxMiaeX_79613&page=1&pageSize=20"
```

### Onramp Get Transaction
```bash
curl -X POST "https://xdc.cash/api/onramp/transaction" -H "X-API-Key: <your-api-key>" -H "Content-Type: application/x-www-form-urlencoded" -d "ref_id=id0002&transactionId=1560780&customerId=O2FYxMiaeX_79613"
```

### Onramp Update Reference ID
```bash
curl -X PUT "https://xdc.cash/api/onramp/referenceId" -H "X-API-Key: <your-api-key>" -H "Content-Type: application/x-www-form-urlencoded" -d "ref_id=id0002&customerId=qA7M4kehLG_83597&transactionId=1562612&referenceId=TRN12345"
```

### Onramp Offramp Get Quote
```bash
curl -X POST "https://xdc.cash/api/offramp/quote" -H "X-API-Key: <your-api-key>" -H "Content-Type: application/x-www-form-urlencoded" -d "ref_id=id0002&fromCurrency=USDC&toCurrency=PHP&fromAmount=5&chain=XDC"
```

### Onramp Offramp Create Transaction
```bash
curl -X POST "https://xdc.cash/api/offramp/createTransaction" -H "X-API-Key: <your-api-key>" -H "Content-Type: application/x-www-form-urlencoded" -d "ref_id=id0002&chain=XDC&customerId=O2FYxMiaeX_79613&fiatAccountId=123456789&fromAmount=5&fromCurrency=USDC&rate=58.3023&toAmount=269.78&toCurrency=PHP&merchantRecognitionId=test"
```

### Onramp Offramp Get Transaction
```bash
curl -X POST "https://xdc.cash/api/offramp/transaction" -H "X-API-Key: <your-api-key>" -H "Content-Type: application/x-www-form-urlencoded" -d "ref_id=id0002&customerId=3u1YBqhoi3_82586&transactionId=443468"
```

### Onramp Offramp Get All User Transactions
```bash
curl -X POST "https://xdc.cash/api/offramp/allUserTransaction" -H "X-API-Key: <your-api-key>" -H "Content-Type: application/x-www-form-urlencoded" -d "ref_id=id0002&customerId=&page=1&pageSize=20"
```

### Get Combined Exchange Rate (AED → PHP)
```bash
curl -X POST "https://xdc.cash/api/getExchangeRate" -H "X-API-Key: <your-api-key>" -H "Content-Type: application/x-www-form-urlencoded" -d "ref_id=id0002&fromCurrency=AED&toCurrency=PHP&fromAmount=200&chain=XDC&paymentMethodType=AED-BANK-TRANSFER"
```

## Notes

- **ref_id required** - Pass partner as `ref_id` in query (GET) or in body (POST), e.g. `ref_id=id0001` (PHP offramp) or `ref_id=id0002` (Onramp).
- **No Content-Type header needed** - Server handles it automatically (except for cash-out which requires it)
- **Methods**: Most endpoints use POST, account endpoint uses GET
- **Signature generation is automatic** - No need to configure

## Testing Script

Save as `test-all.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3002"
API_BASE="${BASE_URL}/api"
API_KEY="<your-api-key>"   # Omit -H "X-API-Key: ..." if server has no API key auth

echo "Testing Get Quote..."
curl -X POST "${API_BASE}/get-quote?ref_id=id0001&sourceCurrency=XDC&targetCurrency=PHP&sourceAmount=50" -H "X-API-Key: ${API_KEY}"
echo ""
echo ""

echo "Testing Accept Quote..."
QUOTE_ID="20907530396610106886"
curl -X POST "${API_BASE}/accept-quote?ref_id=id0001&quoteId=${QUOTE_ID}" -H "X-API-Key: ${API_KEY}"
echo ""
echo ""

echo "Testing Cash Out..."
curl -X POST \
  -H "X-API-Key: ${API_KEY}" \
  -d '{"ref_id":"id0001","internalOrderId":"1234","currency":"PHP","amount":"50","channelName":"SWIFTPAY_PESONET","channelSubject":"gcash","extendInfo":{"recipientName":"sandy-open-api-test","recipientAccountNumber":"123456789"}}' \
  "${API_BASE}/cash-out"
echo ""
```

Make it executable:
```bash
chmod +x test-all.sh
./test-all.sh
```

