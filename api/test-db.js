const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase = null;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
} else {
  console.log('Supabase environment variables found');
  supabase = createClient(supabaseUrl, supabaseKey);
}

app.use(express.json());

// Test database connection and RLS
app.get('/api/test-db', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Supabase not configured' });
    }
    
    // Test 1: Check if we can read from users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, name')
      .limit(5);
    
    // Test 2: Try to insert a test user
    const testUserId = 'test-' + Date.now();
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert({
        id: testUserId,
        email: 'test@example.com',
        password: 'test123',
        name: 'Test User'
      })
      .select();
    
    // Test 3: Try to delete the test user
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', testUserId);
    
    res.json({
      status: 'ok',
      tests: {
        readUsers: {
          success: !usersError,
          error: usersError?.message,
          count: users?.length || 0
        },
        insertUser: {
          success: !insertError,
          error: insertError?.message,
          data: insertData
        },
        deleteUser: {
          success: !deleteError,
          error: deleteError?.message
        }
      },
      users: users || []
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Test failed', 
      details: error.message 
    });
  }
});

module.exports = app;
