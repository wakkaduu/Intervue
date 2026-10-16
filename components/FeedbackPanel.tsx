"use client";

import { Feedback, Question } from "@/types";
import Button from "@/components/ui/Button";

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
      {feedback.source === "basic" && (
        <p
          role="note"
          className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-950"
        >
          Basic feedback: the AI evaluator was unavailable, so this review uses a built-in
          keyword-based grader. Try again later for a full AI review.
        </p>
      )}
      {/* ── 1. Score — Req 6.1: first element, font size ≥1.5× body (text-3xl = 1.875rem vs 1rem body) ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h3
            className="text-3xl font-bold text-forest-800"
            aria-label={`Score: ${score} out of 10`}
          >
            {score}
            <span className="text-xl font-medium text-darkslate-400">/10</span>
          </h3>
          <span className="text-sm font-medium text-darkslate-500">Evaluation Score</span>
        </div>

        {/* Candid Hiring Bar Verdict Badge */}
        <div
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${
            score >= 8
              ? "bg-emerald-50 text-emerald-950 border-emerald-300"
              : score >= 6
              ? "bg-amber-50 text-amber-950 border-amber-300"
              : score >= 4
              ? "bg-rose-50 text-rose-950 border-rose-300"
              : "bg-rose-100 text-rose-950 border-rose-300"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              score >= 8
                ? "bg-emerald-600"
                : score >= 6
                ? "bg-amber-600"
                : "bg-rose-600"
            }`}
          />
          <span>
            {score >= 8
              ? "Strong Hire — Meets Bar"
              : score >= 6
              ? "Borderline — Refinement Needed"
              : score >= 4
              ? "Below Hiring Bar — Substandard"
              : "Strong No Hire — Critical Gaps"}
          </span>
        </div>
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
                <svg className="h-4 w-4 text-forest-750 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h4 className="text-sm font-semibold text-forest-800">Structure & Depth</h4>
              </div>
              <p className="text-xs text-darkslate-800 leading-relaxed">{feedback.howTheyAnswered}</p>
            </div>
          )}

          {feedback.toneAnalysis && (
            <div className="rounded-xl border border-forest-200 bg-forest-50/70 p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <svg className="h-4 w-4 text-forest-750 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <h4 className="text-sm font-semibold text-forest-800">Tone & Delivery</h4>
              </div>
              <p className="text-xs text-darkslate-800 leading-relaxed">{feedback.toneAnalysis}</p>
            </div>
          )}

          {feedback.questionConnection && (
            <div className="rounded-xl border border-gold-200 bg-gold-50/70 p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <svg className="h-4 w-4 text-gold-800 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="9" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v10M7 12h10" />
                </svg>
                <h4 className="text-sm font-semibold text-gold-800">Question Connection</h4>
              </div>
              <p className="text-xs text-darkslate-800 leading-relaxed">{feedback.questionConnection}</p>
            </div>
          )}
        </div>
      )}

      {/* ── 6. Summary — Req 6.4 ── */}
      <div className="rounded-xl bg-forest-800 text-white p-4">
        <h4 className="text-sm font-semibold text-gold-300 mb-1 flex items-center gap-1.5">
          <svg className="h-4 w-4 text-gold-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span>Evaluation Summary</span>
        </h4>
        <p className="text-sm text-sage-100 leading-relaxed">{summary}</p>
      </div>

      {/* ── 7. Navigation controls — Req 6.6, 8.3 ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" size="md" onClick={onEndSession} aria-label="End session and view summary">
          End session
        </Button>
        <Button variant="primary" size="md" onClick={onNext} aria-label="Proceed to next question">
          Next question
        </Button>
      </div>
    </div>
  );
}
