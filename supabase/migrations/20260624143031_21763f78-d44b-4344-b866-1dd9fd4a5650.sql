
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users see own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Manual mappings
CREATE TABLE public.aemet_manual_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_name TEXT NOT NULL UNIQUE,
  aemet_id TEXT NOT NULL,
  aemet_name TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.aemet_manual_mappings TO authenticated;
GRANT ALL ON public.aemet_manual_mappings TO service_role;
ALTER TABLE public.aemet_manual_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read mappings" ON public.aemet_manual_mappings
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert mappings" ON public.aemet_manual_mappings
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update mappings" ON public.aemet_manual_mappings
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete mappings" ON public.aemet_manual_mappings
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_aemet_manual_mappings_updated
BEFORE UPDATE ON public.aemet_manual_mappings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Assignment log
CREATE TABLE public.aemet_assignment_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id UUID REFERENCES public.surf_spots(id) ON DELETE SET NULL,
  spot_name TEXT NOT NULL,
  previous_aemet_id TEXT,
  new_aemet_id TEXT,
  method TEXT NOT NULL,
  run_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.aemet_assignment_log TO authenticated;
GRANT ALL ON public.aemet_assignment_log TO service_role;
ALTER TABLE public.aemet_assignment_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read log" ON public.aemet_assignment_log
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert log" ON public.aemet_assignment_log
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_aemet_log_created ON public.aemet_assignment_log (created_at DESC);
CREATE INDEX idx_aemet_log_spot ON public.aemet_assignment_log (spot_id);
