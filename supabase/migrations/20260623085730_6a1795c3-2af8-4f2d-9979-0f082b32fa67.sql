DROP POLICY IF EXISTS "Public can view spot photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own spot photos" ON storage.objects;

CREATE POLICY "Public can view spot photos"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'spot-photos');

CREATE POLICY "Users can update their own spot photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'spot-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'spot-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);