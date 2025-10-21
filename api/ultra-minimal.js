// Ultra-minimal API for Vercel debugging
const express = require('express');

const app = express();

// Basic JSON parsing
app.use(express.json());

// Test endpoint
app.get('/api/test', (req, res) => {
  console.log('Test endpoint called');
  res.json({ 
    message: 'Test endpoint working',
    timestamp: new Date().toISOString()
  });
});

// Health endpoint
app.get('/api/health', (req, res) => {
  console.log('Health check called');
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Catch-all error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Export for Vercel
module.exports = app;
