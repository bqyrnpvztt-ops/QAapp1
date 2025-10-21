const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

const app = express();

// Enable CORS
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Debug information
const debugInfo = {
  timestamp: new Date().toISOString(),
  environment: process.env.NODE_ENV || 'development',
  vercel: process.env.VERCEL ? 'YES' : 'NO',
  vercelEnv: process.env.VERCEL_ENV || 'unknown',
  vercelRegion: process.env.VERCEL_REGION || 'unknown',
  nodeVersion: process.version,
  platform: process.platform,
  arch: process.arch,
  memoryUsage: process.memoryUsage(),
  envVars: {
    SUPABASE_URL: process.env.SUPABASE_URL ? 'SET' : 'NOT SET',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
    JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
    NODE_ENV: process.env.NODE_ENV || 'NOT SET'
  }
};

// Supabase connection test
let supabase = null;
let supabaseStatus = 'NOT_INITIALIZED';

if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
  try {
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    supabaseStatus = 'INITIALIZED';
  } catch (error) {
    supabaseStatus = `ERROR: ${error.message}`;
  }
} else {
  supabaseStatus = 'MISSING_ENV_VARS';
}

// Test Supabase connection
async function testSupabaseConnection() {
  if (!supabase) {
    return { status: 'NO_CLIENT', error: 'Supabase client not initialized' };
  }

  try {
    // Test basic connection
    const { data, error } = await supabase.from('test_cases').select('count').limit(1);
    
    if (error) {
      return { status: 'ERROR', error: error.message, code: error.code };
    }
    
    return { status: 'SUCCESS', data: 'Connection successful' };
  } catch (error) {
    return { status: 'EXCEPTION', error: error.message };
  }
}

// Health check with detailed info
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    supabase: supabaseStatus,
    environment: process.env.NODE_ENV || 'development',
    vercel: process.env.VERCEL ? 'YES' : 'NO',
    vercelEnv: process.env.VERCEL_ENV || 'unknown'
  });
});

// Comprehensive debug endpoint
app.get('/api/debug', async (req, res) => {
  const supabaseTest = await testSupabaseConnection();
  
  res.json({
    debugInfo,
    supabaseStatus,
    supabaseTest,
    timestamp: new Date().toISOString(),
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      query: req.query
    }
  });
});

// Test actual API endpoints
app.get('/api/test-cases', async (req, res) => {
  if (!supabase) {
    return res.status(500).json({ 
      error: 'Supabase not initialized',
      debug: {
        supabaseStatus,
        envVars: debugInfo.envVars
      }
    });
  }
  
  try {
    const { data, error } = await supabase
      .from('test_cases')
      .select('*')
      .limit(5);
    
    if (error) {
      return res.status(500).json({ 
        error: error.message, 
        code: error.code,
        debug: {
          supabaseStatus,
          envVars: debugInfo.envVars
        }
      });
    }
    
    res.json({ data, count: data?.length || 0 });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      debug: {
        supabaseStatus,
        envVars: debugInfo.envVars
      }
    });
  }
});

// Export for Vercel
module.exports = app;