const express = require('express');
const cors = require('cors');

const app = express();

// Enable CORS
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Serverless function is working!',
    timestamp: new Date().toISOString(),
    vercel: process.env.VERCEL ? 'YES' : 'NO',
    vercelEnv: process.env.VERCEL_ENV || 'unknown'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Export for Vercel
module.exports = app;
