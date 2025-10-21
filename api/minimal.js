const express = require('express');

const app = express();

// Basic middleware
app.use(express.json());

// Simple test endpoint
app.get('/api/test', (req, res) => {
  console.log('Test endpoint called');
  res.json({ 
    message: 'Test endpoint working',
    timestamp: new Date().toISOString(),
    node_version: process.version
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('Health check requested');
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY
    }
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
});

// Export for Vercel
module.exports = app;
