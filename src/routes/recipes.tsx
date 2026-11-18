import { createFileRoute } from "@tanstack/react-router";
import { Card, Shell } from "@/components/flow-ui";
import { RECIPES } from "@/lib/resources";

export const Route = createFileRoute("/recipes")({
  head: () => ({
    meta: [
      { title: "Gut-friendly recipes — SIBO Compass" },
      { name: "description", content: "Simple low-FODMAP-style starter recipes for people with bloating." },
      { property: "og:title", content: "Gut-friendly recipes — SIBO Compass" },
      { property: "og:description", content: "Simple starter recipes to try. Check with a dietitian." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Recipes,
});

function Recipes() {
  return (
    <Shell back="/">
      <h1 className="mb-2 text-2xl font-bold">Gut-friendly recipes</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Simple examples that avoid common trigger foods like garlic, onion and wheat. They are not a treatment diet —
        check with a dietitian before changing what you eat.
      </p>
      <div className="flex flex-col gap-4">
        {RECIPES.map((r) => (
          <Card key={r.title}>
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h2 className="text-lg font-semibold">{r.title}</h2>
              <span className="shrink-0 text-sm text-muted-foreground">{r.time}</span>
            </div>
            <h3 className="text-sm font-semibold">Ingredients</h3>
            <ul className="mb-3 list-disc pl-5 text-sm">{r.ingredients.map((i) => <li key={i}>{i}</li>)}</ul>
            <h3 className="text-sm font-semibold">Steps</h3>
            <ol className="list-decimal pl-5 text-sm">{r.steps.map((s) => <li key={s}>{s}</li>)}</ol>
          </Card>
        ))}
      </div>
    </Shell>
  );
}
