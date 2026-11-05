import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Shell } from "@/components/flow-ui";
import { resetFlow } from "@/lib/flow";

export const Route = createFileRoute("/thanks")({
  head: () => ({
    meta: [
      { title: "You're on the list — SIBO Compass" },
      { name: "description", content: "Thanks for joining the SIBO Compass early access list." },
      { property: "og:title", content: "You're on the list — SIBO Compass" },
      { property: "og:description", content: "Thanks for joining the early access list." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Thanks,
});

function Thanks() {
  const navigate = useNavigate();
  return (
    <Shell disclaimer={false}>
      <div className="flex flex-1 flex-col justify-center text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-3xl text-primary" aria-hidden>
          ✓
        </div>
        <h1 className="text-3xl font-bold">You're on the list.</h1>
        <p className="mt-3 text-lg">We'll email you when it's ready.</p>
        <p className="mt-4 text-muted-foreground">
          This is an early concept test. Nothing was ordered and no medical advice was given.
        </p>
        <button
          className="btn-primary mt-10"
          onClick={() => {
            resetFlow();
            navigate({ to: "/" });
          }}
        >
          Back to start
        </button>
      </div>
    </Shell>
  );
}
