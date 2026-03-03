-- Create community-uploads bucket (if not exists) and allow public uploads
-- Run this in the Supabase SQL Editor

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('community-uploads', 'community-uploads', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow anyone to upload files to community/ folder
CREATE POLICY "Public community uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'community-uploads' AND (storage.foldername(name))[1] = 'community');

-- Allow anyone to read community uploads
CREATE POLICY "Public community reads" ON storage.objects
  FOR SELECT USING (bucket_id = 'community-uploads');
