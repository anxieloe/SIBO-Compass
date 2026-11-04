import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Card, Notice } from "@/components/flow-ui";
import { supabase } from "@/integrations/supabase/client";
import { clickRate } from "@/lib/questions";
import { getSessionId } from "@/lib/flow";
import { FUNNEL, cleanEvents, earlyAccessClicks, funnelCounts, uniqueSessions, type Ev } from "@/lib/funnel";

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

type EA = { id: string; email: string; created_at: string; session_id: string | null };
type S = { id: string; created_at: string; alarm_triggered: boolean; reached_step: string | null };

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
  const [sessions, setSessions] = useState<S[]>([]);
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [emails, setEmails] = useState<EA[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [manualId, setManualId] = useState("");

  async function load() {
    setError(null);
    try {
      const { data: u } = await supabase.auth.getUser();
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", u.user!.id);
      const admin = (roles ?? []).some((r) => r.role === "admin");
      setIsAdmin(admin);
      if (!admin) return;
      const [ev, ss, ea, ex] = await Promise.all([
        fetchAll<Ev>("events", "session_id,event_name"),
        fetchAll<S>("sessions", "id,created_at,alarm_triggered,reached_step"),
        supabase.from("early_access").select("id,email,created_at,session_id").order("created_at", { ascending: false }),
        supabase.from("excluded_sessions").select("session_id"),
      ]);
      if (ea.error || ex.error) throw ea.error || ex.error;
      setEvents(ev);
      setSessions(ss.sort((a, b) => b.created_at.localeCompare(a.created_at)));
      setEmails(ea.data ?? []);
      setExcluded(new Set((ex.data ?? []).map((r) => r.session_id)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load results.");
    }
  }
  useEffect(() => {
    void load();
  }, []);

  async function setTest(id: string, test: boolean) {
    const { error } = test
      ? await supabase.from("excluded_sessions").upsert({ session_id: id })
      : await supabase.from("excluded_sessions").delete().eq("session_id", id);
    if (error) return alert("Couldn't update: " + error.message);
    setExcluded((prev) => {
      const n = new Set(prev);
      if (test) n.add(id);
      else n.delete(id);
      return n;
    });
  }

  if (isAdmin === false) return <Notice>This account doesn't have admin access.</Notice>;
  if (error) return <Notice>Couldn't load results: {error}</Notice>;
  if (!events) return <p className="text-muted-foreground">Loading results…</p>;

  const ev = cleanEvents(events, excluded);
  const real = sessions.filter((s) => !excluded.has(s.id));
  const funnel = funnelCounts(ev);
  const { clicks, views } = earlyAccessClicks(ev);
  const realEmails = emails.filter((e) => !e.session_id || !excluded.has(e.session_id));
  const thisDevice = getSessionId();

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
      const csv = [[...cols, "is_test"].join(","), ...rows.map((r) => [...cols.map((c) => esc(r[c])), esc(excluded.has(String(r["id"])))].join(","))].join("\n");
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
    ["Sessions", real.length],
    ["Alert triggered", real.filter((s) => s.alarm_triggered).length],
    ["Viewed next steps", views],
    ["Clicked early access", clicks],
    ["Submitted email", uniqueSessions(ev, "early_access_submit").size],
    ["Early-access click rate", clickRate(clicks, views)],
  ];

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        All numbers count unique people (sessions), not clicks. {excluded.size} test session{excluded.size === 1 ? "" : "s"} excluded.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map(([l, v]) => (
          <Card key={l}>
            <p className="text-sm text-muted-foreground">{l}</p>
            <p className="mt-1 text-3xl font-bold text-primary">{v}</p>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="mb-3 text-lg font-semibold">People reaching each step</h2>
        <ul>
          {FUNNEL.map(([label, name], i) => (
            <li key={name} className="flex justify-between border-b py-2 last:border-0">
              <span>{label}</span>
              <span className="font-semibold">{funnel[i]}</span>
            </li>
          ))}
          <li className="flex justify-between py-2 text-sm text-muted-foreground">
            <span>Printed summary (optional action)</span>
            <span>{uniqueSessions(ev, "summary_print_click").size}</span>
          </li>
        </ul>
      </Card>

      <Card>
        <h2 className="mb-1 text-lg font-semibold">Test sessions</h2>
        <p className="mb-3 text-sm text-muted-foreground">Marked sessions are left out of every number above.</p>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          {thisDevice && (
            <button className="btn-ghost border-[1.5px] border-primary text-sm text-primary" onClick={() => setTest(thisDevice, !excluded.has(thisDevice))}>
              {excluded.has(thisDevice) ? "Un-mark this device's session" : "Mark this device's session as test"}
            </button>
          )}
          <input value={manualId} onChange={(e) => setManualId(e.target.value)} placeholder="Paste a session ID" aria-label="Session ID" className="min-h-12 flex-1 rounded-lg border-[1.5px] border-input bg-card px-3 text-sm" />
          <button className="btn-ghost text-sm" disabled={!/^[0-9a-f-]{36}$/i.test(manualId.trim())} onClick={() => { void setTest(manualId.trim(), true); setManualId(""); }}>
            Mark as test
          </button>
        </div>
        <div className="max-h-96 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="py-2">Started</th>
                <th className="py-2">Last step</th>
                <th className="py-2">Session</th>
                <th className="py-2 text-right">Test?</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} className={`border-b last:border-0 ${excluded.has(s.id) ? "text-muted-foreground line-through" : ""}`}>
                  <td className="py-2 pr-3">{new Date(s.created_at).toLocaleString()}</td>
                  <td className="py-2 pr-3">{s.reached_step ?? "—"}</td>
                  <td className="py-2 pr-3 font-mono text-xs">{s.id.slice(0, 8)}{s.id === thisDevice ? " (this device)" : ""}</td>
                  <td className="py-2 text-right">
                    <input type="checkbox" className="h-5 w-5" checked={excluded.has(s.id)} onChange={(e) => setTest(s.id, e.target.checked)} aria-label={`Mark session ${s.id.slice(0, 8)} as test`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Early-access emails ({realEmails.length})</h2>
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
                    <td className="py-2 pr-3">{r.email}{r.session_id && excluded.has(r.session_id) ? " (test)" : ""}</td>
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
