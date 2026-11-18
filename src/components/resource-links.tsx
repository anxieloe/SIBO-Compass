import { Link } from "@tanstack/react-router";

export function ResourceLinks() {
  const items = [
    { to: "/recipes", label: "Recipes" },
    { to: "/support", label: "Support groups" },
    { to: "/practitioners", label: "Find a dietitian" },
  ] as const;
  return (
    <nav aria-label="More help" className="no-print mt-6 grid grid-cols-3 gap-2">
      {items.map((i) => (
        <Link key={i.to} to={i.to} className="btn-ghost border-[1.5px] border-input px-2 text-center text-sm">
          {i.label}
        </Link>
      ))}
    </nav>
  );
}
