# Welcome to XDC Cash

**Lightning-fast onramp and offramp** ⚡️

Welcome to XDC Cash API documentation. We offer robust APIs to integrate onramp and offramp services—enabling users to convert between fiat (AED, INR, PHP) and crypto (USDC on XDC) seamlessly.

---

## Introduction

XDC Cash opens the gateway for your users into crypto. Whether it's purchasing USDC, sending remittance to Philippines, or seamless conversions between fiat and crypto across UAE, India, and Philippines—we have you covered.

With **production-ready APIs** and clear documentation, XDC Cash enables businesses to onboard users for **onramp** (fiat → crypto) and **offramp** (crypto → fiat) operations.

---

## Key Features

- **Multi-Currency Support:** AED (UAE), INR (India), PHP (Philippines), USDC (XDC chain)
- **Multiple Payment Methods:** Bank transfer, UPI, IMPS, InstaPay, PESONet, and more
- **Competitive Rates:** Transparent conversion rates with fee breakdown
- **Production API:** Single base URL for all operations

---

## Base URL

All API requests use the production endpoint:

```
https://xdc.cash
```

**Path format:** `/api/{endpoint}` — e.g. `/api/get-quote`, `/api/onramp/quote`.

**Reference ID:** Pass your reference ID in every request as `ref_id` (in the query string for GET, or in the request body for POST). Use the value provided to you when integrating.

---

## Authentication

- **Reference ID:** Include your `ref_id` in every request (query or body) to select the integration.
- **API key (optional):** If the server has API key authentication enabled, send your key in the `X-API-Key` header or `Authorization: Bearer <key>`. See [Authentication (API key)](AUTH.md) for setup and examples.

**Content-Type:** `application/x-www-form-urlencoded` for most endpoints; `application/json` for Cash Out.

---

## Quick Links

- [Onramp Operations](onramp-api.md) — Fetch quote, create transaction, get transaction status
- [Offramp Operations](offramp-api.md) — Sell crypto, fetch quote, transaction status
- [Get Exchange Rate](get-exchange-rate.md) — Combined AED/INR → PHP rate in one call
