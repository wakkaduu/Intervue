// Question bank loader
// Requirements: 1.1, 2.1

import type { Category, Question } from "@/types/index";
import questionsData from "@/data/questions.json";

const CATEGORIES: Category[] = [
  "Behavioral",
  "Technical",
  "Cultural Fit",
  "Situational",
  "Communication & Presence",
];

/**
 * Returns all questions for the given category.
 */
export function getQuestionsByCategory(category: Category): Question[] {
  const questions = (questionsData as Record<string, Question[]>)[category];
  return questions ?? [];
}

/**
 * Returns all five category values in the canonical order.
 */
export function getCategories(): Category[] {
  return CATEGORIES;
}
