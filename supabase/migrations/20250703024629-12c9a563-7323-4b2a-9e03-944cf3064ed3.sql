
-- Fix avatar upload RLS policies
ALTER TABLE storage.objects DROP POLICY IF EXISTS "Users can upload their own avatar";
ALTER TABLE storage.objects DROP POLICY IF EXISTS "Users can update their own avatar";
ALTER TABLE storage.objects DROP POLICY IF EXISTS "Users can delete their own avatar";

-- Create proper RLS policies for avatar uploads
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Ensure avatars bucket exists and is public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;
