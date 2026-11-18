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
    for (let i = 1; i < c.length; i++) expect(c[i]).toBeLessThanOrEqual(c[i - 1]!);
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

describe("price experiment", () => {
  it("counts each person once per arm and channel, with reservation rate", async () => {
    const { priceExperiment } = await import("./funnel");
    const e = (s: string, n: string, arm: string | null, ch = "instagram") => ({ session_id: s, event_name: n, price_arm: arm, channel: ch });
    const rows = priceExperiment([
      e("1", "start_click", null), e("1", "pricing_view", "A"), e("1", "pricing_view", "A"), e("1", "reserve_submit", "A"),
      e("2", "pricing_view", "A"),
      e("3", "pricing_view", "B", "direct"),
    ]);
    expect(rows).toEqual([
      expect.objectContaining({ arm: "A", channel: "instagram", viewed: 2, submitted: 1, rate: "50%" }),
      expect.objectContaining({ arm: "B", channel: "direct", viewed: 1, submitted: 0, rate: "0%" }),
    ]);
  });
});
