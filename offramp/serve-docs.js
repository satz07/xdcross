/**
 * Serves the built Honkit/GitBook docs (_book/) for PM2.
 * Run after: npm run docs:build
 * Port: DOCS_PORT or 3003
 */
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.DOCS_PORT || 3003;
const BOOK_DIR = path.join(__dirname, '_book');

app.use(express.static(BOOK_DIR, { index: 'index.html', redirect: true }));

app.listen(PORT, () => {
  console.log(`Docs server: http://localhost:${PORT} (serving _book/)`);
});
