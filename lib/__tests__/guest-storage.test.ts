import { describe, it, expect, beforeEach } from "vitest";
import {
  getGuestSessions,
  saveGuestSession,
  clearGuestSessions,
  removeGuestSession,
  hasUnsyncedGuestSessions,
  calculateGuestAnalytics,
} from "@/lib/guest-storage";

describe("Guest Storage Layer", () => {
  beforeEach(() => {
    clearGuestSessions();
  });

  it("starts with empty guest sessions", () => {
    expect(getGuestSessions()).toEqual([]);
    expect(hasUnsyncedGuestSessions()).toBe(false);
  });

  it("saves and retrieves guest sessions correctly in localStorage", () => {
    const saved = saveGuestSession({
      category: "Frontend Engineer / UI Developer (Component lifecycle, state management, CSS layouts, web performance)",
      mode: "typed",
      averageScore: 8.5,
      entries: [
        {
          question: {
            id: "q_1",
            category: "Frontend Engineer / UI Developer (Component lifecycle, state management, CSS layouts, web performance)",
            text: "Explain React Server Components.",
          },
          answer: "RSCs render on the server without shipping JavaScript bundles to the browser.",
          feedback: {
            score: 9,
            strengths: ["Clear differentiation of server vs client bundles"],
            areasForImprovement: ["Mention data streaming with Suspense"],
            summary: "Strong concise explanation.",
          },
        },
      ],
    });

    expect(saved.id).toMatch(/^sess_guest_/);
    expect(saved.category).toBe("Frontend Engineer / UI Developer (Component lifecycle, state management, CSS layouts, web performance)");
    expect(saved.averageScore).toBe(8.5);
    expect(hasUnsyncedGuestSessions()).toBe(true);

    const retrieved = getGuestSessions();
    expect(retrieved.length).toBe(1);
    expect(retrieved[0].id).toBe(saved.id);
  });

  it("calculates accurate aggregate analytics across multiple guest sessions", () => {
    saveGuestSession({
      category: "Frontend Engineer / UI Developer (Component lifecycle, state management, CSS layouts, web performance)",
      mode: "typed",
      averageScore: 8.0,
      entries: [
        {
          question: {
            id: "q_1",
            category: "Frontend Engineer / UI Developer (Component lifecycle, state management, CSS layouts, web performance)",
            text: "Q1",
          },
          answer: "Ans 1",
          feedback: {
            score: 8,
            strengths: ["Good articulation"],
            areasForImprovement: ["Add concrete metrics"],
            summary: "Good response.",
          },
        },
      ],
    });

    saveGuestSession({
      category: "Software Engineer / Backend Developer (Data structures, algorithms, API design, database optimization)",
      mode: "mic",
      averageScore: 9.0,
      entries: [
        {
          question: {
            id: "q_2",
            category: "Software Engineer / Backend Developer (Data structures, algorithms, API design, database optimization)",
            text: "Q2",
          },
          answer: "Ans 2",
          feedback: {
            score: 9,
            strengths: ["Good articulation", "System architecture depth"],
            areasForImprovement: ["Mention database indexing"],
            summary: "Excellent depth.",
          },
        },
      ],
    });

    const analytics = calculateGuestAnalytics();
    expect(analytics.totalSessions).toBe(2);
    expect(analytics.averageScore).toBe(8.5);
    expect(analytics.totalQuestionsAnswered).toBe(2);
    expect(analytics.completedCategories.length).toBe(2);
    expect(analytics.topStrengths).toContain("Good articulation");
  });

  it("allows removing individual sessions after sync", () => {
    const s1 = saveGuestSession({
      category: "Product Manager (Product vision, metric prioritization, UI/UX critique, feature trade-offs)",
      mode: "typed",
      averageScore: 7.5,
      entries: [],
    });

    const s2 = saveGuestSession({
      category: "Technical Program Manager / Scrum Master (Agile processes, cross-functional alignment, timeline risk management)",
      mode: "typed",
      averageScore: 8.0,
      entries: [],
    });

    expect(getGuestSessions().length).toBe(2);
    removeGuestSession(s1.id);

    const remaining = getGuestSessions();
    expect(remaining.length).toBe(1);
    expect(remaining[0].id).toBe(s2.id);
  });
});
