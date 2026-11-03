import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Group, MultiChips, Shell, SingleList } from "@/components/flow-ui";
import { persistSession, setAnswers, track, useFlow } from "@/lib/flow";
import { MEAL_PATTERNS, NO_FOOD_YET, SUSPECTED_FOODS, toggleFood } from "@/lib/questions";

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
  const [extra, setExtra] = useState("");

  const addExtra = () => {
    const items = extra
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!items.length) return;
    const known = new Set([...a.suspectedFoods, ...a.suspectedFoodsExtra]);
    setAnswers({
      suspectedFoodsExtra: [...a.suspectedFoodsExtra, ...items.filter((i) => !known.has(i))],
    });
    setExtra("");
  };

  const foodsAnswered = a.suspectedFoods.length > 0 || a.suspectedFoodsExtra.length > 0;

  return (
    <Shell step={2} back="/symptoms">
      <h1 className="mb-6 text-2xl font-bold">Meals</h1>
      <Group label="Do symptoms follow meals?">
        <SingleList name="Do symptoms follow meals?" options={MEAL_PATTERNS} value={a.mealPattern} onChange={(o) => setAnswers({ mealPattern: o })} />
      </Group>
      <Group label="Foods you suspect" hint="Tap everything that seems to trigger you — as many as you like.">
        <MultiChips
          options={[...SUSPECTED_FOODS, NO_FOOD_YET]}
          value={a.suspectedFoods}
          onToggle={(o) => setAnswers({ suspectedFoods: toggleFood(a.suspectedFoods, o) })}
        />
      </Group>
      <div className="mb-7">
        <label htmlFor="food-extra" className="mb-1 block text-lg font-semibold">
          Anything not on the list?
        </label>
        <p className="mb-3 text-sm text-muted-foreground">Type it in and add it to your selection.</p>
        <div className="flex gap-2">
          <input
            id="food-extra"
            type="text"
            value={extra}
            maxLength={40}
            onChange={(e) => setExtra(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addExtra();
              }
            }}
            placeholder="e.g. coffee, sweeteners"
            className="min-h-12 flex-1 rounded-lg border-[1.5px] border-input bg-card px-3 text-base focus:border-primary"
          />
          <button type="button" className="btn-ghost min-h-12 px-4 text-sm" onClick={addExtra} disabled={!extra.trim()}>
            Add
          </button>
        </div>
        {a.suspectedFoodsExtra.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {a.suspectedFoodsExtra.map((f) => (
              <li key={f}>
                <button
                  type="button"
                  aria-pressed="true"
                  aria-label={`Remove ${f}`}
                  className="chip"
                  onClick={() => setAnswers({ suspectedFoodsExtra: a.suspectedFoodsExtra.filter((x) => x !== f) })}
                >
                  {f}
                  <span aria-hidden>×</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button
        className="btn-primary mt-auto"
        disabled={!a.mealPattern || !foodsAnswered}
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
