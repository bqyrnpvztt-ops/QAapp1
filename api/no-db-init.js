const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy for Vercel
app.set('trust proxy', 1);

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('Supabase configuration check:');
console.log('SUPABASE_URL exists:', !!supabaseUrl);
console.log('SUPABASE_ANON_KEY exists:', !!supabaseKey);

let supabase = null;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  console.error('Please set SUPABASE_URL and SUPABASE_ANON_KEY in your Vercel environment variables');
} else {
  try {
    console.log('Creating Supabase client...');
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client created successfully');
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
  }
}

// File upload configuration (simplified for Vercel)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB limit (reduced for serverless)
    files: 3 // Maximum 3 files (reduced for serverless)
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Check if Supabase is available
const checkSupabase = (req, res, next) => {
  if (!supabase) {
    return res.status(503).json({ 
      error: 'Database service unavailable', 
      message: 'Please configure Supabase environment variables' 
    });
  }
  next();
};

// JWT authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// API Routes

// Simple test endpoint (no database required)
app.get('/api/test', (req, res) => {
  try {
    console.log('Test endpoint called');
    res.json({ 
      message: 'Test endpoint working',
      timestamp: new Date().toISOString(),
      node_version: process.version
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({ error: 'Test failed', message: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  try {
    console.log('Health check requested');
    console.log('Supabase configured:', !!supabase);
    console.log('Environment variables:', {
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
      JWT_SECRET: !!process.env.JWT_SECRET
    });
    
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      supabase_configured: !!supabase,
      environment: {
        SUPABASE_URL: !!process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
        JWT_SECRET: !!process.env.JWT_SECRET
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      error: 'Health check failed', 
      message: error.message 
    });
  }
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

// Note: No database initialization - testing without it
console.log('API initialized without database startup');

// Export for Vercel
module.exports = app;
