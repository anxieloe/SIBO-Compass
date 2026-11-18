import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Card, Shell, SingleList } from "@/components/flow-ui";
import { supabase } from "@/integrations/supabase/client";
import { getSessionId, track } from "@/lib/flow";
import { EMAIL_RE } from "@/lib/questions";

export const Route = createFileRoute("/feedback")({
  head: () => ({
    meta: [
      { title: "Two quick questions — SIBO Compass" },
      { name: "description", content: "Two optional questions after reserving your spot." },
      { property: "og:title", content: "Two quick questions — SIBO Compass" },
      { property: "og:description", content: "Optional questions about price and a short call." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Feedback,
});

const FAIR_PRICES = ["Under $25", "$25-$49", "$50-$99", "$100-$149", "$150-$199", "$200-$300", "Not sure"];

function Feedback() {
  const navigate = useNavigate();
  const [price, setPrice] = useState<string | null>(null);
  const [call, setCall] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const emailBad = call === "Yes" && email.trim() !== "" && !EMAIL_RE.test(email.trim());

  async function done() {
    if (emailBad) return;
    setBusy(true);
    if (price || call) {
      const { error } = await supabase.from("reservation_followup").insert({
        session_id: getSessionId(),
        fair_price: price,
        call_opt_in: call ? call === "Yes" : null,
        call_email: call === "Yes" && email.trim() ? email.trim().toLowerCase() : null,
      });
      if (error) console.warn(error.message);
      if (price) track("fair_price_answered");
      if (call === "Yes") track("call_opt_in");
    }
    navigate({ to: "/thanks" });
  }

  return (
    <Shell disclaimer={false}>
      <h1 className="mb-2 text-2xl font-bold">Your spot is reserved</h1>
      <p className="mb-6 text-muted-foreground">Two optional questions. You can skip them.</p>
      <Card className="mb-4">
        <h2 className="mb-3 font-semibold">What would feel like a fair price for the test and clinician review?</h2>
        <SingleList name="fair-price" options={FAIR_PRICES} value={price} onChange={setPrice} />
      </Card>
      <Card className="mb-6">
        <h2 className="mb-3 font-semibold">Would you do a 15-minute call to tell us more?</h2>
        <SingleList name="call" options={["Yes", "No"]} value={call} onChange={setCall} />
        {call === "Yes" && (
          <div className="mt-4">
            <label htmlFor="call-email" className="mb-2 block text-sm font-semibold">
              Email for scheduling (optional, can be the same one)
            </label>
            <input
              id="call-email"
              type="email"
              maxLength={255}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-h-13 w-full rounded-lg border-[1.5px] border-input bg-card px-4 text-base focus:border-primary"
            />
            {emailBad && <p className="mt-1 text-sm text-destructive">Please enter a valid email address.</p>}
          </div>
        )}
      </Card>
      <button className="btn-primary mt-auto" onClick={done} disabled={busy || emailBad}>
        {price || call ? "Send and finish" : "Skip and finish"}
      </button>
    </Shell>
  );
}
