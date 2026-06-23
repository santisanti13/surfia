-- Public-safe projection of profiles exposing only display_name and avatar_url
CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker = off) AS
SELECT user_id, display_name, avatar_url
FROM public.profiles;

GRANT SELECT ON public.profiles_public TO anon, authenticated;