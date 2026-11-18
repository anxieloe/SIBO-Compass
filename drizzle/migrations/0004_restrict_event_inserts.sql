DROP POLICY "public insert events" ON public.events;
CREATE POLICY "public insert known events" ON public.events FOR INSERT TO anon, authenticated WITH CHECK (
  event_name IN ('alert_shown','alarm_triggered','booking_request','booking_start','call_opt_in','early_access_click','early_access_submit','early_access_view','fair_price_answered','meals_done','next_view','pricing_view','recipe_view','reserve_click','reserve_submit','safety_done','start_click','summary_print_click','summary_view','support_group_click','symptoms_done','tried_done','welcome_view')
  AND (price_arm IS NULL OR price_arm IN ('A','B'))
  AND (channel IS NULL OR channel ~ '^[a-z0-9_-]{1,40}$')
);