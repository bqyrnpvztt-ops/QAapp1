// Vercel default API structure - no custom vercel.json needed
const express = require('express');

const app = express();

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Default Vercel API working',
    timestamp: new Date().toISOString()
  });
});

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Export for Vercel
module.exports = app;
