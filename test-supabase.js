const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testSupabaseConnection() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    console.error('Please check your .env file');
    return;
  }

  if (supabaseUrl.includes('your-project-id') || supabaseKey.includes('your-anon-key')) {
    console.error('❌ Please update your .env file with actual Supabase credentials');
    return;
  }

  try {
    console.log('🔌 Testing Supabase connection...');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test connection by querying test_cases table
    const { data, error } = await supabase
      .from('test_cases')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      return;
    }
    
    console.log('✅ Supabase connection successful!');
    console.log('📊 Database is ready for data migration');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
}

testSupabaseConnection();
