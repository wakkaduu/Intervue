"use client";

import { Feedback, Question } from "@/types";

interface FeedbackPanelProps {
  question: Question;
  answer: string;
  feedback: Feedback;
  onNext: () => void;
  onEndSession: () => void;
}

/**
 * FeedbackPanel — displays AI-generated feedback for a completed answer.
 *
 * Layout order (Req 6.1, 6.2, 6.3, 6.4):
 *   1. Score (rendered first, at ≥1.5× body font size)
 *   2. Question text
 *   3. Answer text
 *   4. Strengths list (labeled)
 *   5. Areas for improvement list (labeled)
 *   6. Summary paragraph
 *   7. Navigation controls (Next Question / End Session)
 *
 * Accessibility (Req 8.3):
 *   - All interactive controls have visible labels.
 *   - Lists use semantic <ul> elements with visible headings.
 *   - Empty lists display "None identified" rather than being omitted (Req 6.5).
 */
export default function FeedbackPanel({
  question,
  answer,
  feedback,
  onNext,
  onEndSession,
}: FeedbackPanelProps) {
  const { score, strengths, areasForImprovement, summary } = feedback;

  return (
    <div className="w-full space-y-6">
      {/* ── 1. Score — Req 6.1: first element, font size ≥1.5× body (text-3xl = 1.875rem vs 1rem body) ── */}
      <div className="flex items-center gap-3">
        <h3
          className="text-3xl font-bold text-indigo-700"
          aria-label={`Score: ${score} out of 10`}
        >
          {score}
          <span className="text-xl font-medium text-gray-500">/10</span>
        </h3>
        <span className="text-sm font-medium text-gray-500">Score</span>
      </div>

      {/* ── 2 & 3. Question and Answer — Req 6.2 ── */}
      <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
            Question
          </p>
          <p className="text-gray-900 font-medium">{question.text}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
            Your Answer
          </p>
          <p className="text-gray-700 whitespace-pre-wrap">{answer}</p>
        </div>
      </div>

      {/* ── 4 & 5. Strengths and Areas for Improvement — Req 6.3, 6.5 ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Strengths */}
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <h4 className="text-sm font-semibold text-green-800 mb-2">
            Strengths
          </h4>
          {strengths.length > 0 ? (
            <ul className="list-disc list-inside space-y-1">
              {strengths.map((item, index) => (
                <li key={index} className="text-sm text-green-900">
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-green-700 italic">None identified</p>
          )}
        </div>

        {/* Areas for Improvement */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h4 className="text-sm font-semibold text-amber-800 mb-2">
            Areas for Improvement
          </h4>
          {areasForImprovement.length > 0 ? (
            <ul className="list-disc list-inside space-y-1">
              {areasForImprovement.map((item, index) => (
                <li key={index} className="text-sm text-amber-900">
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-amber-700 italic">None identified</p>
          )}
        </div>
      </div>

      {/* ── Core Dimensions: How You Answered, Tone & Delivery, Question Connection ── */}
      {(feedback.howTheyAnswered || feedback.toneAnalysis || feedback.questionConnection) && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {feedback.howTheyAnswered && (
            <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-base" aria-hidden="true">📋</span>
                <h4 className="text-sm font-semibold text-blue-900">How You Answered</h4>
              </div>
              <p className="text-xs text-blue-950 leading-relaxed">{feedback.howTheyAnswered}</p>
            </div>
          )}

          {feedback.toneAnalysis && (
            <div className="rounded-lg border border-purple-200 bg-purple-50/60 p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-base" aria-hidden="true">🎙️</span>
                <h4 className="text-sm font-semibold text-purple-900">Tone & Delivery</h4>
              </div>
              <p className="text-xs text-purple-950 leading-relaxed">{feedback.toneAnalysis}</p>
            </div>
          )}

          {feedback.questionConnection && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-base" aria-hidden="true">🎯</span>
                <h4 className="text-sm font-semibold text-emerald-900">Question Connection</h4>
              </div>
              <p className="text-xs text-emerald-950 leading-relaxed">{feedback.questionConnection}</p>
            </div>
          )}
        </div>
      )}

      {/* ── 6. Summary — Req 6.4 ── */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-1">Summary</h4>
        <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
      </div>

      {/* ── 7. Navigation controls — Req 6.6, 8.3 ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onEndSession}
          aria-label="End session and view summary"
          className="rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold
                     text-gray-700 hover:bg-gray-50
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400
                     focus-visible:ring-offset-2"
        >
          End Session
        </button>
        <button
          type="button"
          onClick={onNext}
          aria-label="Proceed to next question"
          className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white
                     hover:bg-indigo-700
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600
                     focus-visible:ring-offset-2"
        >
          Next Question
        </button>
      </div>
    </div>
  );
}
