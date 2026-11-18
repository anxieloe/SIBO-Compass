import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, Notice, Shell } from "@/components/flow-ui";
import { supabase } from "@/integrations/supabase/client";
import { track } from "@/lib/flow";

export const Route = createFileRoute("/practitioners")({
  head: () => ({
    meta: [
      { title: "Find a dietitian or practitioner — SIBO Compass" },
      { name: "description", content: "Dietitians and practitioners in the US who work with bloating and SIBO." },
      { property: "og:title", content: "Find a dietitian or practitioner — SIBO Compass" },
      { property: "og:description", content: "A small directory of US dietitians and practitioners." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Practitioners,
});

type P = { id: string; name: string; kind: string; location: string | null; telehealth: boolean; website: string | null; email: string | null; phone: string | null; notes: string | null };

function Practitioners() {
  const [list, setList] = useState<P[] | null>(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    supabase.from("practitioners").select("id,name,kind,location,telehealth,website,email,phone,notes").eq("published", true).order("name")
      .then(({ data, error }) => (error ? setErr(true) : setList(data ?? [])));
  }, []);
  return (
    <Shell back="/">
      <h1 className="mb-2 text-2xl font-bold">Dietitians and practitioners</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        People in the United States who work with digestive symptoms. Contact them directly. Listing here is not a
        recommendation — check their credentials and whether they take your insurance.
      </p>
      {err && <Notice>Sorry, we couldn't load the list. Please try again later.</Notice>}
      {!list && !err && <p className="text-muted-foreground">Loading…</p>}
      {list?.length === 0 && <p className="text-muted-foreground">We're adding practitioners soon. Check back later.</p>}
      <div className="flex flex-col gap-3">
        {list?.map((p) => (
          <Card key={p.id}>
            <h2 className="text-lg font-semibold">{p.name}</h2>
            <p className="text-sm text-muted-foreground">
              {p.kind}{p.location ? ` · ${p.location}` : ""}{p.telehealth ? " · Offers video visits" : ""}
            </p>
            {p.notes && <p className="mt-2 text-sm">{p.notes}</p>}
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {p.website && <a className="text-primary underline" href={p.website} target="_blank" rel="noopener noreferrer">Website</a>}
              {p.email && <a className="text-primary underline" href={`mailto:${p.email}`}>{p.email}</a>}
              {p.phone && <a className="text-primary underline" href={`tel:${p.phone}`}>{p.phone}</a>}
            </div>
            <Booking name={p.name} />
          </Card>
        ))}
      </div>
    </Shell>
  );
}

/** Demo only: shows what would be shared, but never sends or saves anything. */
function Booking({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  const [agree, setAgree] = useState(false);
  const [withSummary, setWithSummary] = useState(false);
  const [sent, setSent] = useState(false);
  if (!open)
    return (
      <button className="btn-ghost mt-4 w-full" onClick={() => { setOpen(true); track("booking_start"); }}>
        Request a booking
      </button>
    );
  return (
    <div className="mt-4 rounded-md bg-muted p-4 text-sm">
      <p className="mb-3 font-semibold">Booking isn't available yet. This is a preview.</p>
      <p className="mb-2">If you send a request, this is exactly what {name} would receive:</p>
      <ul className="mb-3 list-disc pl-5">
        <li>Your name or first name</li>
        <li>Your email</li>
        <li>Your preferred time</li>
        {withSummary && <li>Your symptom summary</li>}
      </ul>
      <label className="mb-2 flex min-h-12 cursor-pointer items-start gap-3">
        <input type="checkbox" checked={withSummary} onChange={(e) => setWithSummary(e.target.checked)} className="mt-0.5 h-6 w-6 shrink-0 accent-primary" />
        <span>Also share my symptom summary (optional)</span>
      </label>
      <label className="mb-3 flex min-h-12 cursor-pointer items-start gap-3">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-6 w-6 shrink-0 accent-primary" required />
        <span>I agree to share this with {name}</span>
      </label>
      <p className="mb-3 text-muted-foreground">Practitioners are independent. We don't provide medical care.</p>
      {sent ? (
        <p className="font-semibold">Nothing was sent or saved. Booking isn't available yet. This is a preview.</p>
      ) : (
        <button className="btn-primary w-full" disabled={!agree} onClick={() => { setSent(true); track("booking_request"); }}>
          Send request
        </button>
      )}
    </div>
  );
}
