// Shared TypeScript types for Intervue
// Requirements: 1.1, 5.1, 5.2, 7.1

export type Category =
  // Foundational / General
  | "Behavioral"
  | "Cultural Fit"
  | "Situational"
  | "Communication & Presence"
  // Tech & Software Engineering
  | "Software Engineer / Backend Developer (Data structures, algorithms, API design, database optimization)"
  | "Frontend Engineer / UI Developer (Component lifecycle, state management, CSS layouts, web performance)"
  | "Mobile App Developer - iOS / Android (App architecture, state management, memory management, offline storage)"
  | "Full-Stack Engineer (End-to-end architecture, cross-stack integration, system trade-offs)"
  | "Systems Architect / Principal Engineer (Scalability, high availability, microservices, distributed systems)"
  | "DevOps / Infrastructure / SRE Engineer (CI/CD pipelines, container orchestration, terraform, incident response)"
  | "Cybersecurity Analyst / Penetration Tester (Threat modeling, vulnerability assessment, incident handler scenarios)"
  | "Quality Assurance (QA) / Test Automation Engineer (Test strategy, automated framework design, boundary case identification)"
  | "Site Reliability / Field Service Engineer (On-site diagnostics, equipment troubleshooting, safety protocols)"
  // Data, Analytics & AI
  | "Data Engineer (ETL pipelines, data warehousing, query performance tuning, data modeling)"
  | "Data Scientist / Machine Learning Engineer (Model evaluation, feature engineering, statistical inference, live coding)"
  | "Business Analyst / BI Developer (SQL proficiency, dashboard design, stakeholder requirement gathering)"
  // Product, Design & Agile
  | "Product Manager (Product vision, metric prioritization, UI/UX critique, feature trade-offs)"
  | "Technical Program Manager / Scrum Master (Agile processes, cross-functional alignment, timeline risk management)"
  | "UX/UI Designer & Researcher (Design portfolio review, user testing methodology, design system implementation)"
  // Business, Finance & Executive Strategy
  | "Management Consultant (Market entry cases, profitability analysis, framework selection, brain teasers)"
  | "Investment Banking Analyst / Associate (DCF valuation, financial statement modeling, M&A mechanics)"
  | "Financial Analyst / Accountant (Budget forecasting, variance analysis, compliance regulations)"
  | "Corporate Strategy / Operations Manager (Supply chain optimization, unit economics, process mapping)"
  | "Executive / C-Suite Leadership - CEO/CTO/CFO (Vision alignment, board management, capital allocation strategies)"
  // Sales, Marketing & Comms
  | "Enterprise Account Executive (B2B sales strategy, objection handling, live deal closing roleplay)"
  | "Business Development Representative (BDR/SDR) (Live cold calling, lead qualification, value proposition delivery)"
  | "Digital Marketing Specialist / Growth Marketer (Customer acquisition cost optimization, A/B test design, campaign ROI)"
  | "Content Strategist / Copywriter (Brand voice alignment, content distribution strategy, copywriting exercise)"
  | "PR & Communications Manager (Crisis management roleplays, media statement drafting, brand reputation)"
  // People, Support & Psychology
  | "Human Resources Business Partner (HRBP) (Employee relations, performance management, conflict mediation)"
  | "Technical Recruiter / Talent Acquisition Specialist (Sourcing strategy, candidate assessment, hiring manager alignment)"
  | "Customer Success Manager / Account Manager (Client retention strategies, upsell positioning, de-escalation roleplays)"
  | "Customer Support / Helpdesk Specialist (Live troubleshooting, empathy checks, ticketing workflow execution)"
  | "Clinical Psychologist / Staff Therapist (Case conceptualization, ethical dilemmas, risk assessment)"
  | "Industrial-Organizational Psychologist (Selection tool validation, change management, organizational assessment)"
  // Medicine & Healthcare
  | "Medical & Health Sciences Programs (MBBS, MD, Nursing, Dentistry)"
  | "Multiple Mini Interviews (MMI)"
  | "Medical Residency & Fellowship Matching"
  // Admissions & Academia
  | "Law Degree Programs (Juris Doctor, LLB)"
  | "MBA & Graduate Business School Admissions"
  | "PhD & Master’s Thesis/Research Proposal Defenses"
  | "Undergraduate Competitive University Programs (Oxbridge, Ivy League)"
  | "Academic Scholarship & Grant Applications"
  | "Study Abroad & Student Exchange Programs"
  // Government, Defense & Public Service
  | "Visa & Immigration Clearances (Student, Work, Permanent Residency)"
  | "Civil Service & Government Agency Appointments"
  | "Military & Defense Officer Selection Boards"
  | "Law Enforcement & Emergency Services Screening"
  // Competitions, Media & Pitch
  | "Startup Pitch Competitions & Accelerator Entry (e.g., Y Combinator)"
  | "Competitive Debate & Model UN Selection"
  | "Beauty & Personality Pageants"
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
