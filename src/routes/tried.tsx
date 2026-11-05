import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckList, Group, Shell, SingleList } from "@/components/flow-ui";
import { persistSession, setAnswers, track, useFlow } from "@/lib/flow";
import { DIAGNOSIS, TRIED } from "@/lib/questions";

export const Route = createFileRoute("/tried")({
  head: () => ({
    meta: [
      { title: "What you've tried — SIBO Compass" },
      { name: "description", content: "List what you have already tried for your digestive symptoms." },
      { property: "og:title", content: "What you've tried — SIBO Compass" },
      { property: "og:description", content: "Step 3: what you have already tried." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Tried,
});

function Tried() {
  const { answers: a } = useFlow();
  const navigate = useNavigate();
  const onToggle = (o: string) => {
    if (a.tried.includes(o)) return setAnswers({ tried: a.tried.filter((x) => x !== o) });
    if (o === "None yet") return setAnswers({ tried: ["None yet"] });
    setAnswers({ tried: [...a.tried.filter((x) => x !== "None yet"), o] });
  };
  return (
    <Shell step={3} back="/meals">
      <h1 className="mb-6 text-2xl font-bold">Have you tried anything to address these symptoms? If so, what?</h1>
      <Group label="Already tried" hint="Choose all that apply.">
        <CheckList options={TRIED} value={a.tried} onToggle={onToggle} />
      </Group>
      <Group label="Have you been diagnosed with SIBO?">
        <SingleList
          name="Have you been diagnosed with SIBO?"
          options={DIAGNOSIS}
          value={a.diagnosisStatus}
          onChange={(o) => setAnswers({ diagnosisStatus: a.diagnosisStatus === o ? null : o })}
        />
      </Group>
      <button
        className="btn-primary mt-auto"
        disabled={a.tried.length === 0 || !a.diagnosisStatus}
        onClick={() => {
          track("tried_done");
          void persistSession("tried");
          navigate({ to: "/safety" });
        }}
      >
        Next
      </button>
    </Shell>
  );
}
