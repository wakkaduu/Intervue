// Shared TypeScript types for Intervue
// Requirements: 1.1, 5.1, 5.2, 7.1

export type Category =
  | "Behavioral"
  | "Technical"
  | "Cultural Fit"
  | "Situational"
  | "Communication & Presence"
  | "Medical & Health Sciences Programs (MBBS, MD, Nursing, Dentistry)"
  | "Multiple Mini Interviews (MMI)"
  | "Law Degree Programs (Juris Doctor, LLB)"
  | "MBA & Graduate Business School Admissions"
  | "PhD & Master’s Thesis/Research Proposal Defenses"
  | "Undergraduate Competitive University Programs (Oxbridge, Ivy League)"
  | "Academic Scholarship & Grant Applications"
  | "Study Abroad & Student Exchange Programs"
  | "Medical Residency & Fellowship Matching"
  | "Software Engineering Roles (Algorithmic, System Design, Whiteboard)"
  | "Data Science & Machine Learning Positions"
  | "DevOps, Cloud & Cybersecurity Engineering"
  | "Management Consulting (Case Interviews)"
  | "Investment Banking & Financial Analyst Positions"
  | "Product Management Roles"
  | "Sales & Business Development Positions"
  | "Human Resources & Talent Acquisition Roles"
  | "Customer Support & Success Management"
  | "Executive & C-Suite Leadership Positions"
  | "Visa & Immigration Clearances (Student, Work, Permanent Residency)"
  | "Civil Service & Government Agency Appointments"
  | "Military & Defense Officer Selection Boards"
  | "Law Enforcement & Emergency Services Screening"
  | "Beauty & Personality Pageants"
  | "Competitive Debate & Model UN Selection"
  | "Startup Pitch Competitions & Accelerator Entry (e.g., Y Combinator)"
  | "Media, Journalism & Broadcast Screen Tests";

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
