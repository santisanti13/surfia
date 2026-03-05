-- Create surf_spots table with AEMET playa IDs
CREATE TABLE public.surf_spots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  playa_id_aemet TEXT,
  wave_type TEXT DEFAULT 'beach_break',
  difficulty TEXT DEFAULT 'intermediate',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS (spots are public read)
ALTER TABLE public.surf_spots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Spots are viewable by everyone"
ON public.surf_spots FOR SELECT USING (true);

-- Create user_alerts table
CREATE TABLE public.user_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  spot_id UUID NOT NULL REFERENCES public.surf_spots(id) ON DELETE CASCADE,
  min_wave_height DOUBLE PRECISION DEFAULT 1.0,
  max_wind_speed DOUBLE PRECISION DEFAULT 25.0,
  preferred_wind_direction TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own alerts"
ON public.user_alerts FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own alerts"
ON public.user_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts"
ON public.user_alerts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts"
ON public.user_alerts FOR DELETE USING (auth.uid() = user_id);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_user_alerts_updated_at
BEFORE UPDATE ON public.user_alerts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();