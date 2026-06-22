
-- 1. Surf spots: force approved=false on community insert
DROP POLICY IF EXISTS "Authenticated users can suggest spots" ON public.surf_spots;
CREATE POLICY "Authenticated users can suggest spots"
ON public.surf_spots
FOR INSERT TO authenticated
WITH CHECK (
  submitted_by = auth.uid()
  AND source = 'community'
  AND approved = false
);

-- 2. Storage: enforce path ownership for uploads
DROP POLICY IF EXISTS "Authenticated users can upload spot photos" ON storage.objects;
CREATE POLICY "Authenticated users can upload spot photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'spot-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Storage: remove broad listing on spot-photos (CDN still serves public files directly)
DROP POLICY IF EXISTS "Anyone can view spot photos" ON storage.objects;

-- 4. Profiles: restrict SELECT to owner only
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- 5. SECURITY DEFINER functions: revoke direct EXECUTE (trigger still runs)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
