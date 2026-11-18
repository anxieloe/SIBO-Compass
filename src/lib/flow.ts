import { useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import { emptyAnswers, hasWarningSign, normalizeAnswers, suspectedFoodsText, type Answers } from "./questions";

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
    if (raw) {
      const parsed = JSON.parse(raw) as { answers?: Partial<Answers> | null };
      state = { ...state, ...parsed, answers: normalizeAnswers(parsed?.answers) };
    }
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
  syncMeta();
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

/* ---- Price experiment meta (kept across restarts so a person always sees the same arm) ---- */
const META_KEY = "sibo-compass-meta";
type Meta = { priceArm?: "A" | "B"; channel?: string };
function readMeta(): Meta {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(META_KEY) || "{}") as Meta; } catch { return {}; }
}
function writeMeta(m: Meta) {
  try { localStorage.setItem(META_KEY, JSON.stringify(m)); } catch {}
}
function syncMeta() {
  const sid = getSessionId();
  if (!sid) return;
  const m = readMeta();
  supabase
    .rpc("set_session_meta", { p_id: sid, p_price_arm: m.priceArm ?? null, p_channel: m.channel ?? "direct" } as never)
    .then(({ error }) => error && console.warn("meta save failed", error.message));
}
/** Reads ?src= on the first page load only; later loads keep the first channel. */
export function initChannel(search: string) {
  const m = readMeta();
  if (m.channel) return;
  const src = new URLSearchParams(search).get("src")?.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 40);
  writeMeta({ ...m, channel: src || "direct" });
}
export function getChannel() {
  return readMeta().channel ?? "direct";
}
/** Assigns A/B 50/50 the first time, then always returns the same arm. */
export function ensurePriceArm(): "A" | "B" {
  const m = readMeta();
  if (m.priceArm) return m.priceArm;
  const arm = Math.random() < 0.5 ? "A" : "B";
  writeMeta({ ...m, priceArm: arm });
  syncMeta();
  return arm;
}

/** Fire-and-forget event logging; never throws. */
export function track(event: string) {
  const sid = getSessionId();
  const m = readMeta();
  supabase
    .from("events")
    .insert({ event_name: event, session_id: sid, price_arm: m.priceArm ?? null, channel: m.channel ?? "direct" })
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
      p_suspected_foods: suspectedFoodsText(a) || undefined,
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
