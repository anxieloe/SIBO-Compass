import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Group, Shell, SingleList } from "@/components/flow-ui";
import { persistSession, setAnswers, track, useFlow } from "@/lib/flow";
import { MEAL_PATTERNS } from "@/lib/questions";

export const Route = createFileRoute("/meals")({
  head: () => ({
    meta: [
      { title: "Meals and symptoms — SIBO Compass" },
      { name: "description", content: "Note whether your symptoms follow meals and which foods you suspect." },
      { property: "og:title", content: "Meals and symptoms — SIBO Compass" },
      { property: "og:description", content: "Step 2: meals and suspected foods." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Meals,
});

function Meals() {
  const { answers: a } = useFlow();
  const navigate = useNavigate();
  return (
    <Shell step={2} back="/symptoms">
      <h1 className="mb-6 text-2xl font-bold">Meals</h1>
      <Group label="Do symptoms follow meals?">
        <SingleList name="Do symptoms follow meals?" options={MEAL_PATTERNS} value={a.mealPattern} onChange={(o) => setAnswers({ mealPattern: o })} />
      </Group>
      <div className="mb-7">
        <label htmlFor="foods" className="mb-1 block text-lg font-semibold">
          Foods you suspect
        </label>
        <textarea
          id="foods"
          maxLength={200}
          rows={3}
          value={a.suspectedFoods}
          onChange={(e) => setAnswers({ suspectedFoods: e.target.value.slice(0, 200) })}
          placeholder="e.g. onions, milk, bread"
          className="mt-2 w-full rounded-lg border-[1.5px] border-input bg-card p-3 text-base focus:border-primary"
          aria-describedby="foods-count"
        />
        <p id="foods-count" className="mt-1 text-right text-xs text-muted-foreground">
          {a.suspectedFoods.length}/200
        </p>
      </div>
      <button
        className="btn-primary mt-auto"
        disabled={!a.mealPattern || !a.suspectedFoods.trim()}
        onClick={() => {
          track("meals_done");
          void persistSession("meals");
          navigate({ to: "/tried" });
        }}
      >
        Next
      </button>
    </Shell>
  );
}
