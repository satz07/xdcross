// server_sign_check.js
const CryptoJS = require('crypto-js');

// template you use in code (with placeholders)
const template = "https://api.pro.coins.ph/openapi/convert/v1/get-quote?sourceCurrency=XDC&targetCurrency=PHP&sourceAmount=50&recvWindow=5000&timestamp={{timestamp}}&signature={{sign}}";

// set your keys from env
const API_KEY = process.env.COINS_APIKEY || "";
const SECRET  = process.env.COINS_SECRET || "";

// build totalParams exactly like Postman
function totalParamsFromTemplate(tpl, ts) {
  const q = tpl.split("?")[1] || "";
  let qs = q.replace("{{timestamp}}", ts);
  qs = qs.replace(/(&|\b)signature=[^&]*/g, "").replace(/[&]$/, "");
  return qs; // Coins signs just the query (no signature param)
}

// HMAC hex (UTF-8 secret by default)
function hmacHex(msg, sec) {
  return CryptoJS.HmacSHA256(msg, sec).toString(CryptoJS.enc.Hex);
}

// If your secret is base64/base64url, use this instead:
// const key = CryptoJS.enc.Base64.parse(SECRET);
// const sig = CryptoJS.HmacSHA256(totalParams, key).toString(CryptoJS.enc.Hex);

const timestamp = Date.now().toString();
const totalParams = totalParamsFromTemplate(template, timestamp);
const signature = hmacHex(totalParams, SECRET);

const finalUrl = `https://api.pro.coins.ph/openapi/convert/v1/get-quote?${totalParams}&signature=${signature}`;

console.log(JSON.stringify({
  timestamp, totalParams, signature, finalUrl,
  headers: { "X-COINS-APIKEY": API_KEY }
}, null, 2));
