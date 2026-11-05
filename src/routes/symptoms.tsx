import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Group, MultiChips, Shell, SingleList, toggle } from "@/components/flow-ui";
import { persistSession, setAnswers, track, useFlow } from "@/lib/flow";
import { DURATIONS, FREQUENCIES, SYMPTOMS } from "@/lib/questions";

export const Route = createFileRoute("/symptoms")({
  head: () => ({
    meta: [
      { title: "Your symptoms — SIBO Compass" },
      { name: "description", content: "Tell us which digestive symptoms you have, how often and for how long." },
      { property: "og:title", content: "Your symptoms — SIBO Compass" },
      { property: "og:description", content: "Step 1: choose your symptoms." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Symptoms,
});

function Symptoms() {
  const { answers: a } = useFlow();
  const navigate = useNavigate();
  const ready = a.symptoms.length > 0 && a.frequency && a.duration;
  return (
    <Shell step={1} back="/">
      <p className="mb-4 text-sm text-muted-foreground">
        These 4 short steps take about 3 minutes and build a one-page summary you can bring to your doctor.
      </p>
      <h1 className="mb-6 text-2xl font-bold">What are you dealing with?</h1>
      <Group label="Symptoms" hint="Choose all that apply.">
        <MultiChips options={SYMPTOMS} value={a.symptoms} onToggle={(o) => setAnswers({ symptoms: toggle(a.symptoms, o) })} />
      </Group>
      <Group label="How often?">
        <SingleList name="How often?" options={FREQUENCIES} value={a.frequency} onChange={(o) => setAnswers({ frequency: o })} />
      </Group>
      <Group label="How long?">
        <SingleList name="How long?" options={DURATIONS} value={a.duration} onChange={(o) => setAnswers({ duration: o })} />
      </Group>
      <button
        className="btn-primary mt-auto"
        disabled={!ready}
        onClick={() => {
          track("symptoms_done");
          void persistSession("symptoms");
          navigate({ to: "/meals" });
        }}
      >
        Next
      </button>
    </Shell>
  );
}
