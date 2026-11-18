import { useEffect, useState } from "react";
import { Card } from "@/components/flow-ui";
import { supabase } from "@/integrations/supabase/client";

type P = { id: string; name: string; kind: string; location: string | null; telehealth: boolean; website: string | null; email: string | null; phone: string | null; notes: string | null; published: boolean };
const blank = { name: "", kind: "Dietitian", location: "", telehealth: false, website: "", email: "", phone: "", notes: "" };
const input = "min-h-11 rounded-lg border-[1.5px] border-input bg-card px-3 text-sm";

export function PractitionerAdmin() {
  const [list, setList] = useState<P[]>([]);
  const [f, setF] = useState(blank);
  const load = () => supabase.from("practitioners").select("*").order("name").then(({ data }) => setList((data ?? []) as P[]));
  useEffect(() => { void load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!f.name.trim()) return;
    const clean = (s: string) => s.trim() || null;
    const { error } = await supabase.from("practitioners").insert({
      name: f.name.trim(), kind: f.kind.trim() || "Dietitian", location: clean(f.location), telehealth: f.telehealth,
      website: clean(f.website), email: clean(f.email), phone: clean(f.phone), notes: clean(f.notes),
    });
    if (error) return alert("Couldn't add: " + error.message);
    setF(blank);
    void load();
  }
  async function togglePub(p: P) {
    await supabase.from("practitioners").update({ published: !p.published }).eq("id", p.id);
    void load();
  }
  async function del(p: P) {
    if (!confirm(`Delete ${p.name}?`)) return;
    await supabase.from("practitioners").delete().eq("id", p.id);
    void load();
  }

  return (
    <Card>
      <h2 className="mb-1 text-lg font-semibold">Practitioner directory ({list.length})</h2>
      <p className="mb-3 text-sm text-muted-foreground">Shown on the "Find a dietitian" page. Hidden ones are not shown.</p>
      <form onSubmit={add} className="mb-4 grid gap-2 sm:grid-cols-2">
        <input className={input} placeholder="Name *" aria-label="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required />
        <input className={input} placeholder="Type (e.g. Dietitian, Gastroenterologist)" aria-label="Type" value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })} />
        <input className={input} placeholder="City, State" aria-label="Location" value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} />
        <input className={input} placeholder="Website (https://…)" aria-label="Website" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} />
        <input className={input} placeholder="Email" aria-label="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <input className={input} placeholder="Phone" aria-label="Phone" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
        <input className={`${input} sm:col-span-2`} placeholder="Short note (optional)" aria-label="Note" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-5 w-5" checked={f.telehealth} onChange={(e) => setF({ ...f, telehealth: e.target.checked })} />Offers video visits</label>
        <button className="btn-primary min-h-11 text-sm">Add practitioner</button>
      </form>
      <ul>
        {list.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-3 border-b py-2 text-sm last:border-0">
            <span className={p.published ? "" : "text-muted-foreground line-through"}>{p.name} · {p.kind}{p.location ? ` · ${p.location}` : ""}</span>
            <span className="flex shrink-0 gap-3">
              <button className="underline" onClick={() => togglePub(p)}>{p.published ? "Hide" : "Show"}</button>
              <button className="text-destructive underline" onClick={() => del(p)}>Delete</button>
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
