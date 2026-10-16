import { describe, it, expect } from "vitest";
import { validateHistoryPayload } from "../validation";
import { CATEGORIES } from "../questions";

const category = CATEGORIES[0];
const feedback = (score: number) => ({
  score,
  strengths: ["clear"],
  areasForImprovement: ["metrics"],
  summary: "Borderline response.",
});
const entry = (score: number) => ({
  question: { id: "q1", category, text: "Tell me about yourself." },
  answer: "I led a team.",
  feedback: feedback(score),
});

describe("validateHistoryPayload", () => {
  it("recomputes the average score and ignores the client-supplied one", () => {
    const result = validateHistoryPayload({
      category,
      mode: "mic",
      averageScore: 10,
      entries: [entry(4), entry(6)],
    });
    expect(result.averageScore).toBe(5);
    expect(result.mode).toBe("mic");
  });

  it("rejects an unknown category", () => {
    expect(() =>
      validateHistoryPayload({ category: "Nope", entries: [entry(5)] })
    ).toThrow(/category/);
  });

  it("rejects empty and oversized entry lists", () => {
    expect(() => validateHistoryPayload({ category, entries: [] })).toThrow();
    expect(() =>
      validateHistoryPayload({ category, entries: Array(51).fill(entry(5)) })
    ).toThrow();
  });

  it("rejects out-of-range scores and oversized answers", () => {
    expect(() =>
      validateHistoryPayload({ category, entries: [entry(99)] })
    ).toThrow(/score/);
    const big = { ...entry(5), answer: "x".repeat(10_001) };
    expect(() => validateHistoryPayload({ category, entries: [big] })).toThrow();
  });
});
