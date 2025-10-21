#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 ENVIRONMENT SETUP HELPER');
console.log('============================\n');

console.log('To test locally, you need to create a .env file with your Supabase credentials.\n');

console.log('1. Create a .env file in the project root with:');
console.log('   SUPABASE_URL=https://your-project-id.supabase.co');
console.log('   SUPABASE_ANON_KEY=your-anon-key-here');
console.log('   JWT_SECRET=cH7DV0fA3wdhyKYUlJwxmPruNAE1Zdq08DPbn2ApUs8=');
console.log('   NODE_ENV=development\n');

console.log('2. Get your Supabase credentials from:');
console.log('   - Go to your Supabase project dashboard');
console.log('   - Settings → API');
console.log('   - Copy "Project URL" and "anon public" key\n');

console.log('3. Once you have the .env file, run:');
console.log('   npm run test-debug\n');

console.log('4. For Vercel deployment, make sure these same variables are set in:');
console.log('   - Vercel Dashboard → Your Project → Settings → Environment Variables\n');

// Check if .env exists
if (fs.existsSync('.env')) {
  console.log('✅ .env file exists!');
} else {
  console.log('❌ .env file not found. Please create it with the variables above.');
}
