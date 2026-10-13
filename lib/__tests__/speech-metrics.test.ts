import { describe, it, expect } from "vitest";
import {
  analyzeSpeechDelivery,
  categorizePace,
  COMMON_FILLER_WORDS,
} from "../speech-metrics";

describe("speech-metrics", () => {
  describe("COMMON_FILLER_WORDS", () => {
    it("contains staple linguistic hesitation markers", () => {
      expect(COMMON_FILLER_WORDS.length).toBeGreaterThan(5);
      expect(COMMON_FILLER_WORDS).toContain("um");
      expect(COMMON_FILLER_WORDS).toContain("uh");
      expect(COMMON_FILLER_WORDS).toContain("like");
    });
  });

  describe("categorizePace", () => {
    it("handles zero or negative WPM", () => {
      const res = categorizePace(0);
      expect(res.category).toBe("unmeasured");
    });

    it("categorizes slow speech (<100 WPM)", () => {
      const res = categorizePace(85);
      expect(res.category).toBe("too-slow");
    });

    it("categorizes thoughtful speech (100-119 WPM)", () => {
      const res = categorizePace(112);
      expect(res.category).toBe("slow");
    });

    it("categorizes optimal conversational speech (120-165 WPM)", () => {
      const res = categorizePace(145);
      expect(res.category).toBe("optimal");
    });

    it("categorizes brisk speech (166-190 WPM)", () => {
      const res = categorizePace(175);
      expect(res.category).toBe("fast");
    });

    it("categorizes rushed speech (>190 WPM)", () => {
      const res = categorizePace(210);
      expect(res.category).toBe("too-fast");
    });
  });

  describe("analyzeSpeechDelivery", () => {
    it("handles empty transcript gracefully", () => {
      const res = analyzeSpeechDelivery("", 30);
      expect(res.totalWords).toBe(0);
      expect(res.wpm).toBe(0);
      expect(res.fillerCount).toBe(0);
      expect(res.paceCategory).toBe("unmeasured");
    });

    it("accurately calculates WPM based on duration", () => {
      // 60 words in 30 seconds = 120 WPM
      const words = Array.from({ length: 60 }, (_, i) => `word${i}`).join(" ");
      const res = analyzeSpeechDelivery(words, 30);
      expect(res.totalWords).toBe(60);
      expect(res.wpm).toBe(120);
      expect(res.paceCategory).toBe("optimal");
    });

    it("detects common filler words", () => {
      const text =
        "Um, I think that, uh, basically our team was, like, really focused on the goal, you know?";
      const res = analyzeSpeechDelivery(text, 15);

      expect(res.fillerCount).toBeGreaterThanOrEqual(4);
      const fillerNames = res.fillerMatches.map((m) => m.word);
      expect(fillerNames).toContain("um");
      expect(fillerNames).toContain("uh");
      expect(fillerNames).toContain("like");
      expect(fillerNames).toContain("basically");
      expect(fillerNames).toContain("you know");
    });

    it("annotates single words correctly for UI rendering", () => {
      const text = "Um hello world like";
      const res = analyzeSpeechDelivery(text, 5);

      expect(res.annotatedWords[0].isFiller).toBe(true);
      expect(res.annotatedWords[1].isFiller).toBe(false);
      expect(res.annotatedWords[2].isFiller).toBe(false);
      expect(res.annotatedWords[3].isFiller).toBe(true);
    });

    it("generates actionable coach feedback", () => {
      const cleanAnswer =
        "In my previous role as an engineering lead I led a team of five developers to migrate our database to Supabase, which resulted in a 40 percent reduction in latency.";
      const res = analyzeSpeechDelivery(cleanAnswer, 20);
      expect(res.fillerCount).toBe(0);
      expect(res.coachTip.toLowerCase()).toContain("no filler words detected");
    });
  });
});
