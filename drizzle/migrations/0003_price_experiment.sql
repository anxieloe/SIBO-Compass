ALTER TABLE public.events ADD COLUMN price_arm text CHECK (price_arm IN ('A','B')), ADD COLUMN channel text CHECK (char_length(channel) <= 40);
ALTER TABLE public.sessions ADD COLUMN price_arm text CHECK (price_arm IN ('A','B')), ADD COLUMN channel text CHECK (char_length(channel) <= 40);
CREATE OR REPLACE FUNCTION public.set_session_meta(p_id uuid, p_price_arm text, p_channel text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.sessions (id, price_arm, channel) VALUES (p_id, p_price_arm, left(p_channel,40))
  ON CONFLICT (id) DO UPDATE SET
    price_arm = coalesce(public.sessions.price_arm, EXCLUDED.price_arm),
    channel = coalesce(public.sessions.channel, EXCLUDED.channel);
END $$;
GRANT EXECUTE ON FUNCTION public.set_session_meta(uuid, text, text) TO anon, authenticated;
CREATE TABLE public.reservation_followup (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid,
  fair_price text CHECK (char_length(fair_price) <= 20),
  call_opt_in boolean,
  call_email text CHECK (char_length(call_email) <= 255),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.reservation_followup TO anon, authenticated;
GRANT SELECT, DELETE ON public.reservation_followup TO authenticated;
GRANT ALL ON public.reservation_followup TO service_role;
ALTER TABLE public.reservation_followup ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public insert followup" ON public.reservation_followup FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admin read followup" ON public.reservation_followup FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin delete followup" ON public.reservation_followup FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));