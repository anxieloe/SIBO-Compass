import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckList, Group, Shell } from "@/components/flow-ui";
import { persistSession, setAnswers, track, useFlow } from "@/lib/flow";
import { NONE_OF_THESE, WARNING_SIGNS, hasWarningSign, toggleSafety } from "@/lib/questions";

export const Route = createFileRoute("/safety")({
  head: () => ({
    meta: [
      { title: "Safety check — SIBO Compass" },
      { name: "description", content: "A quick check for warning signs that need a doctor first." },
      { property: "og:title", content: "Safety check — SIBO Compass" },
      { property: "og:description", content: "Step 4: warning signs check." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Safety,
});

function Safety() {
  const { answers: a } = useFlow();
  const navigate = useNavigate();
  return (
    <Shell step={4} back="/tried">
      <h1 className="mb-2 text-2xl font-bold">Safety check</h1>
      <p className="mb-6 text-muted-foreground">Do you have any of these right now?</p>
      <Group label="Warning signs" hint="Choose all that apply.">
        <CheckList
          options={[...WARNING_SIGNS, NONE_OF_THESE]}
          value={a.safety}
          onToggle={(o) => setAnswers({ safety: toggleSafety(a.safety, o) })}
        />
      </Group>
      <button
        className="btn-primary mt-auto"
        disabled={a.safety.length === 0}
        onClick={() => {
          const alarm = hasWarningSign(a.safety);
          track("safety_done");
          void persistSession(alarm ? "alert" : "summary");
          navigate({ to: alarm ? "/alert" : "/summary" });
        }}
      >
        Next
      </button>
    </Shell>
  );
}
