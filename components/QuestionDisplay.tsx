"use client";

import { Question } from "@/types";

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
  return (
    <div className="w-full">
      {/* Progress indicator — Req 2.1, 2.2 */}
      <p
        className="text-sm font-medium text-gray-500 mb-3"
        aria-label={`Question ${questionNumber} of ${totalQuestions}`}
      >
        Question{" "}
        <span className="text-gray-800 font-semibold">{questionNumber}</span>
        {" / "}
        <span className="text-gray-800 font-semibold">{totalQuestions}</span>
      </p>

      {/* Question text — Req 2.1 */}
      <h2 className="text-xl font-semibold text-gray-900 leading-snug">
        {question.text}
      </h2>

      {/* Category badge */}
      <span className="inline-block mt-3 px-3 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700">
        {question.category}
      </span>
    </div>
  );
}
