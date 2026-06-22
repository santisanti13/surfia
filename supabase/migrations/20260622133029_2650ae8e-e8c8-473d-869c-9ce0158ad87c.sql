-- Remove duplicate surf_spots, keeping the oldest one per (name, location).
-- Re-points dependent rows (favorite_spots, spot_photos, spot_reviews, user_alerts) to the kept id before deletion.
WITH ranked AS (
  SELECT id, name, location, created_at,
         ROW_NUMBER() OVER (PARTITION BY name, location ORDER BY created_at ASC, id ASC) AS rn,
         FIRST_VALUE(id) OVER (PARTITION BY name, location ORDER BY created_at ASC, id ASC) AS keep_id
  FROM public.surf_spots
),
remap AS (
  SELECT id AS dup_id, keep_id FROM ranked WHERE rn > 1
)
SELECT 1;

-- Repoint references
UPDATE public.favorite_spots f
SET spot_id = r.keep_id
FROM (
  WITH ranked AS (
    SELECT id, name, location,
           FIRST_VALUE(id) OVER (PARTITION BY name, location ORDER BY created_at ASC, id ASC) AS keep_id
    FROM public.surf_spots
  )
  SELECT id AS dup_id, keep_id FROM ranked WHERE id <> keep_id
) r
WHERE f.spot_id = r.dup_id;

UPDATE public.spot_photos p
SET spot_id = r.keep_id
FROM (
  WITH ranked AS (
    SELECT id, name, location,
           FIRST_VALUE(id) OVER (PARTITION BY name, location ORDER BY created_at ASC, id ASC) AS keep_id
    FROM public.surf_spots
  )
  SELECT id AS dup_id, keep_id FROM ranked WHERE id <> keep_id
) r
WHERE p.spot_id = r.dup_id;

UPDATE public.spot_reviews rv
SET spot_id = r.keep_id
FROM (
  WITH ranked AS (
    SELECT id, name, location,
           FIRST_VALUE(id) OVER (PARTITION BY name, location ORDER BY created_at ASC, id ASC) AS keep_id
    FROM public.surf_spots
  )
  SELECT id AS dup_id, keep_id FROM ranked WHERE id <> keep_id
) r
WHERE rv.spot_id = r.dup_id;

UPDATE public.user_alerts a
SET spot_id = r.keep_id
FROM (
  WITH ranked AS (
    SELECT id, name, location,
           FIRST_VALUE(id) OVER (PARTITION BY name, location ORDER BY created_at ASC, id ASC) AS keep_id
    FROM public.surf_spots
  )
  SELECT id AS dup_id, keep_id FROM ranked WHERE id <> keep_id
) r
WHERE a.spot_id = r.dup_id;

-- Delete the duplicates
DELETE FROM public.surf_spots WHERE id IN (
  WITH ranked AS (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY name, location ORDER BY created_at ASC, id ASC) AS rn
    FROM public.surf_spots
  )
  SELECT id FROM ranked WHERE rn > 1
);

-- Add unique constraint to prevent future duplicates
ALTER TABLE public.surf_spots
  ADD CONSTRAINT surf_spots_name_location_key UNIQUE (name, location);