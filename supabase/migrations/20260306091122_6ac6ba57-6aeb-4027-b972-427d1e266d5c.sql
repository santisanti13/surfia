
-- Add source tracking to surf_spots
ALTER TABLE public.surf_spots ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'manual';
ALTER TABLE public.surf_spots ADD COLUMN IF NOT EXISTS submitted_by uuid;
ALTER TABLE public.surf_spots ADD COLUMN IF NOT EXISTS approved boolean NOT NULL DEFAULT true;

-- Allow authenticated users to insert community spots (pending approval)
CREATE POLICY "Authenticated users can suggest spots"
ON public.surf_spots
FOR INSERT
TO authenticated
WITH CHECK (submitted_by = auth.uid() AND source = 'community');

-- Allow users to see all approved spots (already have SELECT policy for everyone)
-- Update existing SELECT policy to only show approved spots
DROP POLICY IF EXISTS "Spots are viewable by everyone" ON public.surf_spots;
CREATE POLICY "Spots are viewable by everyone"
ON public.surf_spots
FOR SELECT
USING (approved = true);

-- Allow users to also see their own pending spots
CREATE POLICY "Users can see their pending spots"
ON public.surf_spots
FOR SELECT
TO authenticated
USING (submitted_by = auth.uid());
