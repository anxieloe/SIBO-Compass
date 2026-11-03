import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Card, Notice } from "@/components/flow-ui";
import { supabase } from "@/integrations/supabase/client";
import { clickRate } from "@/lib/questions";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Results — SIBO Compass" },
      { name: "description", content: "Private concept test results." },
      { property: "og:title", content: "Results — SIBO Compass" },
      { property: "og:description", content: "Private concept test results." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Results,
});

function Results() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Concept test results</h1>
        {session && (
          <button className="btn-ghost text-sm" onClick={() => supabase.auth.signOut()}>
            Sign out
          </button>
        )}
      </div>
      {!ready ? <p className="text-muted-foreground">Loading…</p> : session ? <Dashboard /> : <SignIn />}
    </div>
  );
}

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"in" | "up">("in");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg(error.message);
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/results` },
      });
      if (error) setMsg(error.message);
      else if (!data.session) setMsg("Check your inbox to confirm your email, then sign in.");
    }
    setBusy(false);
  }

  return (
    <Card className="mx-auto max-w-sm">
      <h2 className="mb-1 text-lg font-semibold">{mode === "in" ? "Admin sign in" : "Create admin account"}</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        {mode === "in" ? "Only the admin account can see results." : "The first account created becomes the admin."}
      </p>
      {msg && <Notice>{msg}</Notice>}
      <form onSubmit={submit} className="flex flex-col gap-3">
        <label htmlFor="admin-email" className="text-sm font-medium">Email</label>
        <input id="admin-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="min-h-12 rounded-lg border-[1.5px] border-input bg-card px-3" />
        <label htmlFor="admin-pw" className="text-sm font-medium">Password</label>
        <input id="admin-pw" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="min-h-12 rounded-lg border-[1.5px] border-input bg-card px-3" />
        <button className="btn-primary mt-2" disabled={busy}>{busy ? "Please wait…" : mode === "in" ? "Sign in" : "Create account"}</button>
      </form>
      <button className="btn-ghost mt-4 w-full border-[1.5px] border-primary text-base font-semibold text-primary" onClick={() => setMode(mode === "in" ? "up" : "in")}>
        {mode === "in" ? "First time? Create the admin account" : "Already have an account? Sign in"}
      </button>
    </Card>
  );
}

type Ev = { session_id: string | null; event_name: string };
type EA = { id: string; email: string; created_at: string };

const STEP_EVENTS: [string, string][] = [
  ["Started", "start_click"],
  ["Symptoms done", "symptoms_done"],
  ["Meals done", "meals_done"],
  ["Tried done", "tried_done"],
  ["Safety done", "safety_done"],
  ["Viewed summary", "summary_view"],
  ["Printed summary", "summary_print_click"],
  ["Viewed next steps", "next_view"],
  ["Viewed early access", "early_access_view"],
];

async function fetchAll<T>(table: "events" | "sessions", cols: string): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase.from(table).select(cols).range(from, from + 999);
    if (error) throw error;
    out.push(...((data ?? []) as T[]));
    if (!data || data.length < 1000) return out;
  }
}

function Dashboard() {
  const [events, setEvents] = useState<Ev[] | null>(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [alarmCount, setAlarmCount] = useState(0);
  const [emails, setEmails] = useState<EA[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  async function load() {
    setError(null);
    try {
      const { data: u } = await supabase.auth.getUser();
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", u.user!.id);
      const admin = (roles ?? []).some((r) => r.role === "admin");
      setIsAdmin(admin);
      if (!admin) return;
      const [ev, sc, ac, ea] = await Promise.all([
        fetchAll<Ev>("events", "session_id,event_name"),
        supabase.from("sessions").select("id", { count: "exact", head: true }),
        supabase.from("sessions").select("id", { count: "exact", head: true }).eq("alarm_triggered", true),
        supabase.from("early_access").select("id,email,created_at").order("created_at", { ascending: false }),
      ]);
      if (sc.error || ac.error || ea.error) throw sc.error || ac.error || ea.error;
      setEvents(ev);
      setSessionCount(sc.count ?? 0);
      setAlarmCount(ac.count ?? 0);
      setEmails(ea.data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load results.");
    }
  }
  useEffect(() => {
    void load();
  }, []);

  if (isAdmin === false) return <Notice>This account doesn't have admin access.</Notice>;
  if (error) return <Notice>Couldn't load results: {error}</Notice>;
  if (!events) return <p className="text-muted-foreground">Loading results…</p>;

  const uniq = (name: string) => new Set(events.filter((e) => e.event_name === name).map((e) => e.session_id ?? "anon")).size;
  const total = (name: string) => events.filter((e) => e.event_name === name).length;
  const nextViews = total("next_view");
  const eaClicks = total("early_access_click");

  async function remove(id: string) {
    if (!confirm("Delete this email?")) return;
    const { error } = await supabase.from("early_access").delete().eq("id", id);
    if (error) return alert("Couldn't delete: " + error.message);
    setEmails((x) => x.filter((r) => r.id !== id));
  }

  async function exportCsv() {
    try {
      const rows = await fetchAll<Record<string, unknown>>("sessions", "*");
      const cols = ["id", "created_at", "symptoms", "frequency", "duration", "meal_pattern", "suspected_foods", "tried", "diagnosis_status", "alarm_triggered", "reached_step"];
      const esc = (v: unknown) => {
        const s = Array.isArray(v) ? v.join("; ") : v == null ? "" : String(v);
        return `"${s.replace(/"/g, '""')}"`;
      };
      const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `sibo-sessions-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Export failed: " + (e instanceof Error ? e.message : ""));
    }
  }

  const stats: [string, string | number][] = [
    ["Sessions", sessionCount],
    ["Alert triggered", alarmCount],
    ["Viewed /next", nextViews],
    ["Early access clicks", eaClicks],
    ["Emails submitted", total("early_access_submit")],
    ["Early-access click rate", clickRate(eaClicks, nextViews)],
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map(([l, v]) => (
          <Card key={l}>
            <p className="text-sm text-muted-foreground">{l}</p>
            <p className="mt-1 text-3xl font-bold text-primary">{v}</p>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="mb-3 text-lg font-semibold">Sessions reaching each step</h2>
        <ul>
          {STEP_EVENTS.map(([label, ev]) => (
            <li key={ev} className="flex justify-between border-b py-2 last:border-0">
              <span>{label}</span>
              <span className="font-semibold">{uniq(ev)}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Early-access emails</h2>
          <button className="btn-ghost text-sm" onClick={exportCsv}>Export sessions CSV</button>
        </div>
        {emails.length === 0 ? (
          <p className="text-muted-foreground">No emails yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="py-2">Email</th>
                  <th className="py-2">Date</th>
                  <th className="py-2"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {emails.map((r) => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="py-2 pr-3">{r.email}</td>
                    <td className="py-2 pr-3">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="py-2 text-right">
                      <button className="min-h-12 px-3 text-destructive underline" onClick={() => remove(r.id)} aria-label={`Delete ${r.email}`}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
