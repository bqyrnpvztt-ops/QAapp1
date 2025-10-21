const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all origins
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
  port: PORT,
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

// File system checks
function checkFileSystem() {
  const checks = {};
  
  // Check if dist folders exist
  checks.pwaDist = fs.existsSync('pwa/dist');
  checks.dashboardDist = fs.existsSync('dashboard/dist');
  checks.publicDir = fs.existsSync('public');
  
  // Check specific files
  checks.pwaIndex = fs.existsSync('pwa/dist/index.html');
  checks.dashboardIndex = fs.existsSync('dashboard/dist/index.html');
  checks.manifest = fs.existsSync('public/manifest.json');
  
  // Check file sizes
  if (checks.pwaIndex) {
    checks.pwaIndexSize = fs.statSync('pwa/dist/index.html').size;
  }
  if (checks.dashboardIndex) {
    checks.dashboardIndexSize = fs.statSync('dashboard/dist/index.html').size;
  }
  
  return checks;
}

// API Endpoint Tests
async function testAPIEndpoints() {
  const tests = {};
  
  // Test 1: Health endpoint
  tests.health = { status: 'READY', message: 'Health endpoint available' };
  
  // Test 2: Supabase connection
  tests.supabase = await testSupabaseConnection();
  
  // Test 3: File system
  tests.filesystem = checkFileSystem();
  
  // Test 4: Environment variables
  tests.environment = debugInfo.envVars;
  
  return tests;
}

// Debug routes
app.get('/debug', async (req, res) => {
  const supabaseTest = await testSupabaseConnection();
  const fileSystemCheck = checkFileSystem();
  
  res.json({
    debugInfo,
    supabaseStatus,
    supabaseTest,
    fileSystemCheck,
    timestamp: new Date().toISOString()
  });
});

app.get('/debug/api', async (req, res) => {
  const apiTests = await testAPIEndpoints();
  res.json({
    apiTests,
    timestamp: new Date().toISOString()
  });
});

app.get('/debug/supabase', async (req, res) => {
  const test = await testSupabaseConnection();
  res.json({
    supabaseStatus,
    test,
    envVars: {
      url: process.env.SUPABASE_URL ? 'SET' : 'NOT SET',
      key: process.env.SUPABASE_ANON_KEY ? 'SET' : 'NOT SET'
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/debug/files', (req, res) => {
  const fileCheck = checkFileSystem();
  res.json({
    fileSystem: fileCheck,
    timestamp: new Date().toISOString()
  });
});

// Test actual API endpoints
app.get('/api/test-cases', async (req, res) => {
  if (!supabase) {
    return res.status(500).json({ error: 'Supabase not initialized' });
  }
  
  try {
    const { data, error } = await supabase
      .from('test_cases')
      .select('*')
      .limit(5);
    
    if (error) {
      return res.status(500).json({ error: error.message, code: error.code });
    }
    
    res.json({ data, count: data?.length || 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    supabase: supabaseStatus,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve static files for testing
app.use(express.static('public'));
app.use(express.static('pwa/dist'));
app.use(express.static('dashboard/dist'));

// Serve main pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pwa/dist/index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'pwa/dist/index.html'));
});

app.get('/admin*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard/dist/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🔍 Debug Server running on port ${PORT}`);
  console.log(`📊 Debug Dashboard: http://localhost:${PORT}/debug`);
  console.log(`🔗 API Tests: http://localhost:${PORT}/debug/api`);
  console.log(`🗄️ Supabase Test: http://localhost:${PORT}/debug/supabase`);
  console.log(`📁 File System Check: http://localhost:${PORT}/debug/files`);
  console.log(`🏠 Main App: http://localhost:${PORT}`);
});

module.exports = app;
