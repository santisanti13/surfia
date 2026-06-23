
CREATE TABLE public.spot_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  spot_id UUID NOT NULL REFERENCES public.surf_spots(id) ON DELETE CASCADE,
  note TEXT CHECK (note IS NULL OR char_length(note) <= 140),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '2 hours')
);

CREATE INDEX idx_spot_checkins_spot_active ON public.spot_checkins(spot_id, expires_at);
CREATE INDEX idx_spot_checkins_user ON public.spot_checkins(user_id);

GRANT SELECT, INSERT, DELETE ON public.spot_checkins TO authenticated;
GRANT ALL ON public.spot_checkins TO service_role;

ALTER TABLE public.spot_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active checkins"
  ON public.spot_checkins FOR SELECT
  TO authenticated
  USING (expires_at > now());

CREATE POLICY "Users can create their own checkins"
  ON public.spot_checkins FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own checkins"
  ON public.spot_checkins FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.spot_checkins;
ALTER TABLE public.spot_checkins REPLICA IDENTITY FULL;
