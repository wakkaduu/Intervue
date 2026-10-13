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
    id: "general",
    name: "General & Foundational",
    icon: "💼",
    description: "Core behavioral, situational, and culture interviews for all industries",
    categories: [
      "Behavioral",
      "Technical",
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
    id: "tech",
    name: "Tech & Engineering",
    icon: "💻",
    description: "Software engineering, data science, machine learning, cloud, and security",
    categories: [
      "Software Engineering Roles (Algorithmic, System Design, Whiteboard)",
      "Data Science & Machine Learning Positions",
      "DevOps, Cloud & Cybersecurity Engineering",
      "Product Management Roles",
    ],
  },
  {
    id: "business",
    name: "Business, Finance & Sales",
    icon: "📈",
    description: "Management consulting cases, investment banking, enterprise sales, and HR",
    categories: [
      "Management Consulting (Case Interviews)",
      "Investment Banking & Financial Analyst Positions",
      "Sales & Business Development Positions",
      "Human Resources & Talent Acquisition Roles",
      "Customer Support & Success Management",
      "Executive & C-Suite Leadership Positions",
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

const CATEGORIES: Category[] = CATEGORY_GROUPS.flatMap((group) => group.categories);

const CATEGORY_ICONS: Record<Category, string> = {
  "Behavioral": "🎯",
  "Technical": "⚙️",
  "Cultural Fit": "🤝",
  "Situational": "⚡",
  "Communication & Presence": "🗣️",
  "Medical & Health Sciences Programs (MBBS, MD, Nursing, Dentistry)": "🩺",
  "Multiple Mini Interviews (MMI)": "🏥",
  "Law Degree Programs (Juris Doctor, LLB)": "⚖️",
  "MBA & Graduate Business School Admissions": "📊",
  "PhD & Master’s Thesis/Research Proposal Defenses": "🔬",
  "Undergraduate Competitive University Programs (Oxbridge, Ivy League)": "🏛️",
  "Academic Scholarship & Grant Applications": "📜",
  "Study Abroad & Student Exchange Programs": "✈️",
  "Medical Residency & Fellowship Matching": "👨‍⚕️",
  "Software Engineering Roles (Algorithmic, System Design, Whiteboard)": "💻",
  "Data Science & Machine Learning Positions": "🤖",
  "DevOps, Cloud & Cybersecurity Engineering": "🛡️",
  "Management Consulting (Case Interviews)": "💼",
  "Investment Banking & Financial Analyst Positions": "📈",
  "Product Management Roles": "🚀",
  "Sales & Business Development Positions": "🤝",
  "Human Resources & Talent Acquisition Roles": "👥",
  "Customer Support & Success Management": "🎧",
  "Executive & C-Suite Leadership Positions": "👑",
  "Visa & Immigration Clearances (Student, Work, Permanent Residency)": "🛂",
  "Civil Service & Government Agency Appointments": "🏛️",
  "Military & Defense Officer Selection Boards": "🎖️",
  "Law Enforcement & Emergency Services Screening": "🚓",
  "Beauty & Personality Pageants": "👑",
  "Competitive Debate & Model UN Selection": "🎙️",
  "Startup Pitch Competitions & Accelerator Entry (e.g., Y Combinator)": "💡",
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
 * Returns all 32 category values in the canonical order.
 */
export function getCategories(): Category[] {
  return CATEGORIES;
}
