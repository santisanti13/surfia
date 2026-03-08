
-- Fix Santa Marina: 3903101 → 3305602
UPDATE public.surf_spots SET playa_id_aemet = '3305602' WHERE id = 'eb8feb23-5976-498c-bb7d-21a47ff6a911';

-- Fix Zahara de los Atunes: 1101501 → 1100706
UPDATE public.surf_spots SET playa_id_aemet = '1100706' WHERE id = '7d40b41b-9f43-49eb-af69-4c0f942b8895';

-- Null out spots with no valid AEMET ID found
UPDATE public.surf_spots SET playa_id_aemet = NULL WHERE id IN (
  'aa6e081b-b566-4a24-808b-a0b0e5734d69',  -- Roche
  '3741e6d7-7074-4a0c-8035-4ef515c5b99f',  -- Tapia de Casariego
  '68c51161-6620-451e-92d3-91bfc47ffbd4',  -- Verdicio
  '16ae01ce-238e-40f5-b9b2-15b81da6a5ea'   -- Xagó
);
