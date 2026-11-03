import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export const DISCLAIMER = "Not medical advice. This app does not diagnose.";

export function Shell({
  children,
  step,
  total = 4,
  back,
  disclaimer = true,
}: {
  children: ReactNode;
  step?: number;
  total?: number;
  back?: string;
  disclaimer?: boolean;
}) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-5 pb-10 pt-5">
      <header className="no-print mb-6 flex items-center gap-3">
        {back ? (
          <Link to={back} className="btn-ghost min-h-12 px-4 text-sm" aria-label="Back to previous step">
            ← Back
          </Link>
        ) : (
          <span className="text-sm font-semibold tracking-wide text-primary">SIBO Compass</span>
        )}
        {step && (
          <div className="flex-1">
            <div
              className="h-2 w-full overflow-hidden rounded-full bg-secondary"
              role="progressbar"
              aria-valuemin={1}
              aria-valuemax={total}
              aria-valuenow={step}
              aria-label={`Step ${step} of ${total}`}
            >
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(step / total) * 100}%` }} />
            </div>
            <p className="mt-1 text-right text-xs text-muted-foreground">
              Step {step} of {total}
            </p>
          </div>
        )}
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
      {disclaimer && (
        <p className="no-print mt-8 text-center text-xs text-muted-foreground">{DISCLAIMER}</p>
      )}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-lg bg-card p-5 shadow-sm ${className}`}>{children}</div>;
}

export function Group({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <fieldset className="mb-7">
      <legend className="mb-1 text-lg font-semibold">{label}</legend>
      {hint && <p className="mb-3 text-sm text-muted-foreground">{hint}</p>}
      {!hint && <div className="mb-3" />}
      {children}
    </fieldset>
  );
}

export function MultiChips({
  options,
  value,
  onToggle,
}: {
  options: string[];
  value: string[];
  onToggle: (o: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          role="checkbox"
          aria-checked={value.includes(o)}
          className="chip"
          onClick={() => onToggle(o)}
        >
          {value.includes(o) && <span aria-hidden>✓</span>}
          {o}
        </button>
      ))}
    </div>
  );
}

export function SingleList({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: string[];
  value: string | null;
  onChange: (o: string) => void;
}) {
  return (
    <div role="radiogroup" aria-label={name} className="flex flex-col gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          role="radio"
          aria-checked={value === o}
          className="option-row"
          onClick={() => onChange(o)}
        >
          <span
            aria-hidden
            className={`h-5 w-5 shrink-0 rounded-full border-2 ${value === o ? "border-primary bg-primary shadow-[inset_0_0_0_3px_var(--color-card)]" : "border-input"}`}
          />
          {o}
        </button>
      ))}
    </div>
  );
}

export function CheckList({
  options,
  value,
  onToggle,
}: {
  options: string[];
  value: string[];
  onToggle: (o: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          role="checkbox"
          aria-checked={value.includes(o)}
          className="option-row"
          onClick={() => onToggle(o)}
        >
          <span
            aria-hidden
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 text-xs ${value.includes(o) ? "border-primary bg-primary text-primary-foreground" : "border-input"}`}
          >
            {value.includes(o) ? "✓" : ""}
          </span>
          {o}
        </button>
      ))}
    </div>
  );
}

export function Notice({ children }: { children: ReactNode }) {
  return (
    <p role="status" className="mb-4 rounded-md bg-warning-soft p-3 text-sm text-warning">
      {children}
    </p>
  );
}

export function toggle(list: string[], item: string) {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}
