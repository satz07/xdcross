# Curl Commands for All Endpoints

> **GitBook format:** See the `docs/` folder for a GitBook-ready version. Run `cd docs && gitbook serve` to preview, or connect the repo to [gitbook.com](https://gitbook.com).

## Base URL
Replace `BASE_URL` with your server URL:
- Local: `http://localhost:3002`
- Production: `https://xdc.cash` (via Nginx)
- Direct: `http://80.243.180.174:3002`

## 1. Get Quote

```bash
curl -X POST "http://localhost:3002/api/id0001/get-quote?sourceCurrency=XDC&targetCurrency=PHP&sourceAmount=50"
```

**With variables:**
```bash
BASE_URL="http://localhost:3002"
curl -X POST "${BASE_URL}/api/id0001/get-quote?sourceCurrency=XDC&targetCurrency=PHP&sourceAmount=50"
```

## 2. Accept Quote

**Note:** Replace `QUOTE_ID` with the actual `quoteId` from get-quote response.

```bash
curl -X POST "http://localhost:3002/api/id0001/accept-quote?quoteId=20907530396610106886"
```

**With variables:**
```bash
BASE_URL="http://localhost:3002"
QUOTE_ID="20907530396610106886"
curl -X POST "${BASE_URL}/api/id0001/accept-quote?quoteId=${QUOTE_ID}"
```

## 3. Cash Out

**Simple example (matching test-cash-out.js):**
```bash
curl -X POST \
  -d '{"currency":"PHP","amount":"5","channelName":"INSTAPAY","channelSubject":"bpi","extendInfo":{"recipientName":"Rebecah Dausen","recipientAccountNumber":"0566698575"}}' \
  "http://localhost:3002/api/id0001/cash-out"
```

**With internalOrderId:**
```bash
curl -X POST \
  -d '{"internalOrderId":"1234","currency":"PHP","amount":"50","channelName":"SWIFTPAY_PESONET","channelSubject":"gcash","extendInfo":{"recipientName":"sandy-open-api-test","recipientAccountNumber":"123456789"}}' \
  "http://localhost:3002/api/id0001/cash-out"
```

**With variables:**
```bash
BASE_URL="http://localhost:3002"
curl -X POST \
  -d '{"currency":"PHP","amount":"5","channelName":"INSTAPAY","channelSubject":"bpi","extendInfo":{"recipientName":"Rebecah Dausen","recipientAccountNumber":"0566698575"}}' \
  "${BASE_URL}/api/id0001/cash-out"
```

## 4. Get Account

```bash
curl -X GET "http://localhost:3002/api/id0001/account"
```

**With variables:**
```bash
BASE_URL="http://localhost:3002"
curl -X GET "${BASE_URL}/api/id0001/account"
```

## 5. Onramp - Get Quote

**Onramp.money API endpoint:**
```bash
curl -X POST "http://localhost:3002/api/id0002/onramp/quote" \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'fromCurrency=AED' \
  --data-urlencode 'toCurrency=USDC' \
  --data-urlencode 'fromAmount=200' \
  --data-urlencode 'chain=XDC' \
  --data-urlencode 'paymentMethodType=AED-BANK-TRANSFER'
```

**With variables:**
```bash
BASE_URL="http://localhost:3002"
curl -X POST "${BASE_URL}/api/id0002/onramp/quote" \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'fromCurrency=AED' \
  --data-urlencode 'toCurrency=USDC' \
  --data-urlencode 'fromAmount=200' \
  --data-urlencode 'chain=XDC' \
  --data-urlencode 'paymentMethodType=AED-BANK-TRANSFER'
```

**Single line version:**
```bash
curl -X POST "http://localhost:3002/api/id0002/onramp/quote" -H "Content-Type: application/x-www-form-urlencoded" -d "fromCurrency=AED&toCurrency=USDC&fromAmount=200&chain=XDC&paymentMethodType=AED-BANK-TRANSFER"
```

## 6. Onramp - Create Transaction

**Onramp.money API endpoint:**
```bash
curl -X POST "http://localhost:3002/api/id0002/onramp/createTransaction" \
  --header 'Content-Type: application/x-www-form-urlencoded' \
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
curl -X POST "${BASE_URL}/api/id0002/onramp/createTransaction" \
  --header 'Content-Type: application/x-www-form-urlencoded' \
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
curl -X POST "http://localhost:3002/api/id0002/onramp/createTransaction" -H "Content-Type: application/x-www-form-urlencoded" -d "chain=XDC&toCurrency=USDC&rate=3.7493&fromAmount=200&depositAddress=0x7eCd41036D5C0D25A8d1270e388ea240308d06Df&customerId=O2FYxMiaeX_79613&toAmount=51.1&fromCurrency=AED&paymentMethodType=AED-BANK-TRANSFER&merchantRecognitionId=test&fiatAccountId=2efc8ca96e833bbb6c0c06dd7c948b52"
```

## 7. Onramp - Get All User Transactions

**Onramp.money API endpoint:**
```bash
curl -X POST "http://localhost:3002/api/id0002/onramp/allUserTransaction" \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'customerId=O2FYxMiaeX_79613' \
  --data-urlencode 'page=1' \
  --data-urlencode 'pageSize=20'
```

**With variables:**
```bash
BASE_URL="http://localhost:3002"
curl -X POST "${BASE_URL}/api/id0002/onramp/allUserTransaction" \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'customerId=O2FYxMiaeX_79613' \
  --data-urlencode 'page=1' \
  --data-urlencode 'pageSize=20'
```

**Single line version:**
```bash
curl -X POST "http://localhost:3002/api/id0002/onramp/allUserTransaction" -H "Content-Type: application/x-www-form-urlencoded" -d "customerId=O2FYxMiaeX_79613&page=1&pageSize=20"
```

## 7a. Onramp - Get Transaction

**Get a single onramp transaction by ID:**
```bash
curl -X POST "http://localhost:3002/api/id0002/onramp/transaction" \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'transactionId=1560780' \
  --data-urlencode 'customerId=O2FYxMiaeX_79613'
```

**With variables:**
```bash
BASE_URL="http://localhost:3002"
TRANSACTION_ID="1560780"
CUSTOMER_ID="O2FYxMiaeX_79613"
curl -X POST "${BASE_URL}/api/id0002/onramp/transaction" \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode "transactionId=${TRANSACTION_ID}" \
  --data-urlencode "customerId=${CUSTOMER_ID}"
```

**Single line version:**
```bash
curl -X POST "http://localhost:3002/api/id0002/onramp/transaction" -H "Content-Type: application/x-www-form-urlencoded" -d "transactionId=1560780&customerId=O2FYxMiaeX_79613"
```

## 7b. Onramp - Update Reference ID

**Update reference ID for an onramp transaction:**
```bash
curl -X PUT "http://localhost:3002/api/id0002/onramp/referenceId" \
  --header 'Content-Type: application/x-www-form-urlencoded' \
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
curl -X PUT "${BASE_URL}/api/id0002/onramp/referenceId" \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode "customerId=${CUSTOMER_ID}" \
  --data-urlencode "transactionId=${TRANSACTION_ID}" \
  --data-urlencode "referenceId=${REFERENCE_ID}"
```

**Single line version:**
```bash
curl -X PUT "http://localhost:3002/api/id0002/onramp/referenceId" -H "Content-Type: application/x-www-form-urlencoded" -d "customerId=qA7M4kehLG_83597&transactionId=1562612&referenceId=TRN12345"
```

## 8. Onramp - Offramp Get Quote

**Onramp.money API endpoint:**
```bash
curl -X POST "http://localhost:3002/api/id0002/offramp/quote" \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'fromCurrency=USDC' \
  --data-urlencode 'toCurrency=PHP' \
  --data-urlencode 'fromAmount=5' \
  --data-urlencode 'chain=XDC'
```

**With variables:**
```bash
BASE_URL="http://localhost:3002"
curl -X POST "${BASE_URL}/api/id0002/offramp/quote" \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'fromCurrency=USDC' \
  --data-urlencode 'toCurrency=PHP' \
  --data-urlencode 'fromAmount=5' \
  --data-urlencode 'chain=XDC'
```

**Single line version:**
```bash
curl -X POST "http://localhost:3002/api/id0002/offramp/quote" -H "Content-Type: application/x-www-form-urlencoded" -d "fromCurrency=USDC&toCurrency=PHP&fromAmount=5&chain=XDC"
```

## 9. Onramp - Offramp Create Transaction

**Onramp.money API endpoint:**
```bash
curl -X POST "http://localhost:3002/api/id0002/offramp/createTransaction" \
  --header 'Content-Type: application/x-www-form-urlencoded' \
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
curl -X POST "${BASE_URL}/api/id0002/offramp/createTransaction" \
  --header 'Content-Type: application/x-www-form-urlencoded' \
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
curl -X POST "http://localhost:3002/api/id0002/offramp/createTransaction" -H "Content-Type: application/x-www-form-urlencoded" -d "chain=XDC&customerId=O2FYxMiaeX_79613&fiatAccountId=123456789&fromAmount=5&fromCurrency=USDC&rate=58.3023&toAmount=269.78&toCurrency=PHP&merchantRecognitionId=test"
```

## 9a. Onramp - Offramp Get Transaction

**Get a single offramp transaction by ID:**
```bash
curl -X POST "http://localhost:3002/api/id0002/offramp/transaction" \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'customerId=3u1YBqhoi3_82586' \
  --data-urlencode 'transactionId=443468'
```

**With variables:**
```bash
BASE_URL="http://localhost:3002"
TRANSACTION_ID="443468"
CUSTOMER_ID="3u1YBqhoi3_82586"
curl -X POST "${BASE_URL}/api/id0002/offramp/transaction" \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode "transactionId=${TRANSACTION_ID}" \
  --data-urlencode "customerId=${CUSTOMER_ID}"
```

**Single line version:**
```bash
curl -X POST "http://localhost:3002/api/id0002/offramp/transaction" -H "Content-Type: application/x-www-form-urlencoded" -d "customerId=3u1YBqhoi3_82586&transactionId=443468"
```

## 10. Onramp - Offramp Get All User Transactions

**Onramp.money API endpoint:**
```bash
curl -X POST "http://localhost:3002/api/id0002/offramp/allUserTransaction" \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'customerId=' \
  --data-urlencode 'page=1' \
  --data-urlencode 'pageSize=20'
```

**With variables:**
```bash
BASE_URL="http://localhost:3002"
curl -X POST "${BASE_URL}/api/id0002/offramp/allUserTransaction" \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'customerId=' \
  --data-urlencode 'page=1' \
  --data-urlencode 'pageSize=20'
```

**Single line version:**
```bash
curl -X POST "http://localhost:3002/api/id0002/offramp/allUserTransaction" -H "Content-Type: application/x-www-form-urlencoded" -d "customerId=&page=1&pageSize=20"
```

## 11. Get Combined Exchange Rate (AED → PHP via USDC)

**Combined endpoint that chains onramp (AED → USDC) and offramp (USDC → PHP) quotes:**
```bash
curl -X POST "http://localhost:3002/api/id0002/getExchangeRate" \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'fromCurrency=AED' \
  --data-urlencode 'toCurrency=PHP' \
  --data-urlencode 'fromAmount=200' \
  --data-urlencode 'chain=XDC' \
  --data-urlencode 'paymentMethodType=AED-BANK-TRANSFER'
```

**With variables:**
```bash
BASE_URL="http://localhost:3002"
curl -X POST "${BASE_URL}/api/id0002/getExchangeRate" \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'fromCurrency=AED' \
  --data-urlencode 'toCurrency=PHP' \
  --data-urlencode 'fromAmount=200' \
  --data-urlencode 'chain=XDC' \
  --data-urlencode 'paymentMethodType=AED-BANK-TRANSFER'
```

**Single line version:**
```bash
curl -X POST "http://localhost:3002/api/id0002/getExchangeRate" -H "Content-Type: application/x-www-form-urlencoded" -d "fromCurrency=AED&toCurrency=PHP&fromAmount=200&chain=XDC&paymentMethodType=AED-BANK-TRANSFER"
```

## 12. Onramp - Bank Details

**Onramp.money API endpoint:**
```bash
curl -X POST "http://localhost:3002/api/id0002/bank/bankDetails" \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'customerId=O2FYxMiaeX_79613' \
  --data-urlencode 'fromCurrency=AED' \
  --data-urlencode 'transactionId=1545994' \
  --data-urlencode 'paymentMethodType=AED-BANK-TRANSFER'
```

**With variables:**
```bash
BASE_URL="http://localhost:3002"
curl -X POST "${BASE_URL}/api/id0002/bank/bankDetails" \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'customerId=O2FYxMiaeX_79613' \
  --data-urlencode 'fromCurrency=AED' \
  --data-urlencode 'transactionId=1545994' \
  --data-urlencode 'paymentMethodType=AED-BANK-TRANSFER'
```

**Single line version:**
```bash
curl -X POST "http://localhost:3002/api/id0002/bank/bankDetails" -H "Content-Type: application/x-www-form-urlencoded" -d "customerId=O2FYxMiaeX_79613&fromCurrency=AED&transactionId=1545994&paymentMethodType=AED-BANK-TRANSFER"
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

## Single Line Commands (Copy-Paste Ready)

### Get Quote
```bash
curl -X POST "http://localhost:3002/api/id0001/get-quote?sourceCurrency=XDC&targetCurrency=PHP&sourceAmount=50"
```

### Accept Quote
```bash
curl -X POST "http://localhost:3002/api/id0001/accept-quote?quoteId=20907530396610106886"
```

### Cash Out
```bash
# Simple format (matching test-cash-out.js)
curl -X POST -d '{"currency":"PHP","amount":"5","channelName":"INSTAPAY","channelSubject":"bpi","extendInfo":{"recipientName":"Rebecah Dausen","recipientAccountNumber":"0566698575"}}' "http://localhost:3002/api/id0001/cash-out"
```

### Get Account
```bash
curl -X GET "http://localhost:3002/api/id0001/account"
```

### Onramp Get Quote
```bash
curl -X POST "http://localhost:3002/api/id0002/onramp/quote" -H "Content-Type: application/x-www-form-urlencoded" -d "fromCurrency=AED&toCurrency=USDC&fromAmount=200&chain=XDC&paymentMethodType=AED-BANK-TRANSFER"
```

### Onramp Create Transaction
```bash
curl -X POST "http://localhost:3002/api/id0002/onramp/createTransaction" -H "Content-Type: application/x-www-form-urlencoded" -d "chain=XDC&toCurrency=USDC&rate=3.7493&fromAmount=200&depositAddress=0x7eCd41036D5C0D25A8d1270e388ea240308d06Df&customerId=O2FYxMiaeX_79613&toAmount=51.1&fromCurrency=AED&paymentMethodType=AED-BANK-TRANSFER&merchantRecognitionId=test&fiatAccountId=2efc8ca96e833bbb6c0c06dd7c948b52"
```

### Onramp Get All User Transactions
```bash
curl -X POST "http://localhost:3002/api/id0002/onramp/allUserTransaction" -H "Content-Type: application/x-www-form-urlencoded" -d "customerId=O2FYxMiaeX_79613&page=1&pageSize=20"
```

### Onramp Get Transaction
```bash
curl -X POST "http://localhost:3002/api/id0002/onramp/transaction" -H "Content-Type: application/x-www-form-urlencoded" -d "transactionId=1560780&customerId=O2FYxMiaeX_79613"
```

### Onramp Update Reference ID
```bash
curl -X PUT "http://localhost:3002/api/id0002/onramp/referenceId" -H "Content-Type: application/x-www-form-urlencoded" -d "customerId=qA7M4kehLG_83597&transactionId=1562612&referenceId=TRN12345"
```

### Onramp Offramp Get Quote
```bash
curl -X POST "http://localhost:3002/api/id0002/offramp/quote" -H "Content-Type: application/x-www-form-urlencoded" -d "fromCurrency=USDC&toCurrency=PHP&fromAmount=5&chain=XDC"
```

### Onramp Offramp Create Transaction
```bash
curl -X POST "http://localhost:3002/api/id0002/offramp/createTransaction" -H "Content-Type: application/x-www-form-urlencoded" -d "chain=XDC&customerId=O2FYxMiaeX_79613&fiatAccountId=123456789&fromAmount=5&fromCurrency=USDC&rate=58.3023&toAmount=269.78&toCurrency=PHP&merchantRecognitionId=test"
```

### Onramp Offramp Get Transaction
```bash
curl -X POST "http://localhost:3002/api/id0002/offramp/transaction" -H "Content-Type: application/x-www-form-urlencoded" -d "customerId=3u1YBqhoi3_82586&transactionId=443468"
```

### Onramp Offramp Get All User Transactions
```bash
curl -X POST "http://localhost:3002/api/id0002/offramp/allUserTransaction" -H "Content-Type: application/x-www-form-urlencoded" -d "customerId=&page=1&pageSize=20"
```

### Get Combined Exchange Rate (AED → PHP)
```bash
curl -X POST "http://localhost:3002/api/id0002/getExchangeRate" -H "Content-Type: application/x-www-form-urlencoded" -d "fromCurrency=AED&toCurrency=PHP&fromAmount=200&chain=XDC&paymentMethodType=AED-BANK-TRANSFER"
```

## Production URLs (via Nginx)

### Get Quote
```bash
curl -X POST "https://xdc.cash/api/id0001/get-quote?sourceCurrency=XDC&targetCurrency=PHP&sourceAmount=50"
```

### Accept Quote
```bash
curl -X POST "https://xdc.cash/api/id0001/accept-quote?quoteId=20907530396610106886"
```

### Cash Out
```bash
curl -X POST -d '{"internalOrderId":"1234","currency":"PHP","amount":"50","channelName":"SWIFTPAY_PESONET","channelSubject":"gcash","extendInfo":{"recipientName":"sandy-open-api-test","recipientAccountNumber":"123456789"}}' "https://xdc.cash/api/id0001/cash-out"
```

### Get Account
```bash
curl -X GET "https://xdc.cash/api/id0001/account"
```

### Onramp Get Quote
```bash
curl -X POST "https://xdc.cash/api/id0002/onramp/quote" -H "Content-Type: application/x-www-form-urlencoded" -d "fromCurrency=AED&toCurrency=USDC&fromAmount=200&chain=XDC&paymentMethodType=AED-BANK-TRANSFER"
```

### Onramp Create Transaction
```bash
curl -X POST "https://xdc.cash/api/id0002/onramp/createTransaction" -H "Content-Type: application/x-www-form-urlencoded" -d "chain=XDC&toCurrency=USDC&rate=3.7493&fromAmount=200&depositAddress=0x7eCd41036D5C0D25A8d1270e388ea240308d06Df&customerId=O2FYxMiaeX_79613&toAmount=51.1&fromCurrency=AED&paymentMethodType=AED-BANK-TRANSFER&merchantRecognitionId=test&fiatAccountId=2efc8ca96e833bbb6c0c06dd7c948b52"
```

### Onramp Get All User Transactions
```bash
curl -X POST "https://xdc.cash/api/id0002/onramp/allUserTransaction" -H "Content-Type: application/x-www-form-urlencoded" -d "customerId=O2FYxMiaeX_79613&page=1&pageSize=20"
```

### Onramp Get Transaction
```bash
curl -X POST "https://xdc.cash/api/id0002/onramp/transaction" -H "Content-Type: application/x-www-form-urlencoded" -d "transactionId=1560780&customerId=O2FYxMiaeX_79613"
```

### Onramp Update Reference ID
```bash
curl -X PUT "https://xdc.cash/api/id0002/onramp/referenceId" -H "Content-Type: application/x-www-form-urlencoded" -d "customerId=qA7M4kehLG_83597&transactionId=1562612&referenceId=TRN12345"
```

### Onramp Offramp Get Quote
```bash
curl -X POST "https://xdc.cash/api/id0002/offramp/quote" -H "Content-Type: application/x-www-form-urlencoded" -d "fromCurrency=USDC&toCurrency=PHP&fromAmount=5&chain=XDC"
```

### Onramp Offramp Create Transaction
```bash
curl -X POST "https://xdc.cash/api/id0002/offramp/createTransaction" -H "Content-Type: application/x-www-form-urlencoded" -d "chain=XDC&customerId=O2FYxMiaeX_79613&fiatAccountId=123456789&fromAmount=5&fromCurrency=USDC&rate=58.3023&toAmount=269.78&toCurrency=PHP&merchantRecognitionId=test"
```

### Onramp Offramp Get Transaction
```bash
curl -X POST "https://xdc.cash/api/id0002/offramp/transaction" -H "Content-Type: application/x-www-form-urlencoded" -d "customerId=3u1YBqhoi3_82586&transactionId=443468"
```

### Onramp Offramp Get All User Transactions
```bash
curl -X POST "https://xdc.cash/api/id0002/offramp/allUserTransaction" -H "Content-Type: application/x-www-form-urlencoded" -d "customerId=&page=1&pageSize=20"
```

### Get Combined Exchange Rate (AED → PHP)
```bash
curl -X POST "https://xdc.cash/api/id0002/getExchangeRate" -H "Content-Type: application/x-www-form-urlencoded" -d "fromCurrency=AED&toCurrency=PHP&fromAmount=200&chain=XDC&paymentMethodType=AED-BANK-TRANSFER"
```

## Notes

- **No Content-Type header needed** - Server handles it automatically (except for cash-out which requires it)
- **Partner ID** (`id0001`) is extracted from URL path
- **Methods**: Most endpoints use POST, account endpoint uses GET
- **Signature generation is automatic** - No need to configure

## Testing Script

Save as `test-all.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3002"
API_BASE="${BASE_URL}/api/id0001"

echo "Testing Get Quote..."
curl -X POST "${API_BASE}/get-quote?sourceCurrency=XDC&targetCurrency=PHP&sourceAmount=50"
echo ""
echo ""

echo "Testing Accept Quote..."
QUOTE_ID="20907530396610106886"
curl -X POST "${API_BASE}/accept-quote?quoteId=${QUOTE_ID}"
echo ""
echo ""

echo "Testing Cash Out..."
curl -X POST \
  -d '{"internalOrderId":"1234","currency":"PHP","amount":"50","channelName":"SWIFTPAY_PESONET","channelSubject":"gcash","extendInfo":{"recipientName":"sandy-open-api-test","recipientAccountNumber":"123456789"}}' \
  "${API_BASE}/cash-out"
echo ""
```

Make it executable:
```bash
chmod +x test-all.sh
./test-all.sh
```

