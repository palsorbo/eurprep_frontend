-- Storage Policies for jam-recordings bucket
-- This file contains RLS policies for the storage bucket

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to upload files to their own folder
CREATE POLICY "Users can upload to their own folder" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'jam-recordings' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Policy to allow users to view their own files
CREATE POLICY "Users can view their own files" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'jam-recordings' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Policy to allow users to update their own files
CREATE POLICY "Users can update their own files" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'jam-recordings' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Policy to allow users to delete their own files
CREATE POLICY "Users can delete their own files" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'jam-recordings' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Comments for documentation
COMMENT ON POLICY "Users can upload to their own folder" ON storage.objects IS 'Allows authenticated users to upload files to their own user folder';
COMMENT ON POLICY "Users can view their own files" ON storage.objects IS 'Allows users to view files in their own user folder';
COMMENT ON POLICY "Users can update their own files" ON storage.objects IS 'Allows users to update files in their own user folder';
COMMENT ON POLICY "Users can delete their own files" ON storage.objects IS 'Allows users to delete files in their own user folder'; 