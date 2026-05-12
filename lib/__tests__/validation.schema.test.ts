// Tests for validation helpers: validateAnswer, validateCategory, validateFeedback
// Requirements: 1.4, 5.2, 5.8

import { describe, it, expect } from "vitest";
import { validateAnswer, validateCategory, validateFeedback } from "@/lib/validation";
import type { Feedback } from "@/types/index";

// Helper to build a valid Feedback object
function validFeedback(overrides: Partial<Feedback> = {}): Feedback {
  return {
    score: 7,
    strengths: ["Clear structure", "Good examples"],
    areasForImprovement: ["Be more concise"],
    summary: "A solid answer with clear examples.",
    ...overrides,
  };
}

describe("validateFeedback", () => {
  // ── Valid inputs ──────────────────────────────────────────────────────────

  describe("valid Feedback objects", () => {
    it("accepts a well-formed Feedback object", () => {
      const feedback = validFeedback();
      expect(() => validateFeedback(feedback)).not.toThrow();
      expect(validateFeedback(feedback)).toEqual(feedback);
    });

    it("accepts score at lower boundary (1)", () => {
      expect(() => validateFeedback(validFeedback({ score: 1 }))).not.toThrow();
    });

    it("accepts score at upper boundary (10)", () => {
      expect(() =>
        validateFeedback(validFeedback({ score: 10 }))
      ).not.toThrow();
    });

    it("accepts strengths array with exactly 1 item", () => {
      expect(() =>
        validateFeedback(validFeedback({ strengths: ["One strength"] }))
      ).not.toThrow();
    });

    it("accepts strengths array with exactly 5 items", () => {
      expect(() =>
        validateFeedback(
          validFeedback({ strengths: ["a", "b", "c", "d", "e"] })
        )
      ).not.toThrow();
    });

    it("accepts areasForImprovement array with exactly 1 item", () => {
      expect(() =>
        validateFeedback(
          validFeedback({ areasForImprovement: ["One area"] })
        )
      ).not.toThrow();
    });

    it("accepts areasForImprovement array with exactly 5 items", () => {
      expect(() =>
        validateFeedback(
          validFeedback({ areasForImprovement: ["a", "b", "c", "d", "e"] })
        )
      ).not.toThrow();
    });

    it("accepts a summary at exactly 100 words", () => {
      const hundredWords = Array(100).fill("word").join(" ");
      expect(() =>
        validateFeedback(validFeedback({ summary: hundredWords }))
      ).not.toThrow();
    });

    it("accepts a summary with fewer than 100 words", () => {
      expect(() =>
        validateFeedback(validFeedback({ summary: "Short summary." }))
      ).not.toThrow();
    });
  });

  // ── Out-of-range scores ───────────────────────────────────────────────────

  describe("out-of-range score rejection", () => {
    it("rejects score of 0 (below minimum)", () => {
      expect(() => validateFeedback(validFeedback({ score: 0 }))).toThrow();
    });

    it("rejects score of 11 (above maximum)", () => {
      expect(() => validateFeedback(validFeedback({ score: 11 }))).toThrow();
    });

    it("rejects score of -1 (negative)", () => {
      expect(() => validateFeedback(validFeedback({ score: -1 }))).toThrow();
    });

    it("rejects score of 1.5 (non-integer / fractional)", () => {
      expect(() => validateFeedback(validFeedback({ score: 1.5 }))).toThrow();
    });
  });

  // ── Oversized arrays ──────────────────────────────────────────────────────

  describe("oversized array rejection", () => {
    it("rejects strengths array with 6 items (>5)", () => {
      expect(() =>
        validateFeedback(
          validFeedback({ strengths: ["a", "b", "c", "d", "e", "f"] })
        )
      ).toThrow();
    });

    it("rejects areasForImprovement array with 6 items (>5)", () => {
      expect(() =>
        validateFeedback(
          validFeedback({
            areasForImprovement: ["a", "b", "c", "d", "e", "f"],
          })
        )
      ).toThrow();
    });

    it("rejects strengths array with 0 items (empty)", () => {
      expect(() =>
        validateFeedback(validFeedback({ strengths: [] }))
      ).toThrow();
    });

    it("rejects areasForImprovement array with 0 items (empty)", () => {
      expect(() =>
        validateFeedback(validFeedback({ areasForImprovement: [] }))
      ).toThrow();
    });
  });

  // ── Oversized summary ─────────────────────────────────────────────────────

  describe("oversized summary rejection", () => {
    it("rejects a summary with 101 words (>100)", () => {
      const tooLong = Array(101).fill("word").join(" ");
      expect(() =>
        validateFeedback(validFeedback({ summary: tooLong }))
      ).toThrow();
    });

    it("rejects a summary with 200 words", () => {
      const wayTooLong = Array(200).fill("word").join(" ");
      expect(() =>
        validateFeedback(validFeedback({ summary: wayTooLong }))
      ).toThrow();
    });
  });

  // ── Non-object / malformed inputs ─────────────────────────────────────────

  describe("malformed input rejection", () => {
    it("rejects null", () => {
      expect(() => validateFeedback(null)).toThrow();
    });

    it("rejects undefined", () => {
      expect(() => validateFeedback(undefined)).toThrow();
    });

    it("rejects a plain string", () => {
      expect(() => validateFeedback("not a feedback object")).toThrow();
    });

    it("rejects an object missing the score field", () => {
      const { score: _score, ...noScore } = validFeedback();
      expect(() => validateFeedback(noScore)).toThrow();
    });

    it("rejects an object missing the strengths field", () => {
      const { strengths: _strengths, ...noStrengths } = validFeedback();
      expect(() => validateFeedback(noStrengths)).toThrow();
    });

    it("rejects an object missing the areasForImprovement field", () => {
      const { areasForImprovement: _areas, ...noAreas } = validFeedback();
      expect(() => validateFeedback(noAreas)).toThrow();
    });

    it("rejects an object missing the summary field", () => {
      const { summary: _summary, ...noSummary } = validFeedback();
      expect(() => validateFeedback(noSummary)).toThrow();
    });
  });
});

// ── validateAnswer ────────────────────────────────────────────────────────────

describe("validateAnswer", () => {
  describe("invalid inputs (should return an error string)", () => {
    it("returns an error for an empty string", () => {
      expect(validateAnswer("")).not.toBeNull();
    });

    it("returns an error for a string of spaces only", () => {
      expect(validateAnswer("   ")).not.toBeNull();
    });

    it("returns an error for a tab-only string", () => {
      expect(validateAnswer("\t\t")).not.toBeNull();
    });

    it("returns an error for a newline-only string", () => {
      expect(validateAnswer("\n\n")).not.toBeNull();
    });

    it("returns an error for mixed whitespace (spaces, tabs, newlines)", () => {
      expect(validateAnswer("  \t  \n  ")).not.toBeNull();
    });

    it("returns a string (not null) so the caller can display the message", () => {
      const result = validateAnswer("   ");
      expect(typeof result).toBe("string");
    });
  });

  describe("valid inputs (should return null)", () => {
    it("returns null for a plain non-empty string", () => {
      expect(validateAnswer("Hello")).toBeNull();
    });

    it("returns null for a string with leading/trailing whitespace around real content", () => {
      expect(validateAnswer("  some answer  ")).toBeNull();
    });

    it("returns null for a single non-whitespace character", () => {
      expect(validateAnswer("a")).toBeNull();
    });

    it("returns null for a multi-sentence answer", () => {
      expect(
        validateAnswer("I handled the conflict by communicating clearly with my team.")
      ).toBeNull();
    });
  });
});

// ── validateCategory ──────────────────────────────────────────────────────────

describe("validateCategory", () => {
  describe("all five valid category values", () => {
    it("accepts 'Behavioral'", () => {
      expect(validateCategory("Behavioral")).toBe(true);
    });

    it("accepts 'Technical'", () => {
      expect(validateCategory("Technical")).toBe(true);
    });

    it("accepts 'Cultural Fit'", () => {
      expect(validateCategory("Cultural Fit")).toBe(true);
    });

    it("accepts 'Situational'", () => {
      expect(validateCategory("Situational")).toBe(true);
    });

    it("accepts 'Communication & Presence'", () => {
      expect(validateCategory("Communication & Presence")).toBe(true);
    });
  });

  describe("invalid values (should return false)", () => {
    it("rejects an empty string", () => {
      expect(validateCategory("")).toBe(false);
    });

    it("rejects a random string not in the list", () => {
      expect(validateCategory("Leadership")).toBe(false);
    });

    it("rejects a lowercase variant of a valid category", () => {
      expect(validateCategory("behavioral")).toBe(false);
    });

    it("rejects a partial match", () => {
      expect(validateCategory("Technical Skills")).toBe(false);
    });

    it("rejects null", () => {
      expect(validateCategory(null)).toBe(false);
    });

    it("rejects undefined", () => {
      expect(validateCategory(undefined)).toBe(false);
    });

    it("rejects a number", () => {
      expect(validateCategory(42)).toBe(false);
    });

    it("rejects an object", () => {
      expect(validateCategory({ category: "Behavioral" })).toBe(false);
    });
  });
});
