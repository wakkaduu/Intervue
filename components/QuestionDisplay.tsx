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
          className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 border border-indigo-200/80"
          aria-label={`Question ${questionNumber} of ${totalQuestions}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
          <span>
            Question {questionNumber} <span className="text-indigo-400">/</span> {totalQuestions}
          </span>
        </span>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 border border-slate-200/80">
          <span aria-hidden="true">{icon}</span>
          <span>{question.category}</span>
        </span>
      </div>

      {/* Main Question Text */}
      <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 leading-snug">
        {question.text}
      </h2>

      {/* Strategic Interview Tip Banner */}
      <div className="flex items-start gap-2.5 rounded-xl bg-slate-50/90 border border-slate-200/70 p-3.5 text-xs text-slate-600">
        <span className="text-base flex-shrink-0" aria-hidden="true">💡</span>
        <p className="leading-relaxed">
          <strong className="text-slate-800 font-semibold">Coach Tip:</strong> Lead with your core takeaway, ground your reasoning with a real-world scenario, and emphasize the measurable outcome.
        </p>
      </div>
    </div>
  );
}

