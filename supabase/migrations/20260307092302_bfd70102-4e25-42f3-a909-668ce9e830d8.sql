
-- Reviews table
CREATE TABLE public.spot_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  spot_id UUID NOT NULL REFERENCES public.surf_spots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.spot_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone" ON public.spot_reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reviews" ON public.spot_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reviews" ON public.spot_reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Photos table
CREATE TABLE public.spot_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  spot_id UUID NOT NULL REFERENCES public.surf_spots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  photo_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.spot_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Photos are viewable by everyone" ON public.spot_photos FOR SELECT USING (true);
CREATE POLICY "Authenticated users can upload photos" ON public.spot_photos FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own photos" ON public.spot_photos FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Storage bucket for spot photos
INSERT INTO storage.buckets (id, name, public) VALUES ('spot-photos', 'spot-photos', true);

CREATE POLICY "Anyone can view spot photos" ON storage.objects FOR SELECT USING (bucket_id = 'spot-photos');
CREATE POLICY "Authenticated users can upload spot photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'spot-photos');
CREATE POLICY "Users can delete their own spot photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'spot-photos' AND (SELECT auth.uid()::text) = (storage.foldername(name))[1]);
