"use client";

import type { Question } from "@/types";
import { getCategoryIcon } from "@/lib/questions";
import { shortCategory } from "@/lib/progress-trend";
import InterviewerVoiceControls from "@/components/InterviewerVoiceControls";

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
      {/* Category tag (the stepper above already shows progress) */}
      <div className="flex items-center justify-between gap-2.5">
        <span className="sr-only">
          Question {questionNumber} of {totalQuestions}
        </span>
        <span
          className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-sage-200/80 bg-sage-100 px-3 py-1 text-xs font-medium text-darkslate-700"
          title={question.category}
        >
          <span aria-hidden="true">{icon}</span>
          <span className="truncate">{shortCategory(question.category)}</span>
        </span>
      </div>

      {/* Main Question Text: the focal point of the screen */}
      <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-forest-950 leading-snug">
        {question.text}
      </h2>

      {/* Spoken AI Interviewer Voice Player & Quick Controls */}
      <InterviewerVoiceControls text={question.text} />

      {/* Optional hint, collapsed by default to keep the screen calm */}
      <details className="group rounded-xl border border-gold-200/80 bg-gold-50/90 text-xs text-gold-950">
        <summary className="flex min-h-[44px] cursor-pointer list-none items-center gap-2 px-3.5 py-2 font-bold text-gold-900 [&::-webkit-details-marker]:hidden">
          <svg className="h-4 w-4 flex-shrink-0 text-gold-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span>Need a hint?</span>
          <span className="ml-auto text-gold-700 transition-transform group-open:rotate-180" aria-hidden="true">▾</span>
        </summary>
        <p className="px-3.5 pb-3.5 leading-relaxed">
          Lead with your core takeaway, ground your reasoning with a real example, and finish on the
          measurable result.
        </p>
      </details>
    </div>
  );
}

