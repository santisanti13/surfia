DROP POLICY IF EXISTS "Spot photos are viewable by everyone" ON public.spot_photos;
DROP POLICY IF EXISTS "Photos are viewable by everyone" ON public.spot_photos;
DROP POLICY IF EXISTS "Anyone can view spot photos" ON public.spot_photos;

CREATE POLICY "Authenticated users can view spot photos"
ON public.spot_photos
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Spot reviews are viewable by everyone" ON public.spot_reviews;
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.spot_reviews;
DROP POLICY IF EXISTS "Anyone can view spot reviews" ON public.spot_reviews;

CREATE POLICY "Authenticated users can view spot reviews"
ON public.spot_reviews
FOR SELECT
TO authenticated
USING (true);

REVOKE SELECT ON public.spot_photos FROM anon;
REVOKE SELECT ON public.spot_reviews FROM anon;