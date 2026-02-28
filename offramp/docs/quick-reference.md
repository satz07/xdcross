# Quick Reference

Production curl commands. Base URL: `https://xdc.cash`

## Onramp (id0002)

| Endpoint | cURL |
|----------|------|
| Get Quote | `curl -X POST "https://xdc.cash/api/id0002/onramp/quote" -H "Content-Type: application/x-www-form-urlencoded" -d "fromCurrency=AED&toCurrency=USDC&fromAmount=200&chain=XDC&paymentMethodType=AED-BANK-TRANSFER"` |
| Create Transaction | `curl -X POST "https://xdc.cash/api/id0002/onramp/createTransaction" -H "Content-Type: application/x-www-form-urlencoded" -d "chain=XDC&toCurrency=USDC&rate=3.7493&fromAmount=200&depositAddress=0x...&customerId=xxx&toAmount=51.1&fromCurrency=AED&paymentMethodType=AED-BANK-TRANSFER&fiatAccountId=xxx"` |
| Get Transaction | `curl -X POST "https://xdc.cash/api/id0002/onramp/transaction" -H "Content-Type: application/x-www-form-urlencoded" -d "transactionId=1560780&customerId=xxx"` |
| Update Reference ID | `curl -X PUT "https://xdc.cash/api/id0002/onramp/referenceId" -H "Content-Type: application/x-www-form-urlencoded" -d "customerId=xxx&transactionId=1562612&referenceId=TRN12345"` |

## Offramp (id0002)

| Endpoint | cURL |
|----------|------|
| Get Quote | `curl -X POST "https://xdc.cash/api/id0002/offramp/quote" -H "Content-Type: application/x-www-form-urlencoded" -d "fromCurrency=USDC&toCurrency=PHP&fromAmount=5&chain=XDC"` |
| Create Transaction | `curl -X POST "https://xdc.cash/api/id0002/offramp/createTransaction" -H "Content-Type: application/x-www-form-urlencoded" -d "chain=XDC&customerId=xxx&fiatAccountId=123456789&fromAmount=5&fromCurrency=USDC&rate=58.3023&toAmount=269.78&toCurrency=PHP"` |
| Get Transaction | `curl -X POST "https://xdc.cash/api/id0002/offramp/transaction" -H "Content-Type: application/x-www-form-urlencoded" -d "customerId=xxx&transactionId=443468"` |

## Exchange Rate

| Endpoint | cURL |
|----------|------|
| AED→PHP | `curl -X POST "https://xdc.cash/api/id0002/getExchangeRate" -H "Content-Type: application/x-www-form-urlencoded" -d "fromCurrency=AED&toCurrency=PHP&fromAmount=200&chain=XDC&paymentMethodType=AED-BANK-TRANSFER"` |
| INR→PHP | `curl -X POST "https://xdc.cash/api/id0002/getExchangeRate" -H "Content-Type: application/x-www-form-urlencoded" -d "fromCurrency=INR&toCurrency=PHP&fromAmount=1000&chain=XDC&paymentMethodType=UPI"` |
