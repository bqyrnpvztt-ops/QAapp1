#!/usr/bin/env node

// Load environment variables
require('dotenv').config();

const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`🔍 ${title}`, 'bright');
  log(`${'='.repeat(60)}`, 'cyan');
}

function logTest(testName, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  const color = passed ? 'green' : 'red';
  log(`${status} ${testName}`, color);
  if (details) {
    log(`   ${details}`, 'yellow');
  }
}

async function testEnvironmentVariables() {
  logSection('ENVIRONMENT VARIABLES');
  
  const requiredVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'JWT_SECRET'];
  let allPresent = true;
  
  for (const varName of requiredVars) {
    const value = process.env[varName];
    const present = !!value;
    logTest(varName, present, present ? 'SET' : 'NOT SET');
    if (!present) allPresent = false;
  }
  
  logTest('All Environment Variables', allPresent);
  return allPresent;
}

async function testSupabaseConnection() {
  logSection('SUPABASE CONNECTION');
  
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    logTest('Supabase Connection', false, 'Missing environment variables');
    return false;
  }
  
  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    
    // Test basic connection
    const { data, error } = await supabase.from('test_cases').select('count').limit(1);
    
    if (error) {
      logTest('Supabase Connection', false, `Error: ${error.message}`);
      return false;
    }
    
    logTest('Supabase Connection', true, 'Connected successfully');
    
    // Test table existence
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['test_cases', 'test_results', 'users']);
    
    if (tablesError) {
      logTest('Table Check', false, `Error: ${tablesError.message}`);
    } else {
      const tableNames = tables?.map(t => t.table_name) || [];
      logTest('Table Check', true, `Found tables: ${tableNames.join(', ')}`);
    }
    
    return true;
  } catch (error) {
    logTest('Supabase Connection', false, `Exception: ${error.message}`);
    return false;
  }
}

async function testFileSystem() {
  logSection('FILE SYSTEM CHECK');
  
  const checks = [
    { name: 'PWA dist folder', path: 'pwa/dist', required: true },
    { name: 'Dashboard dist folder', path: 'dashboard/dist', required: true },
    { name: 'Public folder', path: 'public', required: true },
    { name: 'PWA index.html', path: 'pwa/dist/index.html', required: true },
    { name: 'Dashboard index.html', path: 'dashboard/dist/index.html', required: true },
    { name: 'Manifest.json', path: 'public/manifest.json', required: true },
    { name: 'Server file', path: 'server-supabase.js', required: true },
    { name: 'Vercel config', path: 'vercel.json', required: true }
  ];
  
  let allFilesPresent = true;
  
  for (const check of checks) {
    const exists = fs.existsSync(check.path);
    logTest(check.name, exists, exists ? 'EXISTS' : 'MISSING');
    if (check.required && !exists) {
      allFilesPresent = false;
    }
  }
  
  logTest('All Required Files', allFilesPresent);
  return allFilesPresent;
}

async function testLocalServer() {
  logSection('LOCAL SERVER TEST');
  
  try {
    // Start debug server
    const { spawn } = require('child_process');
    const server = spawn('node', ['debug-server.js'], { 
      stdio: 'pipe',
      env: { ...process.env, PORT: '3001' }
    });
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test debug endpoints
    const baseUrl = 'http://localhost:3001';
    
    try {
      const healthResponse = await axios.get(`${baseUrl}/api/health`);
      logTest('Health Endpoint', healthResponse.status === 200, 
        `Status: ${healthResponse.status}`);
    } catch (error) {
      logTest('Health Endpoint', false, `Error: ${error.message}`);
    }
    
    try {
      const debugResponse = await axios.get(`${baseUrl}/debug`);
      logTest('Debug Endpoint', debugResponse.status === 200,
        `Response size: ${JSON.stringify(debugResponse.data).length} chars`);
    } catch (error) {
      logTest('Debug Endpoint', false, `Error: ${error.message}`);
    }
    
    try {
      const supabaseResponse = await axios.get(`${baseUrl}/debug/supabase`);
      logTest('Supabase Debug', supabaseResponse.status === 200,
        `Status: ${supabaseResponse.data.supabaseStatus}`);
    } catch (error) {
      logTest('Supabase Debug', false, `Error: ${error.message}`);
    }
    
    // Kill server
    server.kill();
    
    return true;
  } catch (error) {
    logTest('Local Server', false, `Error: ${error.message}`);
    return false;
  }
}

async function testVercelConfiguration() {
  logSection('VERCEL CONFIGURATION');
  
  try {
    const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
    
    logTest('Vercel Config File', true, 'File exists and is valid JSON');
    
    // Check builds configuration
    const hasNodeBuild = vercelConfig.builds?.some(build => 
      build.src === 'server-supabase.js' && build.use === '@vercel/node'
    );
    logTest('Node.js Build Config', hasNodeBuild, 
      hasNodeBuild ? 'server-supabase.js configured' : 'Missing Node.js build');
    
    // Check routes configuration
    const hasApiRoute = vercelConfig.routes?.some(route => 
      route.src === '/api/(.*)' && route.dest === '/server-supabase.js'
    );
    logTest('API Route Config', hasApiRoute,
      hasApiRoute ? 'API routes configured' : 'Missing API route');
    
    return hasNodeBuild && hasApiRoute;
  } catch (error) {
    logTest('Vercel Config', false, `Error: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  log('🚀 STARTING COMPREHENSIVE DEBUG TEST', 'bright');
  log('This will test everything before deployment', 'cyan');
  
  const results = {
    environment: await testEnvironmentVariables(),
    supabase: await testSupabaseConnection(),
    filesystem: await testFileSystem(),
    vercel: await testVercelConfiguration(),
    server: await testLocalServer()
  };
  
  logSection('FINAL RESULTS');
  
  const allPassed = Object.values(results).every(result => result === true);
  
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`🎯 OVERALL STATUS: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`, 
    allPassed ? 'green' : 'red');
  log(`${'='.repeat(60)}`, 'cyan');
  
  if (allPassed) {
    log('\n🚀 READY FOR DEPLOYMENT!', 'green');
    log('All systems are working correctly.', 'green');
  } else {
    log('\n⚠️  NOT READY FOR DEPLOYMENT', 'red');
    log('Please fix the failing tests before deploying.', 'red');
  }
  
  return allPassed;
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    log(`\n💥 FATAL ERROR: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { runAllTests };
