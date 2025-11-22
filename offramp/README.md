# Offramp API Proxy

Node.js Express API server with Coins.ph integration and dynamic signature generation.

## Features

- **Express.js** - Fast, unopinionated web framework
- **Coins.ph Integration** - Pre-configured endpoints with HMAC SHA256 signature generation
- **Dynamic Signature Generation** - Matches Postman pre-script logic exactly
- **Rate Limiting** - Prevents abuse
- **CORS Support** - Cross-origin resource sharing
- **Security Headers** - Helmet.js for security

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your Coins.ph credentials:
```env
PORT=3000
COINS_API_KEY=HRqjJcBxjppZAvVyzZvdxMI95O74jPDYbd2sbGaBecvPIHd6jl4FgHs78wQKNUCE
COINS_API_SECRET=your-coins-api-secret-here
NODE_ENV=development
```

## Running the Server

### Development (with auto-reload):
```bash
npm run dev
```

### Production:
```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

## API Endpoints

### Health Check
```
GET /health
```
Returns server status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Get Quote
```
POST /api/coins/get-quote?sourceCurrency=XDC&targetCurrency=PHP&sourceAmount=50
```

Get a quote for currency conversion.

**Query Parameters:**
- `sourceCurrency` (required) - Source currency code (e.g., XDC, BTC, ETH)
- `targetCurrency` (required) - Target currency code (e.g., PHP, USD)
- `sourceAmount` (required) - Amount to convert
- `recvWindow` (optional) - Receive window

**Note:** The `timestamp` and `signature` parameters are automatically generated and added to the request.

**Example Request:**
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  "http://localhost:3002/api/coins/get-quote?sourceCurrency=XDC&targetCurrency=PHP&sourceAmount=50"
```

**Example Response:**
```json
{
  "success": true,
  "source": "coins.ph",
  "data": {
    "quoteId": "2088568334659666570",
    "sourceCurrency": "XDC",
    "targetCurrency": "PHP",
    "sourceAmount": "50",
    "targetAmount": "1250.00",
    "exchangeRate": "25.00"
  },
  "timestamp": "1763801057453",
  "signature": "0ccb5bf3b65d497ff4f901da80c3f8275e6987b44eb44e701d3911e8799f55f3",
  "requestParams": {
    "sourceCurrency": "XDC",
    "targetCurrency": "PHP",
    "sourceAmount": "50",
    "timestamp": "1763801057453",
    "signature": "0ccb5bf3b65d497ff4f901da80c3f8275e6987b44eb44e701d3911e8799f55f3"
  }
}
```

### Accept Quote
```
POST /api/coins/accept-quote?quoteId=2088568334659666570
```

Accept a quote and execute the currency conversion.

**Query Parameters:**
- `quoteId` (required) - Quote ID from the get-quote response

**Note:** The `timestamp` and `signature` parameters are automatically generated and added to the request.

**Example Request:**
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-COINS-APIKEY: YOUR_API_KEY" \
  "http://localhost:3002/api/coins/accept-quote?quoteId=2088568334659666570"
```

**Example Response:**
```json
{
  "success": true,
  "source": "coins.ph",
  "data": {
    "orderId": "123456789",
    "status": "completed",
    "sourceCurrency": "XDC",
    "targetCurrency": "PHP",
    "sourceAmount": "50",
    "targetAmount": "1250.00"
  },
  "timestamp": "1763801057453",
  "signature": "0ccb5bf3b65d497ff4f901da80c3f8275e6987b44eb44e701d3911e8799f55f3",
  "requestParams": {
    "quoteId": "2088568334659666570",
    "timestamp": "1763801057453",
    "signature": "0ccb5bf3b65d497ff4f901da80c3f8275e6987b44eb44e701d3911e8799f55f3"
  }
}
```

**Error Responses:**
```json
{
  "success": false,
  "error": {
    "message": "Signature for this request is not valid.",
    "status": 400,
    "data": {
      "code": -1022,
      "msg": "Signature for this request is not valid."
    }
  }
}
```

## Testing

### Run test script:
```bash
npm test
```

### Manual testing with cURL:

#### Get Quote:
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  "http://localhost:3000/api/coins/get-quote?sourceCurrency=XDC&targetCurrency=PHP&sourceAmount=50"
```

#### Accept Quote:
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  "http://localhost:3002/api/coins/accept-quote?quoteId=2088568334659666570"
```

#### Using JavaScript/Node.js:
```javascript
const axios = require('axios');

// Accept Quote
let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'http://localhost:3002/api/coins/accept-quote?quoteId=2088568334659666570',
  headers: { 
    'Content-Type': 'application/json'
  }
};

axios.request(config)
  .then((response) => {
    console.log(JSON.stringify(response.data));
  })
  .catch((error) => {
    console.log(error);
  });
```

## Signature Generation

The signature generation matches the Postman pre-script logic exactly:

1. Get query string from URL: `request.url.substr(request.url.indexOf("?")+1,request.url.length-1)`
2. Replace `{{timestamp}}` with actual timestamp: `new Date().getTime().toString()`
3. Remove `&signature={{sign}}` placeholder
4. Generate HMAC SHA256 signature: `CryptoJS.HmacSHA256(str, secret)`
5. Convert to hex: `CryptoJS.enc.Hex.stringify(signature)`

Each request automatically generates:
- Fresh timestamp (milliseconds since epoch)
- Unique signature (HMAC SHA256 of query string with timestamp)

## Project Structure

```
offramp/
├── server.js              # Main server file
├── package.json           # Dependencies
├── .env                   # Environment variables (not in git)
├── .env.example           # Example environment file
├── routes/
│   └── coins.js          # Coins.ph API routes
└── utils/
    └── signature.js      # HMAC SHA256 signature generation
```

## Logging

The server logs detailed information for each request:
- **BEFORE REPLACEMENTS**: Original query string and timestamp
- **AFTER timestamp replace**: Query string with timestamp
- **AFTER signature placeholder removal**: Clean query string
- **AFTER ALL REPLACEMENTS**: Final query string, signature, and API key
- **FINAL REQUEST**: Complete URL and headers

## License

ISC

