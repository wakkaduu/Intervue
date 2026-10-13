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
      ? "bg-emerald-50 text-emerald-800 ring-emerald-300/80 border-emerald-200"
      : score >= 5
      ? "bg-amber-50 text-amber-800 ring-amber-300/80 border-amber-200"
      : "bg-rose-50 text-rose-800 ring-rose-300/80 border-rose-200";

  return (
    <article
      aria-label={`Question ${index} summary`}
      className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden transition-all hover:shadow-md"
    >
      {/* ── Header: question number + score ── */}
      <div className="flex items-start justify-between gap-4 px-6 py-5 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-200/80">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-200/70">
              Question {index}
            </span>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
              {question.category}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
            {question.text}
          </h3>
        </div>

        {/* Score badge — rendered at ≥1.5× body font size per Req 6.1 */}
        <div
          className={`flex-shrink-0 flex flex-col items-center justify-center rounded-xl px-4 py-2 border ring-2 shadow-xs ${scoreBadgeClass}`}
          aria-label={`Score: ${score} out of 10`}
        >
          <span className="text-2xl sm:text-3xl font-extrabold leading-none tracking-tight" aria-hidden="true">
            {score}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider mt-0.5 opacity-80" aria-hidden="true">
            / 10
          </span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-6 py-6 space-y-6">

        {/* Answer */}
        <section aria-labelledby={`answer-label-${index}`} className="rounded-xl bg-slate-50/80 border border-slate-200/70 p-4">
          <h4
            id={`answer-label-${index}`}
            className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5"
          >
            <span>💬</span>
            <span>Your Response</span>
          </h4>
          <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
            {answer}
          </p>
        </section>

        {/* Strengths + Areas for Improvement — side-by-side on wider screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Strengths */}
          <section
            aria-labelledby={`strengths-label-${index}`}
            className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-4"
          >
            <h4
              id={`strengths-label-${index}`}
              className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2.5 flex items-center gap-1.5"
            >
              <span className="h-4 w-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">✓</span>
              <span>Strengths</span>
            </h4>
            {strengths.length > 0 ? (
              <ul className="space-y-2" role="list">
                {strengths.map((strength, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs sm:text-sm text-emerald-950 leading-snug"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-1 flex-shrink-0 h-1.5 w-1.5 rounded-full bg-emerald-600"
                    />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 italic">None identified</p>
            )}
          </section>

          {/* Areas for Improvement */}
          <section
            aria-labelledby={`improvements-label-${index}`}
            className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-4"
          >
            <h4
              id={`improvements-label-${index}`}
              className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-2.5 flex items-center gap-1.5"
            >
              <span className="h-4 w-4 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs">→</span>
              <span>Areas for Improvement</span>
            </h4>
            {areasForImprovement.length > 0 ? (
              <ul className="space-y-2" role="list">
                {areasForImprovement.map((area, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs sm:text-sm text-amber-950 leading-snug"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-1 flex-shrink-0 h-1.5 w-1.5 rounded-full bg-amber-600"
                    />
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 italic">None identified</p>
            )}
          </section>
        </div>

        {/* 3 Core Dimensions */}
        {(feedback.howTheyAnswered || feedback.toneAnalysis || feedback.questionConnection) && (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3 pt-1">
            {feedback.howTheyAnswered && (
              <div className="rounded-xl bg-blue-50/80 border border-blue-200 p-4">
                <span className="text-xs font-bold text-blue-900 block mb-1">📋 Structure & Depth</span>
                <p className="text-xs text-blue-950 leading-relaxed">{feedback.howTheyAnswered}</p>
              </div>
            )}
            {feedback.toneAnalysis && (
              <div className="rounded-xl bg-purple-50/80 border border-purple-200 p-4">
                <span className="text-xs font-bold text-purple-900 block mb-1">🎙️ Tone & Delivery</span>
                <p className="text-xs text-purple-950 leading-relaxed">{feedback.toneAnalysis}</p>
              </div>
            )}
            {feedback.questionConnection && (
              <div className="rounded-xl bg-emerald-50/80 border border-emerald-200 p-4">
                <span className="text-xs font-bold text-emerald-900 block mb-1">🎯 Question Connection</span>
                <p className="text-xs text-emerald-950 leading-relaxed">{feedback.questionConnection}</p>
              </div>
            )}
          </div>
        )}

        {/* Summary */}
        <section
          aria-labelledby={`summary-label-${index}`}
          className="rounded-xl bg-slate-900 text-white p-4 sm:p-5"
        >
          <h4
            id={`summary-label-${index}`}
            className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-1 flex items-center gap-1.5"
          >
            <span>🤖</span>
            <span>Intervue AI Recommendation</span>
          </h4>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">{summary}</p>
        </section>
      </div>
    </article>
  );
}
