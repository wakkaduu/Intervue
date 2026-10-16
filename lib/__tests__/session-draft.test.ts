import { describe, it, expect, beforeEach } from "vitest";
import { saveDraft, loadDraft, clearDraft, countDraftAnswers } from "../session-draft";

const base = { category: "Behavioral", mode: "typed" as const, durations: {}, questionIndex: 2 };

describe("session draft autosave", () => {
  beforeEach(() => localStorage.clear());

  it("round-trips a draft for the same category and mode", () => {
    saveDraft({ ...base, answers: { 0: "a", 1: "b" } });
    const d = loadDraft("Behavioral", "typed");
    expect(d?.questionIndex).toBe(2);
    expect(countDraftAnswers(d!)).toBe(2);
  });

  it("ignores drafts for another category or mode", () => {
    saveDraft({ ...base, answers: { 0: "a" } });
    expect(loadDraft("Cultural Fit", "typed")).toBeNull();
    expect(loadDraft("Behavioral", "mic")).toBeNull();
  });

  it("never overwrites a saved draft with an empty one", () => {
    saveDraft({ ...base, answers: { 0: "keep me" } });
    saveDraft({ ...base, answers: { 0: "   " } });
    expect(loadDraft("Behavioral", "typed")?.answers[0]).toBe("keep me");
  });

  it("expires after 24 hours and survives corrupt data", () => {
    saveDraft({ ...base, answers: { 0: "a" } });
    expect(loadDraft("Behavioral", "typed", Date.now() + 25 * 3600 * 1000)).toBeNull();
    localStorage.setItem("intervue_session_draft_v1", "{not json");
    expect(loadDraft("Behavioral", "typed")).toBeNull();
  });

  it("clearDraft removes it", () => {
    saveDraft({ ...base, answers: { 0: "a" } });
    clearDraft();
    expect(loadDraft("Behavioral", "typed")).toBeNull();
  });
});
