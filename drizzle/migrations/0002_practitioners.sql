CREATE TABLE public.practitioners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  kind text NOT NULL DEFAULT 'Dietitian',
  location text,
  telehealth boolean NOT NULL DEFAULT false,
  website text,
  email text,
  phone text,
  notes text,
  published boolean NOT NULL DEFAULT true
);
GRANT SELECT ON public.practitioners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.practitioners TO authenticated;
GRANT ALL ON public.practitioners TO service_role;
ALTER TABLE public.practitioners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read published" ON public.practitioners FOR SELECT TO anon, authenticated USING (published OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin manage" ON public.practitioners FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));