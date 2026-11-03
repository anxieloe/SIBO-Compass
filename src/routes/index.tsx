import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Shell } from "@/components/flow-ui";
import { startSession, track } from "@/lib/flow";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SIBO Compass — A symptom summary for your doctor" },
      { name: "description", content: "Track your digestive symptoms and get a free one-page summary to bring to your doctor." },
      { property: "og:title", content: "SIBO Compass — From always bloated to a plan" },
      { property: "og:description", content: "A free one-page symptom summary to bring to your doctor. Not medical advice." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  const navigate = useNavigate();
  useEffect(() => track("welcome_view"), []);
  return (
    <Shell disclaimer={false}>
      <div className="flex flex-1 flex-col justify-center py-10">
        <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-lg bg-primary text-2xl text-primary-foreground" aria-hidden>
          ✦
        </div>
        <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          From always bloated to a plan.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Track your symptoms and get a one-page summary to bring to your doctor. Free.
        </p>
        <button
          className="btn-primary mt-10"
          onClick={() => {
            startSession();
            track("start_click");
            navigate({ to: "/symptoms" });
          }}
        >
          Start
        </button>
        <p className="mt-4 text-center text-sm text-muted-foreground">Early concept test. Not medical advice.</p>
      </div>
    </Shell>
  );
}
