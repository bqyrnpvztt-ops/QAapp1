-- Supabase SQL setup script
-- Run this in your Supabase SQL editor

-- Create test_cases table
CREATE TABLE IF NOT EXISTS test_cases (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  sub_category TEXT NOT NULL,
  city_or_locale TEXT,
  demographic_profile TEXT DEFAULT 'General',
  query_text TEXT NOT NULL,
  intent TEXT DEFAULT 'General inquiry',
  constraints TEXT DEFAULT 'None',
  expected_result TEXT DEFAULT 'Relevant recommendations',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create test_results table
CREATE TABLE IF NOT EXISTS test_results (
  id SERIAL PRIMARY KEY,
  test_case_id TEXT NOT NULL REFERENCES test_cases(id),
  tester_id TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  problem_description TEXT,
  expected_result TEXT,
  annotations TEXT,
  screenshots TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'tester',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_test_cases_category ON test_cases(category);
CREATE INDEX IF NOT EXISTS idx_test_cases_sub_category ON test_cases(sub_category);
CREATE INDEX IF NOT EXISTS idx_test_results_tester_id ON test_results(tester_id);
CREATE INDEX IF NOT EXISTS idx_test_results_test_case_id ON test_results(test_case_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Enable Row Level Security (RLS)
ALTER TABLE test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for test_cases (public read access)
CREATE POLICY "test_cases_read_all" ON test_cases FOR SELECT USING (true);

-- Create policies for test_results (users can only see their own results)
CREATE POLICY "test_results_read_own" ON test_results FOR SELECT USING (tester_id = auth.uid()::text);
CREATE POLICY "test_results_insert_own" ON test_results FOR INSERT WITH CHECK (tester_id = auth.uid()::text);
CREATE POLICY "test_results_update_own" ON test_results FOR UPDATE USING (tester_id = auth.uid()::text);

-- Create policies for users (users can only see their own profile)
CREATE POLICY "users_read_own" ON users FOR SELECT USING (id = auth.uid()::text);
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (id = auth.uid()::text);

-- Create functions for table creation (used by the server)
CREATE OR REPLACE FUNCTION create_test_cases_table()
RETURNS void AS $$
BEGIN
  -- Table already created above, this is just a placeholder
  RETURN;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_test_results_table()
RETURNS void AS $$
BEGIN
  -- Table already created above, this is just a placeholder
  RETURN;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_users_table()
RETURNS void AS $$
BEGIN
  -- Table already created above, this is just a placeholder
  RETURN;
END;
$$ LANGUAGE plpgsql;
