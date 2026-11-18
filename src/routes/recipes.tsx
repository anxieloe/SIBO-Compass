import { useEffect } from "react";
import { track } from "@/lib/flow";
import { createFileRoute } from "@tanstack/react-router";
import { Card, Shell } from "@/components/flow-ui";
import { RECIPES } from "@/lib/resources";

export const Route = createFileRoute("/recipes")({
  head: () => ({
    meta: [
      { title: "Simple recipes — SIBO Compass" },
      { name: "description", content: "Simple low-FODMAP-style starter recipes for people with bloating." },
      { property: "og:title", content: "Simple recipes — SIBO Compass" },
      { property: "og:description", content: "Simple starter recipes to try. Check with a dietitian." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Recipes,
});

function Recipes() {
  useEffect(() => track("recipe_view"), []);
  return (
    <Shell back="/">
      <p className="mb-4 rounded-md border-l-4 border-primary bg-primary-soft p-3 text-sm font-medium">
        General food ideas only. This is not medical or dietary advice. Talk to a dietitian or doctor before changing
        your diet.
      </p>
      <h1 className="mb-2 text-2xl font-bold">Recipes</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Simple meal ideas made without garlic, onion or wheat.
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
