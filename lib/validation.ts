// Input validation helpers for Intervue
// Requirements: 1.4, 5.8

import type { Category, Feedback, ReviewRequest } from "@/types/index";
import { CATEGORIES } from "@/lib/questions";

const VALID_CATEGORIES: Category[] = CATEGORIES;

/**
 * Validates that an answer is non-empty and not whitespace-only.
 * Returns an error string if invalid, null if valid.
 * Requirements: 5.8
 */
export function validateAnswer(answer: string): string | null {
  if (answer.trim().length === 0) {
    return "Please record or type an answer before submitting.";
  }
  return null;
}

/**
 * Type guard that checks whether an unknown value is a valid Category.
 * Requirements: 1.4
 */
export function validateCategory(category: unknown): category is Category {
  return (
    typeof category === "string" &&
    (VALID_CATEGORIES as string[]).includes(category)
  );
}

/**
 * Validates and parses a raw request body as a ReviewRequest.
 * Throws a descriptive Error if any field is missing or invalid.
 * Returns a typed ReviewRequest on success.
 * Requirements: 5.1, 5.8
 */
export function validateReviewRequest(body: unknown): ReviewRequest {
  if (body === null || typeof body !== "object") {
    throw new Error("Request body must be a JSON object.");
  }

  const obj = body as Record<string, unknown>;

  if (typeof obj.question !== "string" || obj.question.trim().length === 0) {
    throw new Error("Field 'question' must be a non-empty string.");
  }

  if (typeof obj.answer !== "string" || obj.answer.trim().length === 0) {
    throw new Error("Field 'answer' must be a non-empty string.");
  }

  if (!validateCategory(obj.category)) {
    throw new Error(
      `Field 'category' must be one of: ${VALID_CATEGORIES.join(", ")}.`
    );
  }

  const mode =
    obj.mode === "mic" || obj.mode === "typed"
      ? (obj.mode as "mic" | "typed")
      : undefined;

  return {
    question: obj.question,
    answer: obj.answer,
    category: obj.category,
    ...(mode ? { mode } : {}),
  };
}

/**
 * Validates and parses an unknown value as a Feedback object.
 * Throws a descriptive Error if any constraint is violated:
 *   - score must be an integer in [1, 10]
 *   - strengths must be an array of 1–5 non-empty strings
 *   - areasForImprovement must be an array of 1–5 non-empty strings
 *   - summary must be a string whose word count does not exceed 100
 * Returns a typed Feedback on success.
 * Requirements: 5.2
 */
export function validateFeedback(obj: unknown): Feedback {
  if (obj === null || typeof obj !== "object") {
    throw new Error("Feedback must be a JSON object.");
  }

  const raw = obj as Record<string, unknown>;

  // Validate score
  if (
    typeof raw.score !== "number" ||
    !Number.isInteger(raw.score) ||
    raw.score < 1 ||
    raw.score > 10
  ) {
    throw new Error("Feedback 'score' must be an integer between 1 and 10.");
  }

  // Validate strengths
  if (!Array.isArray(raw.strengths)) {
    throw new Error("Feedback 'strengths' must be an array.");
  }
  if (raw.strengths.length < 1 || raw.strengths.length > 5) {
    throw new Error(
      "Feedback 'strengths' must contain between 1 and 5 items."
    );
  }
  if (!raw.strengths.every((s) => typeof s === "string")) {
    throw new Error("Each item in 'strengths' must be a string.");
  }

  // Validate areasForImprovement
  if (!Array.isArray(raw.areasForImprovement)) {
    throw new Error("Feedback 'areasForImprovement' must be an array.");
  }
  if (
    raw.areasForImprovement.length < 1 ||
    raw.areasForImprovement.length > 5
  ) {
    throw new Error(
      "Feedback 'areasForImprovement' must contain between 1 and 5 items."
    );
  }
  if (!raw.areasForImprovement.every((s) => typeof s === "string")) {
    throw new Error("Each item in 'areasForImprovement' must be a string.");
  }

  // Validate summary word count
  if (typeof raw.summary !== "string") {
    throw new Error("Feedback 'summary' must be a string.");
  }
  const wordCount = raw.summary.trim() === "" ? 0 : raw.summary.trim().split(/\s+/).length;
  if (wordCount > 100) {
    throw new Error(
      `Feedback 'summary' must not exceed 100 words (got ${wordCount}).`
    );
  }

  const feedback: Feedback = {
    score: raw.score,
    strengths: raw.strengths as string[],
    areasForImprovement: raw.areasForImprovement as string[],
    summary: raw.summary,
  };

  if (typeof raw.howTheyAnswered === "string") {
    feedback.howTheyAnswered = raw.howTheyAnswered;
  }
  if (typeof raw.toneAnalysis === "string") {
    feedback.toneAnalysis = raw.toneAnalysis;
  }
  if (typeof raw.questionConnection === "string") {
    feedback.questionConnection = raw.questionConnection;
  }

  return feedback;
}
