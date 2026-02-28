# Quick Reference

Production base URL: `https://xdc.cash`. Replace `<your_ref_id>` with your reference ID and `<your-api-key>` with your API key (when required) in every request.

## PHP offramp (XDC ↔ PHP)

| Endpoint | cURL |
|----------|------|
| Get Quote | `curl -X POST "https://xdc.cash/api/get-quote?ref_id=<your_ref_id>&sourceCurrency=XDC&targetCurrency=PHP&sourceAmount=50" -H "X-API-Key: <your-api-key>"` |
| Accept Quote | `curl -X POST "https://xdc.cash/api/accept-quote?ref_id=<your_ref_id>&quoteId=QUOTE_ID" -H "X-API-Key: <your-api-key>"` |
| Cash Out | `curl -X POST "https://xdc.cash/api/cash-out" -H "X-API-Key: <your-api-key>" -H "Content-Type: application/json" -d '{"ref_id":"<your_ref_id>","currency":"PHP","amount":"5",...}'` |
| Account | `curl -X GET "https://xdc.cash/api/account?ref_id=<your_ref_id>" -H "X-API-Key: <your-api-key>"` |

## Onramp

| Endpoint | cURL |
|----------|------|
| Get Quote | `curl -X POST "https://xdc.cash/api/onramp/quote" -H "X-API-Key: <your-api-key>" -H "Content-Type: application/x-www-form-urlencoded" -d "ref_id=<your_ref_id>&fromCurrency=AED&toCurrency=USDC&fromAmount=200&chain=XDC&paymentMethodType=AED-BANK-TRANSFER"` |
| Create Transaction | `curl -X POST "https://xdc.cash/api/onramp/createTransaction" -H "X-API-Key: <your-api-key>" -H "Content-Type: application/x-www-form-urlencoded" -d "ref_id=<your_ref_id>&chain=XDC&toCurrency=USDC&rate=3.7493&fromAmount=200&..."` |
| Get Transaction | `curl -X POST "https://xdc.cash/api/onramp/transaction" -H "X-API-Key: <your-api-key>" -H "Content-Type: application/x-www-form-urlencoded" -d "ref_id=<your_ref_id>&transactionId=ID&customerId=CID"` |
| Update Reference ID | `curl -X PUT "https://xdc.cash/api/onramp/referenceId" -H "X-API-Key: <your-api-key>" -H "Content-Type: application/x-www-form-urlencoded" -d "ref_id=<your_ref_id>&customerId=CID&transactionId=ID&referenceId=REF"` |

## Offramp

| Endpoint | cURL |
|----------|------|
| Get Quote | `curl -X POST "https://xdc.cash/api/offramp/quote" -H "X-API-Key: <your-api-key>" -H "Content-Type: application/x-www-form-urlencoded" -d "ref_id=<your_ref_id>&fromCurrency=USDC&toCurrency=PHP&fromAmount=5&chain=XDC"` |
| Create Transaction | `curl -X POST "https://xdc.cash/api/offramp/createTransaction" -H "X-API-Key: <your-api-key>" -H "Content-Type: application/x-www-form-urlencoded" -d "ref_id=<your_ref_id>&chain=XDC&customerId=CID&fiatAccountId=FID&fromAmount=5&fromCurrency=USDC&rate=RATE&toAmount=AMT&toCurrency=PHP"` |
| Get Transaction | `curl -X POST "https://xdc.cash/api/offramp/transaction" -H "X-API-Key: <your-api-key>" -H "Content-Type: application/x-www-form-urlencoded" -d "ref_id=<your_ref_id>&customerId=CID&transactionId=ID"` |

## Exchange Rate

| Endpoint | cURL |
|----------|------|
| AED→PHP | `curl -X POST "https://xdc.cash/api/getExchangeRate" -H "X-API-Key: <your-api-key>" -H "Content-Type: application/x-www-form-urlencoded" -d "ref_id=<your_ref_id>&fromCurrency=AED&toCurrency=PHP&fromAmount=200&chain=XDC&paymentMethodType=AED-BANK-TRANSFER"` |
| INR→PHP | `curl -X POST "https://xdc.cash/api/getExchangeRate" -H "X-API-Key: <your-api-key>" -H "Content-Type: application/x-www-form-urlencoded" -d "ref_id=<your_ref_id>&fromCurrency=INR&toCurrency=PHP&fromAmount=1000&chain=XDC&paymentMethodType=UPI"` |
