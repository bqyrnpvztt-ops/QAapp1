# Vercel Deployment Guide

## Quick Fix for Serverless Function Crash

Your serverless function was crashing because it was missing required Supabase environment variables. This has been fixed with proper error handling.

## Required Environment Variables

You need to set these environment variables in your Vercel dashboard:

1. **SUPABASE_URL** - Your Supabase project URL
2. **SUPABASE_ANON_KEY** - Your Supabase anonymous key
3. **JWT_SECRET** - A secure secret for JWT token signing (optional, has fallback)

## How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add the following variables:
   - `SUPABASE_URL` = `https://your-project-id.supabase.co`
   - `SUPABASE_ANON_KEY` = `your-anon-key-here`
   - `JWT_SECRET` = `your-secure-jwt-secret`

## Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Run the SQL from `supabase-setup.sql` in your Supabase SQL editor
3. Get your project URL and anon key from Settings → API

## Testing the Fix

After setting the environment variables:

1. **Health Check**: Visit `/api/health` to verify the function is working
2. **Database Status**: The health endpoint will show if Supabase is configured
3. **Redeploy**: Vercel will automatically redeploy when you add environment variables

## What Was Fixed

- ✅ Removed `process.exit(1)` that was crashing the function
- ✅ Added graceful error handling for missing environment variables
- ✅ Added health check endpoint for monitoring
- ✅ Added middleware to check Supabase availability before database operations
- ✅ Created proper Vercel configuration file

## Default Users

After Supabase is configured, the system will automatically create:
- **Admin**: `admin@qa-testing.com` / `admin123`
- **Tester**: `tester@qa-testing.com` / `tester123`

## Troubleshooting

If you still get errors:
1. Check Vercel function logs in the dashboard
2. Verify environment variables are set correctly
3. Ensure Supabase tables are created using `supabase-setup.sql`
4. Test the health endpoint: `https://your-app.vercel.app/api/health`
