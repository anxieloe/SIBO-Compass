import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Card, Shell } from "@/components/flow-ui";
import { track, useFlow } from "@/lib/flow";
import { hasWarningSign } from "@/lib/questions";

export const Route = createFileRoute("/next")({
  head: () => ({
    meta: [
      { title: "Possible next steps — SIBO Compass" },
      { name: "description", content: "An outline of a possible testing and clinician review pathway." },
      { property: "og:title", content: "Possible next steps — SIBO Compass" },
      { property: "og:description", content: "Breath test, clinician review and a 12-week program — an outline." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Next,
});

const STEPS = [
  "At-home breath test through a lab partner.",
  "Video review with a licensed clinician.",
  "If the test is positive, the clinician decides on treatment and can prescribe.",
  "If SIBO is not found on this test, a dietitian referral and a 12-week program.",
];

function Next() {
  const { answers } = useFlow();
  const navigate = useNavigate();
  const alarm = hasWarningSign(answers.safety);
  useEffect(() => {
    if (alarm) navigate({ to: "/alert", replace: true });
    else track("next_view");
  }, [alarm, navigate]);
  if (alarm) return null;

  return (
    <Shell back="/summary">
      <h1 className="mb-6 text-2xl font-bold">Possible next steps</h1>
      <ol className="mb-8">
        {STEPS.map((s, i) => (
          <li key={s} className="relative flex gap-4 pb-6 last:pb-0">
            {i < STEPS.length - 1 && <span aria-hidden className="absolute left-5 top-10 h-[calc(100%-2.5rem)] w-0.5 bg-primary-soft" />}
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
              {i + 1}
            </span>
            <p className="pt-2">{s}</p>
          </li>
        ))}
      </ol>
      <Card className="mb-4">
        <div className="flex items-baseline justify-between gap-4 border-b pb-3">
          <span>Test and clinician review</span>
          <span className="font-semibold">about $199</span>
        </div>
        <div className="flex items-baseline justify-between gap-4 pt-3">
          <span>12-week program</span>
          <span className="text-right font-semibold">$19 per month or $149 for 12 weeks</span>
        </div>
      </Card>
      <p className="mb-8 rounded-md bg-muted p-4 text-sm text-muted-foreground">
        This is an outline. Nothing can be ordered in this early test. A result that is not positive means SIBO was not
        found on this test, not that your symptoms have no cause.
      </p>
      <Link
        to="/early-access"
        className="btn-primary mt-auto"
        onClick={() => track("early_access_click")}
      >
        Get early access
      </Link>
    </Shell>
  );
}
