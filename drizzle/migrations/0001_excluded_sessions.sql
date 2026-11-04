CREATE TABLE public.excluded_sessions (
  session_id uuid PRIMARY KEY,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.excluded_sessions TO authenticated;
GRANT ALL ON public.excluded_sessions TO service_role;
ALTER TABLE public.excluded_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin all excluded" ON public.excluded_sessions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));