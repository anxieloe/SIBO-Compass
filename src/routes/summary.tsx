import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Card, DISCLAIMER, Shell } from "@/components/flow-ui";
import { track, useFlow } from "@/lib/flow";
import { buildDoctorQuestions, hasWarningSign, suspectedFoodsText } from "@/lib/questions";

export const Route = createFileRoute("/summary")({
  head: () => ({
    meta: [
      { title: "Your summary for your doctor — SIBO Compass" },
      { name: "description", content: "A printable one-page symptom summary and questions to ask your doctor." },
      { property: "og:title", content: "Your summary for your doctor — SIBO Compass" },
      { property: "og:description", content: "Print or save your symptom summary as a PDF." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Summary,
});

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b py-3 last:border-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1">{value || "—"}</dd>
    </div>
  );
}

function Summary() {
  const { answers: a, sessionId } = useFlow();
  const navigate = useNavigate();
  const alarm = hasWarningSign(a.safety);
  const complete = a.symptoms.length > 0 && a.frequency && a.duration;

  useEffect(() => {
    if (alarm) navigate({ to: "/alert", replace: true });
    else if (complete) track("summary_view");
  }, [alarm, complete, navigate]);

  if (alarm) return null;
  if (!complete || !sessionId) {
    return (
      <Shell>
        <div className="flex flex-1 flex-col justify-center text-center">
          <h1 className="text-2xl font-bold">No summary yet</h1>
          <p className="mt-2 text-muted-foreground">Answer a few questions first and your summary will appear here.</p>
          <Link to="/" className="btn-primary mt-8">Start</Link>
        </div>
      </Shell>
    );
  }

  const date = new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  return (
    <Shell back="/safety" disclaimer={false}>
      <Card className="print-card">
        <p className="text-sm text-muted-foreground">{date}</p>
        <h1 className="mt-1 text-2xl font-bold">Your summary for your doctor</h1>
        <dl className="mt-4">
          <Row label="Symptoms" value={a.symptoms.join(", ")} />
          <Row label="How often" value={a.frequency ?? ""} />
          <Row label="How long" value={a.duration ?? ""} />
          <Row label="Symptoms after meals" value={a.mealPattern ?? ""} />
          <Row label="Suspected foods" value={suspectedFoodsText(a)} />
          <Row label="Already tried" value={a.tried.join(", ")} />
          {a.diagnosisStatus && <Row label="Previously diagnosed with SIBO" value={a.diagnosisStatus} />}
        </dl>
        <h2 className="mt-6 text-lg font-semibold">Questions to ask your doctor</h2>
        <ol className="mt-2 list-decimal space-y-2 pl-5">
          {buildDoctorQuestions(a).map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ol>
        <p className="mt-6 border-t pt-4 text-xs text-muted-foreground">Not medical advice and not a diagnosis.</p>
      </Card>
      <div className="no-print mt-6 flex flex-col gap-3">
        <button
          className="btn-ghost w-full"
          onClick={() => {
            track("summary_print_click");
            window.print();
          }}
        >
          Print or save as PDF
        </button>
        <Link to="/next" className="btn-primary">What can I do next?</Link>
        <p className="mt-4 text-center text-xs text-muted-foreground">{DISCLAIMER}</p>
      </div>
    </Shell>
  );
}
