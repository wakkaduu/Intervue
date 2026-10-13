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
          className="text-3xl font-bold text-forest-800"
          aria-label={`Score: ${score} out of 10`}
        >
          {score}
          <span className="text-xl font-medium text-darkslate-400">/10</span>
        </h3>
        <span className="text-sm font-medium text-darkslate-500">Score</span>
      </div>

      {/* ── 2 & 3. Question and Answer — Req 6.2 ── */}
      <div className="space-y-3 rounded-xl border border-sage-200 bg-sage-50/70 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-darkslate-500 mb-1">
            Question
          </p>
          <p className="text-forest-950 font-medium">{question.text}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-darkslate-500 mb-1">
            Your Answer
          </p>
          <p className="text-darkslate-800 whitespace-pre-wrap">{answer}</p>
        </div>
      </div>

      {/* ── 4 & 5. Strengths and Areas for Improvement — Req 6.3, 6.5 ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Strengths */}
        <div className="rounded-xl border border-forest-200 bg-forest-50/60 p-4">
          <h4 className="text-sm font-semibold text-forest-800 mb-2">
            Strengths
          </h4>
          {strengths.length > 0 ? (
            <ul className="list-disc list-inside space-y-1">
              {strengths.map((item, index) => (
                <li key={index} className="text-sm text-forest-950">
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-darkslate-400 italic">None identified</p>
          )}
        </div>

        {/* Areas for Improvement */}
        <div className="rounded-xl border border-gold-200 bg-gold-50/60 p-4">
          <h4 className="text-sm font-semibold text-gold-900 mb-2">
            Areas for Improvement
          </h4>
          {areasForImprovement.length > 0 ? (
            <ul className="list-disc list-inside space-y-1">
              {areasForImprovement.map((item, index) => (
                <li key={index} className="text-sm text-gold-950">
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-darkslate-400 italic">None identified</p>
          )}
        </div>
      </div>

      {/* ── Core Dimensions: How You Answered, Tone & Delivery, Question Connection ── */}
      {(feedback.howTheyAnswered || feedback.toneAnalysis || feedback.questionConnection) && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {feedback.howTheyAnswered && (
            <div className="rounded-xl border border-sage-200 bg-sage-100/70 p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-base" aria-hidden="true">📋</span>
                <h4 className="text-sm font-semibold text-forest-800">Structure & Depth</h4>
              </div>
              <p className="text-xs text-darkslate-800 leading-relaxed">{feedback.howTheyAnswered}</p>
            </div>
          )}

          {feedback.toneAnalysis && (
            <div className="rounded-xl border border-forest-200 bg-forest-50/70 p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-base" aria-hidden="true">🎙️</span>
                <h4 className="text-sm font-semibold text-forest-800">Tone & Delivery</h4>
              </div>
              <p className="text-xs text-darkslate-800 leading-relaxed">{feedback.toneAnalysis}</p>
            </div>
          )}

          {feedback.questionConnection && (
            <div className="rounded-xl border border-gold-200 bg-gold-50/70 p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-base" aria-hidden="true">🎯</span>
                <h4 className="text-sm font-semibold text-gold-800">Question Connection</h4>
              </div>
              <p className="text-xs text-darkslate-800 leading-relaxed">{feedback.questionConnection}</p>
            </div>
          )}
        </div>
      )}

      {/* ── 6. Summary — Req 6.4 ── */}
      <div className="rounded-xl bg-forest-800 text-white p-4">
        <h4 className="text-sm font-semibold text-gold-300 mb-1">Intervue Coach Summary</h4>
        <p className="text-sm text-sage-100 leading-relaxed">{summary}</p>
      </div>

      {/* ── 7. Navigation controls — Req 6.6, 8.3 ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onEndSession}
          aria-label="End session and view summary"
          className="rounded-xl border border-sage-300 bg-[#F0F5F1] px-5 py-2.5 text-sm font-semibold
                     text-darkslate-700 hover:bg-[#D4E3D8]
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600
                     focus-visible:ring-offset-2 transition-colors"
        >
          End Session
        </button>
        <button
          type="button"
          onClick={onNext}
          aria-label="Proceed to next question"
          className="rounded-xl bg-forest-700 px-5 py-2.5 text-sm font-semibold text-white
                     hover:bg-forest-800
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600
                     focus-visible:ring-offset-2 shadow-forest-900/20"
        >
          Next Question
        </button>
      </div>
    </div>
  );
}
