import { describe, it, expect } from "vitest";
import { buildDebriefFallback, buildDebriefPrompt, validateDebrief } from "../debrief";
import { CATEGORIES } from "../questions";
import type { SessionEntry } from "@/types";

const entry = (id: string, score: number, strengths: string[], gaps: string[]): SessionEntry => ({
  question: { id, category: CATEGORIES[0], text: `Question ${id}?` },
  answer: "I did some work on the project with my team.",
  feedback: { score, strengths, areasForImprovement: gaps, summary: "ok" },
});

const entries = [
  entry("1", 8, ["Clear structure"], ["Add more detail"]),
  entry("2", 3, ["Relevant topic"], ["No metrics or numbers", "Too much 'we', unclear ownership"]),
  entry("3", 5, ["Clear structure"], ["No metrics or numbers"]),
];

describe("buildDebriefFallback", () => {
  it("finds best/weakest questions and de-duplicates patterns", () => {
    const d = buildDebriefFallback(entries);
    expect(d.bestQuestionIndex).toBe(0);
    expect(d.weakestQuestionIndex).toBe(1);
    expect(d.source).toBe("basic");
    expect(d.priorityFixes[0]).toBe("No metrics or numbers");
    expect(new Set(d.priorityFixes).size).toBe(d.priorityFixes.length);
    expect(d.recurringStrengths.filter((s) => s === "Clear structure")).toHaveLength(1);
  });

  it("suggests concrete next steps from detected gaps", () => {
    const steps = buildDebriefFallback(entries).nextSteps.join(" ");
    expect(steps).toMatch(/Q2/);
    expect(steps).toMatch(/number/);
    expect(steps).toMatch(/YOU did/);
  });

  it("works for a single answer", () => {
    const d = buildDebriefFallback([entries[0]]);
    expect(d.nextSteps.length).toBeGreaterThanOrEqual(2);
  });
});

describe("validateDebrief", () => {
  const good = {
    headline: "Borderline overall.",
    summary: "Decent session.",
    recurringStrengths: ["a"],
    priorityFixes: ["b"],
    nextSteps: ["c", "d"],
  };
  it("accepts a valid debrief", () => {
    expect(validateDebrief(good).headline).toBe("Borderline overall.");
  });
  it("rejects malformed debriefs", () => {
    expect(() => validateDebrief({ ...good, nextSteps: ["only one"] })).toThrow();
    expect(() => validateDebrief({ ...good, summary: "word ".repeat(200) })).toThrow();
    expect(() => validateDebrief(null)).toThrow();
  });
});

describe("buildDebriefPrompt", () => {
  it("includes every question and truncates long answers", () => {
    const long = { ...entries[0], answer: "x".repeat(2000) };
    const p = buildDebriefPrompt([long, entries[1]]);
    expect(p).toContain("Q1");
    expect(p).toContain("Q2");
    expect(p.length).toBeLessThan(4000);
  });
});
