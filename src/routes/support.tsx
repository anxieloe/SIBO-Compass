import { createFileRoute } from "@tanstack/react-router";
import { Card, Shell } from "@/components/flow-ui";
import { track } from "@/lib/flow";
import { SUPPORT_GROUPS } from "@/lib/resources";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "SIBO support groups — SIBO Compass" },
      { name: "description", content: "Online SIBO and gut-health support communities you can join." },
      { property: "og:title", content: "SIBO support groups — SIBO Compass" },
      { property: "og:description", content: "Find people who understand. Online SIBO communities." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Support,
});

function Support() {
  return (
    <Shell back="/">
      <h1 className="mb-2 text-2xl font-bold">Support groups</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Online communities where people share their experience. We're not connected to these groups, and what members
        share is not medical advice.
      </p>
      <p className="mb-6 text-sm font-medium">
        These are independent communities. We don't run them and can't check the advice shared there.
      </p>
      <div className="flex flex-col gap-3">
        {SUPPORT_GROUPS.map((g) => (
          <a key={g.name} href={g.url} target="_blank" rel="noopener noreferrer" className="block" onClick={() => track("support_group_click")}>
            <Card className="transition-shadow hover:shadow-md">
              <h2 className="font-semibold text-primary">{g.name} ↗</h2>
              <p className="mt-1 text-sm text-muted-foreground">{g.about}</p>
            </Card>
          </a>
        ))}
      </div>
    </Shell>
  );
}
