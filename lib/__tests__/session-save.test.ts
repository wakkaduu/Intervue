import { describe, it, expect, beforeEach } from "vitest";
import { markSaved, resultsKey, wasSaved } from "../session-save";
import type { SessionEntry } from "@/types";

const entry = (score: number): SessionEntry => ({
  question: { id: "q1", category: "Behavioral", text: "Tell me about yourself." },
  answer: "I lead a team.",
  feedback: { score, strengths: ["a"], areasForImprovement: ["b"], summary: "ok" },
});

describe("session save de-duplication", () => {
  beforeEach(() => sessionStorage.clear());

  it("uses the stored results id when there is one", () => {
    sessionStorage.setItem("sessionResultsId", "run-1");
    expect(resultsKey([entry(5)])).toBe("run-1");
  });

  it("falls back to a signature of the entries when there is no id", () => {
    expect(resultsKey([entry(5)])).toBe("1:q1:5");
    expect(resultsKey([entry(5)])).not.toBe(resultsKey([entry(6)]));
  });

  it("remembers a save, so a refresh does not save the same session again", () => {
    const key = resultsKey([entry(5)]);
    expect(wasSaved("guest", key)).toBe(false);
    markSaved("guest", key);
    expect(wasSaved("guest", key)).toBe(true);
  });

  it("treats a new session as unsaved, and tracks guest and account separately", () => {
    sessionStorage.setItem("sessionResultsId", "run-1");
    markSaved("guest", "run-1");
    expect(wasSaved("account", "run-1")).toBe(false); // signing in later still saves to the account

    sessionStorage.setItem("sessionResultsId", "run-2");
    expect(wasSaved("guest", "run-2")).toBe(false);
  });
});
