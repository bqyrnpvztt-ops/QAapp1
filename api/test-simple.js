const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('Environment check:');
console.log('SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING');
console.log('SUPABASE_ANON_KEY:', supabaseKey ? 'SET' : 'MISSING');

let supabase = null;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
} else {
  console.log('Supabase environment variables found');
  supabase = createClient(supabaseUrl, supabaseKey);
}

// Simple test route
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    supabase: supabase ? 'connected' : 'not configured',
    env: {
      SUPABASE_URL: !!supabaseUrl,
      SUPABASE_ANON_KEY: !!supabaseKey
    }
  });
});

// Test API route
app.post('/api/auth/register', async (req, res) => {
  if (!supabase) {
    return res.status(503).json({ error: 'Supabase not configured' });
  }
  
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }
    
    // Simple test - just return success
    res.json({
      message: 'Test successful',
      user: { email, name }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = app;
