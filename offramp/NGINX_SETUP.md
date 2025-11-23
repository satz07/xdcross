# Nginx Setup Guide for Offramp API

## URL Structure

**After Nginx is configured, the public URL will be:**

```
https://xdc.cash/api/id0001/get-quote?sourceCurrency=XDC&targetCurrency=PHP&sourceAmount=50
```

**OR (if HTTP only):**

```
http://xdc.cash/api/id0001/get-quote?sourceCurrency=XDC&targetCurrency=PHP&sourceAmount=50
```

**Important:** Port 3002 is NOT in the public URL. It's only used internally between Nginx and Node.js.

## Architecture

```
Internet → Nginx (port 80/443) → Node.js (port 3002, localhost only)
         ↑                        ↑
    Public URL              Internal only
```

## Quick Setup

### 1. Install Nginx

```bash
sudo apt update
sudo apt install nginx -y
```

### 2. Copy Configuration

```bash
# Copy configuration file
sudo cp nginx.conf /etc/nginx/sites-available/offramp-api

# The server_name is already set to xdc.cash
# If you need to change it, edit the file:
sudo nano /etc/nginx/sites-available/offramp-api
```

### 3. Enable Site

```bash
# Create symlink to enable
sudo ln -s /etc/nginx/sites-available/offramp-api /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default
```

### 4. Test and Reload

```bash
# Test configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx
```

### 5. Configure Firewall

```bash
# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS (if using SSL)
sudo ufw allow 443/tcp
```

### 6. Set Up SSL (Recommended)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate for xdc.cash
sudo certbot --nginx -d xdc.cash

# Certbot will automatically:
# - Get SSL certificate
# - Configure Nginx for HTTPS
# - Set up HTTP to HTTPS redirect
```

## Testing

### Test HTTP (if SSL not configured)

```bash
curl http://xdc.cash/health
curl -X POST \
  -H "Content-Type: application/json" \
  "http://xdc.cash/api/id0001/get-quote?sourceCurrency=XDC&targetCurrency=PHP&sourceAmount=50"
```

### Test HTTPS (after SSL setup)

```bash
curl https://xdc.cash/health
curl -X POST \
  -H "Content-Type: application/json" \
  "https://xdc.cash/api/id0001/get-quote?sourceCurrency=XDC&targetCurrency=PHP&sourceAmount=50"
```

## Important Notes

1. **Port 3002 is internal only** - Not exposed to the internet
2. **Public URL uses standard ports** - 80 (HTTP) or 443 (HTTPS)
3. **Query strings are preserved** - Critical for signature generation
4. **Node.js server should only listen on localhost** - Not 0.0.0.0:3002

## Verify Node.js Server Configuration

Make sure your Node.js server is configured correctly:

```javascript
// In server.js, ensure it listens on localhost (not 0.0.0.0)
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running on port ${PORT}`);
});
```

Or if you need to listen on all interfaces (less secure):

```javascript
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Troubleshooting

### Check if Nginx is running

```bash
sudo systemctl status nginx
```

### Check if Node.js is running

```bash
# Test directly (should work)
curl http://127.0.0.1:3002/health

# Check if port 3002 is listening
netstat -tlnp | grep 3002
```

### Check Nginx logs

```bash
# Access logs
sudo tail -f /var/log/nginx/offramp-api-access.log

# Error logs
sudo tail -f /var/log/nginx/offramp-api-error.log
```

### Common Issues

1. **502 Bad Gateway**
   - Node.js server not running: `curl http://127.0.0.1:3002/health`
   - Check Nginx error logs

2. **Query string missing**
   - Ensure `proxy_pass` doesn't have trailing slash
   - Check Nginx config preserves query strings

3. **Port 3002 in URL**
   - This shouldn't happen - Nginx should hide it
   - Check DNS/domain configuration

## Summary

- **Public URL:** `https://xdc.cash/api/id0001/get-quote?...`
- **No port 3002 in public URL**
- **Port 3002 is internal only** (Nginx → Node.js)
- **Nginx listens on port 80/443** (standard HTTP/HTTPS ports)

