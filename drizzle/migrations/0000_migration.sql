CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- First account ever created becomes the single admin
CREATE OR REPLACE FUNCTION public.assign_first_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created_admin AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.assign_first_admin();

CREATE TABLE public.sessions (
  id uuid PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  symptoms text[] NOT NULL DEFAULT '{}',
  frequency text,
  duration text,
  meal_pattern text,
  suspected_foods text CHECK (char_length(suspected_foods) <= 200),
  tried text[] NOT NULL DEFAULT '{}',
  diagnosis_status text,
  alarm_triggered boolean NOT NULL DEFAULT false,
  reached_step text
);
GRANT SELECT, DELETE ON public.sessions TO authenticated;
GRANT ALL ON public.sessions TO service_role;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin read sessions" ON public.sessions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin delete sessions" ON public.sessions FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Public writes their own session row by its random id (the id acts as the only key they hold)
CREATE OR REPLACE FUNCTION public.save_session(
  p_id uuid, p_symptoms text[], p_frequency text, p_duration text, p_meal_pattern text,
  p_suspected_foods text, p_tried text[], p_diagnosis_status text, p_alarm_triggered boolean, p_reached_step text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.sessions (id, symptoms, frequency, duration, meal_pattern, suspected_foods, tried, diagnosis_status, alarm_triggered, reached_step)
  VALUES (p_id, coalesce(p_symptoms,'{}'), p_frequency, p_duration, p_meal_pattern, left(p_suspected_foods,200), coalesce(p_tried,'{}'), p_diagnosis_status, coalesce(p_alarm_triggered,false), p_reached_step)
  ON CONFLICT (id) DO UPDATE SET
    symptoms = EXCLUDED.symptoms, frequency = EXCLUDED.frequency, duration = EXCLUDED.duration,
    meal_pattern = EXCLUDED.meal_pattern, suspected_foods = EXCLUDED.suspected_foods, tried = EXCLUDED.tried,
    diagnosis_status = EXCLUDED.diagnosis_status, alarm_triggered = EXCLUDED.alarm_triggered, reached_step = EXCLUDED.reached_step;
END $$;
GRANT EXECUTE ON FUNCTION public.save_session(uuid, text[], text, text, text, text, text[], text, boolean, text) TO anon, authenticated;

CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid,
  event_name text NOT NULL CHECK (char_length(event_name) <= 50),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.events TO anon, authenticated;
GRANT SELECT, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public insert events" ON public.events FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admin read events" ON public.events FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin delete events" ON public.events FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.early_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid,
  email text NOT NULL CHECK (char_length(email) <= 255),
  consent boolean NOT NULL CHECK (consent = true),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.early_access TO anon, authenticated;
GRANT SELECT, DELETE ON public.early_access TO authenticated;
GRANT ALL ON public.early_access TO service_role;
ALTER TABLE public.early_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public insert early access" ON public.early_access FOR INSERT TO anon, authenticated WITH CHECK (consent = true);
CREATE POLICY "admin read early access" ON public.early_access FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin delete early access" ON public.early_access FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));