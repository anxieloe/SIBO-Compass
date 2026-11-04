export type Ev = { session_id: string | null; event_name: string };

/** Linear funnel order. A session counts at a step if it reached that step or any later one. */
export const FUNNEL: [string, string][] = [
  ["Started", "start_click"],
  ["Symptoms done", "symptoms_done"],
  ["Meals done", "meals_done"],
  ["Tried done", "tried_done"],
  ["Safety done", "safety_done"],
  ["Viewed summary", "summary_view"],
  ["Viewed next steps", "next_view"],
  ["Viewed early access", "early_access_view"],
];

/** Drops events without a session and events from excluded (test) sessions. */
export function cleanEvents(events: Ev[], excluded: Set<string>): Ev[] {
  return events.filter((e) => e.session_id && !excluded.has(e.session_id));
}

/** Unique sessions that fired an event at least once. */
export function uniqueSessions(events: Ev[], name: string): Set<string> {
  return new Set(events.filter((e) => e.event_name === name).map((e) => e.session_id!));
}

/** Unique sessions per funnel step; never increases from one step to the next. */
export function funnelCounts(events: Ev[]): number[] {
  const furthest = new Map<string, number>();
  for (const e of events) {
    const i = FUNNEL.findIndex(([, n]) => n === e.event_name);
    if (i < 0 || !e.session_id) continue;
    furthest.set(e.session_id, Math.max(furthest.get(e.session_id) ?? -1, i));
  }
  return FUNNEL.map((_, i) => [...furthest.values()].filter((f) => f >= i).length);
}

/** Unique sessions that clicked early access, among those that viewed /next, and the viewer count. */
export function earlyAccessClicks(events: Ev[]): { clicks: number; views: number } {
  const viewed = uniqueSessions(events, "next_view");
  const clicked = uniqueSessions(events, "early_access_click");
  return { clicks: [...clicked].filter((s) => viewed.has(s)).length, views: viewed.size };
}
