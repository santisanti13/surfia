DROP VIEW IF EXISTS public.profiles_public;

CREATE POLICY "Authenticated users can view public profile info"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);