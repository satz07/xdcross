# Host API docs at xdc.cash/api-docs

Serve the built documentation on the same server as the offramp API, under **https://xdc.cash/api-docs**.

You can either **serve static files with Nginx** (Option A) or **run a small Node server under PM2** and proxy to it (Option B).

---

## Option A: Nginx serves `_book/` (no PM2 for docs)

### 1. Build the docs

```bash
cd /path/to/offramp
npm run docs:build
```

This creates **`_book/`** at the project root.

### 2. Nginx: serve `/api-docs` from disk

Replace `/path/to/offramp` with your app path.

```nginx
location /api-docs/ {
    alias /path/to/offramp/_book/;
    index index.html;
}
location = /api-docs {
    return 301 /api-docs/;
}
```

Reload Nginx: `sudo nginx -t && sudo systemctl reload nginx`.

---

## Option B: PM2 runs the docs server (recommended if you use PM2 for the API)

Docs are served by a small Node app (`serve-docs.js`) on port **3003**. Nginx proxies `/api-docs` to it. Both API and docs are managed by PM2.

### 1. Build the docs

```bash
cd /path/to/offramp
npm run docs:build
```

### 2. Start API and docs with PM2

```bash
pm2 start ecosystem.config.js
```

This starts:

- **offramp-api** (port 3002)
- **offramp-docs** (port 3003, serves `_book/`)

Start only the docs app:

```bash
pm2 start ecosystem.config.js --only offramp-docs
```

Useful commands:

```bash
pm2 status
pm2 logs offramp-docs
pm2 restart offramp-docs
pm2 stop offramp-docs
```

### 3. Nginx: proxy `/api-docs` to port 3003

In the same `server` block as **xdc.cash**:

```nginx
# API (existing)
location /api/ {
    proxy_pass http://127.0.0.1:3002;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# API docs (PM2 app on 3003)
location /api-docs/ {
    proxy_pass http://127.0.0.1:3003/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
location = /api-docs {
    return 301 /api-docs/;
}
```

**Note:** `proxy_pass http://127.0.0.1:3003/` has a trailing slash so that `https://xdc.cash/api-docs/` is sent to the docs app as `/` and it serves the root of `_book/`.

Reload Nginx: `sudo nginx -t && sudo systemctl reload nginx`.

### 4. After updating docs

Rebuild and restart the docs app:

```bash
npm run docs:build
pm2 restart offramp-docs
```

### 5. Port

Default docs port is **3003** (`DOCS_PORT` in `ecosystem.config.js`). To change it, set `DOCS_PORT` in the `offramp-docs` env and use that port in Nginx `proxy_pass`.

---

## Summary

| Step | Option A (Nginx only) | Option B (PM2) |
|------|------------------------|----------------|
| Build | `npm run docs:build` | `npm run docs:build` |
| Run | — | `pm2 start ecosystem.config.js` (or `--only offramp-docs`) |
| Nginx | `alias /path/to/offramp/_book/;` | `proxy_pass http://127.0.0.1:3003/;` |
| URL | **https://xdc.cash/api-docs/** | **https://xdc.cash/api-docs/** |

Optional: add `_book/` to `.gitignore` if you build on the server and don’t commit the built files.
