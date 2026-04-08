const express = require('express');
const compression = require('compression');
const path = require('path');

const app = express();
const PORT = 3847;

// Gzip compression
app.use(compression());

// Cache headers for static assets
app.use((req, res, next) => {
  if (req.url.match(/\.(css|js|png|svg|json|ico)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=86400');
  }
  // Service worker must not be cached aggressively
  if (req.url === '/sw.js') {
    res.setHeader('Cache-Control', 'no-cache');
  }
  next();
});

// Static files
app.use(express.static(path.join(__dirname), {
  extensions: ['html'],
  index: 'index.html'
}));

// SPA fallback
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🕐 Tempus server running on http://localhost:${PORT}`);
});
