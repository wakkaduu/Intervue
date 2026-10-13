// Unit tests for the question bank loader
// Requirements: 1.1
import { describe, it, expect } from "vitest";
import { getQuestionsByCategory, getCategories } from "@/lib/questions";

const ALL_CATEGORIES = getCategories();

describe("getCategories", () => {
  it("returns all 32 categories", () => {
    const categories = getCategories();
    expect(categories).toHaveLength(32);
    expect(categories).toEqual(expect.arrayContaining(ALL_CATEGORIES));
  });

  it("contains each expected category exactly once", () => {
    const categories = getCategories();
    for (const cat of ALL_CATEGORIES) {
      expect(categories.filter((c) => c === cat)).toHaveLength(1);
    }
  });
});

describe("getQuestionsByCategory", () => {
  describe.each(ALL_CATEGORIES)("category: %s", (category) => {
    it("returns at least 5 questions", () => {
      const questions = getQuestionsByCategory(category);
      expect(questions.length).toBeGreaterThanOrEqual(5);
    });

    it("returns questions with the correct category field", () => {
      const questions = getQuestionsByCategory(category);
      for (const question of questions) {
        expect(question.category).toBe(category);
      }
    });

    it("returns questions with a non-empty id field", () => {
      const questions = getQuestionsByCategory(category);
      for (const question of questions) {
        expect(question.id).toBeTruthy();
      }
    });

    it("returns questions with a non-empty text field", () => {
      const questions = getQuestionsByCategory(category);
      for (const question of questions) {
        expect(question.text).toBeTruthy();
      }
    });
  });

  it("returns unique question ids across all categories", () => {
    const allIds = ALL_CATEGORIES.flatMap((cat) =>
      getQuestionsByCategory(cat).map((q) => q.id)
    );
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
  });
});
