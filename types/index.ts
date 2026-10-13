// Shared TypeScript types for the Mock Interview Helper
// Requirements: 1.1, 5.1, 5.2, 7.1

export type Category =
  | "Behavioral"
  | "Technical"
  | "Cultural Fit"
  | "Situational"
  | "Communication & Presence";

export interface Question {
  id: string;
  category: Category;
  text: string;
}

export type AnswerMode = "mic" | "typed";

export interface Feedback {
  score: number; // 1–10
  strengths: string[]; // 1–5 items
  areasForImprovement: string[]; // 1–5 items
  summary: string; // ≤100 words
  howTheyAnswered?: string; // Evaluation of structure, clarity, and completeness
  toneAnalysis?: string; // Evaluation of tone, confidence, presence, and professionalism
  questionConnection?: string; // How well they addressed and connected their answer to the question
}

export interface SessionEntry {
  question: Question;
  answer: string;
  feedback: Feedback;
}

export interface Session {
  category: Category;
  entries: SessionEntry[];
  startedAt: string; // ISO 8601
}

// Request/response types for POST /api/review
export interface ReviewRequest {
  question: string;
  answer: string;
  category: Category;
  mode?: AnswerMode;
}

export interface ReviewResponse {
  feedback: Feedback;
}

export interface ReviewErrorResponse {
  error: string;
}
