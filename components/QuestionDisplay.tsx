"use client";

import type { Question } from "@/types";
import { getCategoryIcon } from "@/lib/questions";

interface QuestionDisplayProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
}

export default function QuestionDisplay({
  question,
  questionNumber,
  totalQuestions,
}: QuestionDisplayProps) {
  const icon = getCategoryIcon(question.category);

  return (
    <div className="w-full space-y-4">
      {/* Top Meta: Question tracker + Category Tag */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <span
          className="inline-flex items-center gap-1.5 rounded-full bg-forest-50 px-3 py-1 text-xs font-bold text-forest-800 border border-forest-200/80"
          aria-label={`Question ${questionNumber} of ${totalQuestions}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-forest-700 animate-pulse" />
          <span>
            Question {questionNumber} <span className="text-forest-400">/</span> {totalQuestions}
          </span>
        </span>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-100 px-3 py-1 text-xs font-medium text-darkslate-700 border border-sage-200/80">
          <span aria-hidden="true">{icon}</span>
          <span>{question.category}</span>
        </span>
      </div>

      {/* Main Question Text */}
      <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-forest-950 leading-snug">
        {question.text}
      </h2>

      {/* Strategic Interview Tip Banner (10% Warm Gold Accent) */}
      <div className="flex items-start gap-2.5 rounded-xl bg-gold-50/90 border border-gold-200/80 p-3.5 text-xs text-gold-950">
        <svg className="w-4 h-4 text-gold-800 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="leading-relaxed">
          <strong className="text-gold-900 font-bold">Guidance:</strong> Lead with your core takeaway, ground your reasoning with a real-world scenario, and emphasize the measurable outcome.
        </p>
      </div>
    </div>
  );
}

