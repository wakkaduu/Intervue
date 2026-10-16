import { describe, it, expect } from "vitest";
import { buildTrendPoints, shortCategory, summarizeTrend, trackOptions } from "../progress-trend";

const s = (id: string, day: number, score: number, category = "Behavioral") => ({
  id,
  category,
  averageScore: score,
  questionCount: 5,
  createdAt: `2026-10-${String(day).padStart(2, "0")}T10:00:00.000Z`,
});

describe("buildTrendPoints", () => {
  it("orders oldest to newest regardless of input order", () => {
    const pts = buildTrendPoints([s("c", 3, 7), s("a", 1, 4), s("b", 2, 5)]);
    expect(pts.map((p) => p.id)).toEqual(["a", "b", "c"]);
  });

  it("filters by track, drops invalid rows, clamps scores, and keeps the latest 30", () => {
    const many = Array.from({ length: 35 }, (_, i) => s(`x${i}`, (i % 28) + 1, 5));
    expect(buildTrendPoints(many)).toHaveLength(30);
    const pts = buildTrendPoints(
      [s("a", 1, 4, "Behavioral"), s("b", 2, 6, "Cultural Fit"), { ...s("c", 3, NaN) }, { ...s("d", 4, 15) }],
      null
    );
    expect(pts.map((p) => p.id)).toEqual(["a", "b", "d"]);
    expect(pts[2].score).toBe(10);
    expect(buildTrendPoints([s("a", 1, 4), s("b", 2, 6, "Cultural Fit")], "Cultural Fit")).toHaveLength(1);
  });
});

describe("summarizeTrend", () => {
  it("returns null for no data and a no-delta summary for one session", () => {
    expect(summarizeTrend([])).toBeNull();
    const one = summarizeTrend(buildTrendPoints([s("a", 1, 6.2)]))!;
    expect(one.delta).toBeNull();
    expect(one.direction).toBe("none");
  });

  it("compares first and latest for 2-3 sessions", () => {
    const t = summarizeTrend(buildTrendPoints([s("a", 1, 4), s("b", 2, 6)]))!;
    expect(t.delta).toBe(2);
    expect(t.direction).toBe("up");
    expect(t.deltaLabel).toMatch(/first session/);
  });

  it("compares first-3 vs last-3 averages for 4+ sessions", () => {
    const t = summarizeTrend(
      buildTrendPoints([s("a", 1, 3), s("b", 2, 4), s("c", 3, 5), s("d", 4, 6), s("e", 5, 7), s("f", 6, 8)])
    )!;
    expect(t.delta).toBe(3); // mean(6,7,8)=7 vs mean(3,4,5)=4
    expect(t.best).toBe(8);
    expect(t.latest).toBe(8);
  });

  it("reports flat for small changes and down for declines", () => {
    expect(summarizeTrend(buildTrendPoints([s("a", 1, 6), s("b", 2, 6.2)]))!.direction).toBe("flat");
    expect(summarizeTrend(buildTrendPoints([s("a", 1, 7), s("b", 2, 5)]))!.direction).toBe("down");
  });
});

describe("helpers", () => {
  it("shortens long category names", () => {
    expect(shortCategory("Frontend Engineer / UI Developer (Component lifecycle, state)")).toBe(
      "Frontend Engineer / UI Developer"
    );
    expect(shortCategory("Behavioral")).toBe("Behavioral");
  });

  it("lists tracks most-practised first", () => {
    const opts = trackOptions([s("a", 1, 1, "B"), s("b", 2, 1, "A"), s("c", 3, 1, "A")]);
    expect(opts).toEqual([
      { category: "A", count: 2 },
      { category: "B", count: 1 },
    ]);
  });
});
