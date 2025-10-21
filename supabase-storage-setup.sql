-- Supabase Storage Setup for Screenshots
-- Run this in your Supabase SQL Editor

-- Create storage bucket for screenshots
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'screenshots',
  'screenshots', 
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create storage policies for screenshots
-- Allow authenticated users to upload screenshots
CREATE POLICY "screenshots_upload_policy" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'screenshots' AND
  auth.role() = 'authenticated'
);

-- Allow public read access to screenshots
CREATE POLICY "screenshots_read_policy" ON storage.objects
FOR SELECT USING (bucket_id = 'screenshots');

-- Allow users to delete their own screenshots
CREATE POLICY "screenshots_delete_policy" ON storage.objects
FOR DELETE USING (
  bucket_id = 'screenshots' AND
  auth.role() = 'authenticated'
);
