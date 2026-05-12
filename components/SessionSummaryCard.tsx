"use client";

import type { SessionEntry } from "@/types";

interface SessionSummaryCardProps {
  /** The session entry containing question, answer, and feedback. */
  entry: SessionEntry;
  /** 1-based index of this entry in the session (used for display). */
  index: number;
}

/**
 * SessionSummaryCard — displays a single answered question's summary row.
 *
 * Renders: question text, answer text, score, strengths, areas-for-improvement,
 * and the overall summary for the given SessionEntry.
 *
 * Accessibility:
 *   - Uses semantic heading hierarchy (h3 for question, h4 for sub-sections)
 *   - Score is visually prominent (≥1.5× body font size) per Req 6.1
 *   - All sections have visible labels (Req 8.3)
 *   - Sufficient color contrast throughout (Req 8.2)
 *
 * Requirements: 7.1
 */
export default function SessionSummaryCard({ entry, index }: SessionSummaryCardProps) {
  const { question, answer, feedback } = entry;
  const { score, strengths, areasForImprovement, summary } = feedback;

  /** Derive a color class for the score badge based on its value. */
  const scoreBadgeClass =
    score >= 8
      ? "bg-green-100 text-green-800 ring-green-200"
      : score >= 5
      ? "bg-yellow-100 text-yellow-800 ring-yellow-200"
      : "bg-red-100 text-red-800 ring-red-200";

  return (
    <article
      aria-label={`Question ${index} summary`}
      className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
    >
      {/* ── Header: question number + score ── */}
      <div className="flex items-start justify-between gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
            Question {index}
          </p>
          <h3 className="text-base font-semibold text-gray-900 leading-snug">
            {question.text}
          </h3>
          {/* Category badge */}
          <span className="inline-block mt-2 px-2.5 py-0.5 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700">
            {question.category}
          </span>
        </div>

        {/* Score badge — rendered at ≥1.5× body font size per Req 6.1 */}
        <div
          className={`flex-shrink-0 flex flex-col items-center justify-center rounded-lg px-4 py-2 ring-1 ${scoreBadgeClass}`}
          aria-label={`Score: ${score} out of 10`}
        >
          <span className="text-2xl font-bold leading-none" aria-hidden="true">
            {score}
          </span>
          <span className="text-xs font-medium mt-0.5" aria-hidden="true">
            / 10
          </span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-6 py-5 space-y-5">

        {/* Answer */}
        <section aria-labelledby={`answer-label-${index}`}>
          <h4
            id={`answer-label-${index}`}
            className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1"
          >
            Your Answer
          </h4>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {answer}
          </p>
        </section>

        {/* Strengths + Areas for Improvement — side-by-side on wider screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Strengths */}
          <section aria-labelledby={`strengths-label-${index}`}>
            <h4
              id={`strengths-label-${index}`}
              className="text-xs font-semibold uppercase tracking-wide text-green-700 mb-2"
            >
              Strengths
            </h4>
            {strengths.length > 0 ? (
              <ul className="space-y-1.5" role="list">
                {strengths.map((strength, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-gray-700"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-0.5 flex-shrink-0 h-4 w-4 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold"
                    >
                      ✓
                    </span>
                    {strength}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400 italic">None identified</p>
            )}
          </section>

          {/* Areas for Improvement */}
          <section aria-labelledby={`improvements-label-${index}`}>
            <h4
              id={`improvements-label-${index}`}
              className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-2"
            >
              Areas for Improvement
            </h4>
            {areasForImprovement.length > 0 ? (
              <ul className="space-y-1.5" role="list">
                {areasForImprovement.map((area, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-gray-700"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-0.5 flex-shrink-0 h-4 w-4 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold"
                    >
                      →
                    </span>
                    {area}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400 italic">None identified</p>
            )}
          </section>
        </div>

        {/* Summary */}
        <section aria-labelledby={`summary-label-${index}`}>
          <h4
            id={`summary-label-${index}`}
            className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1"
          >
            Overall Summary
          </h4>
          <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
        </section>
      </div>
    </article>
  );
}
