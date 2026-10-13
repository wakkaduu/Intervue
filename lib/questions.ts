// Question bank loader & Category taxonomy
// Requirements: 1.1, 2.1

import type { Category, Question } from "@/types/index";
import questionsData from "@/data/questions.json";

export interface CategoryGroup {
  id: string;
  name: string;
  icon: string;
  description: string;
  categories: Category[];
}

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: "tech",
    name: "Tech & Software Engineering",
    icon: "💻",
    description: "Backend, Frontend, Mobile, Full-Stack, Architecture, DevOps, Security, QA, and Site Reliability",
    categories: [
      "Software Engineer / Backend Developer (Data structures, algorithms, API design, database optimization)",
      "Frontend Engineer / UI Developer (Component lifecycle, state management, CSS layouts, web performance)",
      "Mobile App Developer - iOS / Android (App architecture, state management, memory management, offline storage)",
      "Full-Stack Engineer (End-to-end architecture, cross-stack integration, system trade-offs)",
      "Systems Architect / Principal Engineer (Scalability, high availability, microservices, distributed systems)",
      "DevOps / Infrastructure / SRE Engineer (CI/CD pipelines, container orchestration, terraform, incident response)",
      "Cybersecurity Analyst / Penetration Tester (Threat modeling, vulnerability assessment, incident handler scenarios)",
      "Quality Assurance (QA) / Test Automation Engineer (Test strategy, automated framework design, boundary case identification)",
      "Site Reliability / Field Service Engineer (On-site diagnostics, equipment troubleshooting, safety protocols)",
    ],
  },
  {
    id: "data",
    name: "Data, Analytics & AI",
    icon: "🤖",
    description: "Data pipelines, machine learning, statistical inference, and business intelligence",
    categories: [
      "Data Engineer (ETL pipelines, data warehousing, query performance tuning, data modeling)",
      "Data Scientist / Machine Learning Engineer (Model evaluation, feature engineering, statistical inference, live coding)",
      "Business Analyst / BI Developer (SQL proficiency, dashboard design, stakeholder requirement gathering)",
    ],
  },
  {
    id: "product",
    name: "Product, Design & Agile",
    icon: "🚀",
    description: "Product vision, agile execution, and user experience research & design systems",
    categories: [
      "Product Manager (Product vision, metric prioritization, UI/UX critique, feature trade-offs)",
      "Technical Program Manager / Scrum Master (Agile processes, cross-functional alignment, timeline risk management)",
      "UX/UI Designer & Researcher (Design portfolio review, user testing methodology, design system implementation)",
    ],
  },
  {
    id: "business",
    name: "Strategy, Finance & Leadership",
    icon: "📈",
    description: "Management consulting cases, investment banking, financial analysis, corporate ops, and C-Suite",
    categories: [
      "Management Consultant (Market entry cases, profitability analysis, framework selection, brain teasers)",
      "Investment Banking Analyst / Associate (DCF valuation, financial statement modeling, M&A mechanics)",
      "Financial Analyst / Accountant (Budget forecasting, variance analysis, compliance regulations)",
      "Corporate Strategy / Operations Manager (Supply chain optimization, unit economics, process mapping)",
      "Executive / C-Suite Leadership - CEO/CTO/CFO (Vision alignment, board management, capital allocation strategies)",
    ],
  },
  {
    id: "sales",
    name: "Sales, Marketing & Comms",
    icon: "🎯",
    description: "Enterprise sales, cold outreach, growth marketing, copywriting, and PR crisis communication",
    categories: [
      "Enterprise Account Executive (B2B sales strategy, objection handling, live deal closing roleplay)",
      "Business Development Representative (BDR/SDR) (Live cold calling, lead qualification, value proposition delivery)",
      "Digital Marketing Specialist / Growth Marketer (Customer acquisition cost optimization, A/B test design, campaign ROI)",
      "Content Strategist / Copywriter (Brand voice alignment, content distribution strategy, copywriting exercise)",
      "PR & Communications Manager (Crisis management roleplays, media statement drafting, brand reputation)",
    ],
  },
  {
    id: "people",
    name: "People, Support & Psychology",
    icon: "👥",
    description: "HRBP, talent acquisition, customer success, technical helpdesk, clinical and I/O psychology",
    categories: [
      "Human Resources Business Partner (HRBP) (Employee relations, performance management, conflict mediation)",
      "Technical Recruiter / Talent Acquisition Specialist (Sourcing strategy, candidate assessment, hiring manager alignment)",
      "Customer Success Manager / Account Manager (Client retention strategies, upsell positioning, de-escalation roleplays)",
      "Customer Support / Helpdesk Specialist (Live troubleshooting, empathy checks, ticketing workflow execution)",
      "Clinical Psychologist / Staff Therapist (Case conceptualization, ethical dilemmas, risk assessment)",
      "Industrial-Organizational Psychologist (Selection tool validation, change management, organizational assessment)",
    ],
  },
  {
    id: "general",
    name: "General & Foundational",
    icon: "💼",
    description: "Core behavioral, cultural fit, situational, and vocal communication interviews",
    categories: [
      "Behavioral",
      "Cultural Fit",
      "Situational",
      "Communication & Presence",
    ],
  },
  {
    id: "healthcare",
    name: "Medicine & Healthcare",
    icon: "🩺",
    description: "Admissions, multiple mini interviews, and medical residency matching",
    categories: [
      "Medical & Health Sciences Programs (MBBS, MD, Nursing, Dentistry)",
      "Multiple Mini Interviews (MMI)",
      "Medical Residency & Fellowship Matching",
    ],
  },
  {
    id: "academic",
    name: "Admissions & Academia",
    icon: "🎓",
    description: "Law, MBA, PhD defenses, Oxbridge/Ivy League, scholarships, and study abroad",
    categories: [
      "Law Degree Programs (Juris Doctor, LLB)",
      "MBA & Graduate Business School Admissions",
      "PhD & Master’s Thesis/Research Proposal Defenses",
      "Undergraduate Competitive University Programs (Oxbridge, Ivy League)",
      "Academic Scholarship & Grant Applications",
      "Study Abroad & Student Exchange Programs",
    ],
  },
  {
    id: "public",
    name: "Government, Defense & Public Service",
    icon: "🏛️",
    description: "Civil service, military selection boards, law enforcement, and visa clearances",
    categories: [
      "Visa & Immigration Clearances (Student, Work, Permanent Residency)",
      "Civil Service & Government Agency Appointments",
      "Military & Defense Officer Selection Boards",
      "Law Enforcement & Emergency Services Screening",
    ],
  },
  {
    id: "competitions",
    name: "Competitions, Media & Pitch",
    icon: "🏆",
    description: "Startup accelerators (YC), debate tournaments, pageants, and broadcast media",
    categories: [
      "Startup Pitch Competitions & Accelerator Entry (e.g., Y Combinator)",
      "Competitive Debate & Model UN Selection",
      "Beauty & Personality Pageants",
      "Media, Journalism & Broadcast Screen Tests",
    ],
  },
];

export const CATEGORIES: Category[] = CATEGORY_GROUPS.flatMap((group) => group.categories);

const CATEGORY_ICONS: Record<Category, string> = {
  // Foundational / General
  "Behavioral": "🎯",
  "Cultural Fit": "🤝",
  "Situational": "⚡",
  "Communication & Presence": "🗣️",
  // Tech & Software Engineering
  "Software Engineer / Backend Developer (Data structures, algorithms, API design, database optimization)": "💻",
  "Frontend Engineer / UI Developer (Component lifecycle, state management, CSS layouts, web performance)": "🎨",
  "Mobile App Developer - iOS / Android (App architecture, state management, memory management, offline storage)": "📱",
  "Full-Stack Engineer (End-to-end architecture, cross-stack integration, system trade-offs)": "🌐",
  "Systems Architect / Principal Engineer (Scalability, high availability, microservices, distributed systems)": "🏗️",
  "DevOps / Infrastructure / SRE Engineer (CI/CD pipelines, container orchestration, terraform, incident response)": "⚙️",
  "Cybersecurity Analyst / Penetration Tester (Threat modeling, vulnerability assessment, incident handler scenarios)": "🛡️",
  "Quality Assurance (QA) / Test Automation Engineer (Test strategy, automated framework design, boundary case identification)": "🧪",
  "Site Reliability / Field Service Engineer (On-site diagnostics, equipment troubleshooting, safety protocols)": "🔧",
  // Data, Analytics & AI
  "Data Engineer (ETL pipelines, data warehousing, query performance tuning, data modeling)": "🗄️",
  "Data Scientist / Machine Learning Engineer (Model evaluation, feature engineering, statistical inference, live coding)": "🤖",
  "Business Analyst / BI Developer (SQL proficiency, dashboard design, stakeholder requirement gathering)": "📉",
  // Product, Design & Agile
  "Product Manager (Product vision, metric prioritization, UI/UX critique, feature trade-offs)": "🚀",
  "Technical Program Manager / Scrum Master (Agile processes, cross-functional alignment, timeline risk management)": "⏱️",
  "UX/UI Designer & Researcher (Design portfolio review, user testing methodology, design system implementation)": "✏️",
  // Business, Finance & Executive Strategy
  "Management Consultant (Market entry cases, profitability analysis, framework selection, brain teasers)": "💼",
  "Investment Banking Analyst / Associate (DCF valuation, financial statement modeling, M&A mechanics)": "📈",
  "Financial Analyst / Accountant (Budget forecasting, variance analysis, compliance regulations)": "📊",
  "Corporate Strategy / Operations Manager (Supply chain optimization, unit economics, process mapping)": "♟️",
  "Executive / C-Suite Leadership - CEO/CTO/CFO (Vision alignment, board management, capital allocation strategies)": "👑",
  // Sales, Marketing & Comms
  "Enterprise Account Executive (B2B sales strategy, objection handling, live deal closing roleplay)": "👔",
  "Business Development Representative (BDR/SDR) (Live cold calling, lead qualification, value proposition delivery)": "📞",
  "Digital Marketing Specialist / Growth Marketer (Customer acquisition cost optimization, A/B test design, campaign ROI)": "📣",
  "Content Strategist / Copywriter (Brand voice alignment, content distribution strategy, copywriting exercise)": "✍️",
  "PR & Communications Manager (Crisis management roleplays, media statement drafting, brand reputation)": "🎙️",
  // People, Support & Psychology
  "Human Resources Business Partner (HRBP) (Employee relations, performance management, conflict mediation)": "👥",
  "Technical Recruiter / Talent Acquisition Specialist (Sourcing strategy, candidate assessment, hiring manager alignment)": "🔍",
  "Customer Success Manager / Account Manager (Client retention strategies, upsell positioning, de-escalation roleplays)": "🤝",
  "Customer Support / Helpdesk Specialist (Live troubleshooting, empathy checks, ticketing workflow execution)": "🎧",
  "Clinical Psychologist / Staff Therapist (Case conceptualization, ethical dilemmas, risk assessment)": "🧠",
  "Industrial-Organizational Psychologist (Selection tool validation, change management, organizational assessment)": "🏢",
  // Medicine & Healthcare
  "Medical & Health Sciences Programs (MBBS, MD, Nursing, Dentistry)": "🩺",
  "Multiple Mini Interviews (MMI)": "🏥",
  "Medical Residency & Fellowship Matching": "👨‍⚕️",
  // Admissions & Academia
  "Law Degree Programs (Juris Doctor, LLB)": "⚖️",
  "MBA & Graduate Business School Admissions": "🎓",
  "PhD & Master’s Thesis/Research Proposal Defenses": "🔬",
  "Undergraduate Competitive University Programs (Oxbridge, Ivy League)": "🏛️",
  "Academic Scholarship & Grant Applications": "📜",
  "Study Abroad & Student Exchange Programs": "✈️",
  // Government, Defense & Public Service
  "Visa & Immigration Clearances (Student, Work, Permanent Residency)": "🛂",
  "Civil Service & Government Agency Appointments": "🏛️",
  "Military & Defense Officer Selection Boards": "🎖️",
  "Law Enforcement & Emergency Services Screening": "🚓",
  // Competitions, Media & Pitch
  "Startup Pitch Competitions & Accelerator Entry (e.g., Y Combinator)": "💡",
  "Competitive Debate & Model UN Selection": "🗣️",
  "Beauty & Personality Pageants": "✨",
  "Media, Journalism & Broadcast Screen Tests": "🎥",
};

/**
 * Returns an emoji icon for the given category.
 */
export function getCategoryIcon(category: Category): string {
  return CATEGORY_ICONS[category] || "📋";
}

/**
 * Returns all questions for the given category.
 */
export function getQuestionsByCategory(category: Category): Question[] {
  const questions = (questionsData as Record<string, Question[]>)[category];
  return questions ?? [];
}

/**
 * Returns all 52 category values in the canonical order.
 */
export function getCategories(): Category[] {
  return CATEGORIES;
}

