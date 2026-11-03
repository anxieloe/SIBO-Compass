import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Notice, Shell } from "@/components/flow-ui";
import { supabase } from "@/integrations/supabase/client";
import { getSessionId, track } from "@/lib/flow";
import { EMAIL_RE } from "@/lib/questions";

export const Route = createFileRoute("/early-access")({
  head: () => ({
    meta: [
      { title: "Get early access — SIBO Compass" },
      { name: "description", content: "Join the early access list. We only collect your email." },
      { property: "og:title", content: "Get early access — SIBO Compass" },
      { property: "og:description", content: "Join the SIBO Compass early access list." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EarlyAccess,
});

function EarlyAccess() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => track("early_access_view"), []);

  const emailOk = EMAIL_RE.test(email.trim());
  const emailError = touched && !emailOk ? "Please enter a valid email address." : null;
  const consentError = touched && !consent ? "Please tick the box so we can contact you." : null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!emailOk || !consent) return;
    setBusy(true);
    setFailed(false);
    const { error } = await supabase
      .from("early_access")
      .insert({ email: email.trim().toLowerCase(), consent: true, session_id: getSessionId() });
    setBusy(false);
    if (error) {
      console.warn(error.message);
      setFailed(true);
      return;
    }
    track("early_access_submit");
    navigate({ to: "/thanks" });
  }

  return (
    <Shell back="/next">
      <h1 className="mb-2 text-2xl font-bold">Get early access</h1>
      <p className="mb-6 text-muted-foreground">We'll let you know when SIBO Compass is ready.</p>
      {failed && <Notice>Sorry, we couldn't save your email. Please try again in a moment.</Notice>}
      <form onSubmit={submit} noValidate className="flex flex-1 flex-col">
        <label htmlFor="email" className="mb-2 font-semibold">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          maxLength={255}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!emailError}
          aria-describedby={emailError ? "email-err" : undefined}
          className="min-h-13 rounded-lg border-[1.5px] border-input bg-card px-4 text-base focus:border-primary"
        />
        {emailError && <p id="email-err" className="mt-1 text-sm text-destructive">{emailError}</p>}

        <label className="mt-6 flex min-h-12 cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-6 w-6 shrink-0 accent-primary"
            aria-invalid={!!consentError}
            required
          />
          <span>I agree to be contacted about early access</span>
        </label>
        {consentError && <p className="mt-1 text-sm text-destructive">{consentError}</p>}

        <p className="mt-6 text-sm text-muted-foreground">
          We only collect your email. Ask us to delete it any time at schule.angelina@web.de.
        </p>
        <button type="submit" className="btn-primary mt-auto pt-0" disabled={busy}>
          {busy ? "Joining…" : "Join early access"}
        </button>
      </form>
    </Shell>
  );
}
