import { describe, expect, it } from "vitest";
import { cleanEvents, earlyAccessClicks, funnelCounts, uniqueSessions } from "./funnel";

const ev = (s: string, n: string) => ({ session_id: s, event_name: n });

describe("funnel", () => {
  it("counts a refreshing session once", () => {
    expect(uniqueSessions([ev("a", "next_view"), ev("a", "next_view")], "next_view").size).toBe(1);
  });
  it("later steps never exceed earlier ones", () => {
    const c = funnelCounts([ev("a", "start_click"), ev("b", "next_view"), ev("b", "next_view")]);
    expect(c[0]).toBe(2);
    for (let i = 1; i < c.length; i++) expect(c[i]).toBeLessThanOrEqual(c[i - 1]);
  });
  it("click rate uses unique clickers over unique next viewers", () => {
    const r = earlyAccessClicks([
      ev("a", "next_view"), ev("a", "next_view"), ev("a", "early_access_click"), ev("a", "early_access_click"),
      ev("b", "next_view"),
    ]);
    expect(r).toEqual({ clicks: 1, views: 2 });
  });
  it("excludes test sessions", () => {
    expect(cleanEvents([ev("a", "x"), ev("t", "x")], new Set(["t"]))).toHaveLength(1);
  });
});
