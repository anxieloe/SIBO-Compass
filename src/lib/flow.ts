import { useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import { emptyAnswers, hasWarningSign, type Answers } from "./questions";

const KEY = "sibo-compass-v1";
type State = { sessionId: string | null; answers: Answers; saveError?: boolean };
let state: State = { sessionId: null, answers: emptyAnswers };
let hydrated = false;
const listeners = new Set<() => void>();

function load() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...state, ...JSON.parse(raw) };
  } catch {}
  listeners.forEach((l) => l());
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
  listeners.forEach((l) => l());
}

const serverState: State = { sessionId: null, answers: emptyAnswers };
export function useFlow() {
  const s = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      queueMicrotask(load);
      return () => listeners.delete(cb);
    },
    () => state,
    () => serverState,
  );
  return s;
}

export function setAnswers(patch: Partial<Answers>) {
  state = { ...state, answers: { ...state.answers, ...patch } };
  save();
}

export function startSession() {
  state = { sessionId: crypto.randomUUID(), answers: emptyAnswers };
  save();
  return state.sessionId!;
}

export function resetFlow() {
  state = { sessionId: null, answers: emptyAnswers };
  save();
}

export function getSessionId() {
  load();
  return state.sessionId;
}

/** Fire-and-forget event logging; never throws. */
export function track(event: string) {
  const sid = getSessionId();
  supabase
    .from("events")
    .insert({ event_name: event, session_id: sid })
    .then(({ error }) => error && console.warn("track failed", error.message));
}

/** Saves current answers. Returns false on failure (caller may show a notice). */
export async function persistSession(step: string): Promise<boolean> {
  load();
  const sid = state.sessionId ?? startSession();
  const a = state.answers;
  try {
    const { error } = await supabase.rpc("save_session", {
      p_id: sid,
      p_symptoms: a.symptoms,
      p_frequency: a.frequency ?? undefined,
      p_duration: a.duration ?? undefined,
      p_meal_pattern: a.mealPattern ?? undefined,
      p_suspected_foods: a.suspectedFoods || undefined,
      p_tried: a.tried,
      p_diagnosis_status: a.diagnosisStatus ?? undefined,
      p_alarm_triggered: hasWarningSign(a.safety),
      p_reached_step: step,
    } as never);
    if (error) throw error;
    if (state.saveError) { state = { ...state, saveError: false }; save(); }
    return true;
  } catch (e) {
    console.warn("save failed", e);
    state = { ...state, saveError: true };
    save();
    return false;
  }
}
