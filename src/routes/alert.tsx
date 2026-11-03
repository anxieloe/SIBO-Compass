import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Card, Shell } from "@/components/flow-ui";
import { track } from "@/lib/flow";

export const Route = createFileRoute("/alert")({
  head: () => ({
    meta: [
      { title: "Please see a doctor soon — SIBO Compass" },
      { name: "description", content: "Some signs need a medical check before anything else." },
      { property: "og:title", content: "Please see a doctor soon — SIBO Compass" },
      { property: "og:description", content: "These signs need a medical check before anything else." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Alert,
});

function Alert() {
  useEffect(() => track("alert_shown"), []);
  return (
    <Shell>
      <div className="flex flex-1 flex-col justify-center">
        <Card className="border-2 border-warning">
          <div className="mb-4 text-3xl" aria-hidden>⚠︎</div>
          <h1 className="text-2xl font-bold">Please see a doctor soon.</h1>
          <p className="mt-3 text-lg">These signs need a medical check before anything else.</p>
        </Card>
        <Link to="/safety" className="btn-primary mt-8">
          Back
        </Link>
      </div>
    </Shell>
  );
}
