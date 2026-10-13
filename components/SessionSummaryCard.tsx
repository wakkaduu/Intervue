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
      ? "bg-forest-50 text-forest-800 ring-forest-300/80 border-forest-200"
      : score >= 5
      ? "bg-gold-50 text-gold-900 ring-gold-300/80 border-gold-200"
      : "bg-rose-50 text-rose-800 ring-rose-300/80 border-rose-200";

  return (
    <article
      aria-label={`Question ${index} summary`}
      className="rounded-2xl border border-sage-300/90 bg-[#E2ECE5] shadow-md overflow-hidden transition-all hover:shadow-lg"
    >
      {/* ── Header: question number + score ── */}
      <div className="flex items-start justify-between gap-4 px-6 py-5 bg-[#D4E3D8] border-b border-sage-300/80">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center rounded-full bg-forest-50 px-2.5 py-0.5 text-xs font-bold text-forest-800 border border-forest-200/70">
              Question {index}
            </span>
            <span
              className="inline-flex items-center rounded-full bg-sage-100 px-2.5 py-0.5 text-xs font-medium text-darkslate-700 cursor-default"
              title={question.category}
            >
              {question.category}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-forest-950 leading-snug">
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
        <section aria-labelledby={`answer-label-${index}`} className="rounded-xl bg-[#DCE7DF] border border-sage-300/70 p-4">
          <h4
            id={`answer-label-${index}`}
            className="text-xs font-bold uppercase tracking-wider text-darkslate-600 mb-1.5 flex items-center gap-1.5"
          >
            <svg className="h-3.5 w-3.5 text-darkslate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Candidate Response</span>
          </h4>
          <p className="text-sm text-darkslate-900 leading-relaxed whitespace-pre-wrap">
            {answer}
          </p>
        </section>

        {/* Strengths + Areas for Improvement — side-by-side on wider screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Strengths */}
          <section
            aria-labelledby={`strengths-label-${index}`}
            className="rounded-xl border border-forest-200/80 bg-forest-50/60 p-4"
          >
            <h4
              id={`strengths-label-${index}`}
              className="text-xs font-bold uppercase tracking-wider text-forest-800 mb-2.5 flex items-center gap-1.5"
            >
              <span className="h-4 w-4 rounded-full bg-forest-100 text-forest-700 flex items-center justify-center text-xs font-bold">✓</span>
              <span>Strengths</span>
            </h4>
            {strengths.length > 0 ? (
              <ul className="space-y-2" role="list">
                {strengths.map((strength, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs sm:text-sm text-forest-950 leading-snug"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-1 flex-shrink-0 h-1.5 w-1.5 rounded-full bg-forest-600"
                    />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-darkslate-400 italic">None identified</p>
            )}
          </section>

          {/* Areas for Improvement (Warm Gold Accent) */}
          <section
            aria-labelledby={`improvements-label-${index}`}
            className="rounded-xl border border-gold-200/80 bg-gold-50/60 p-4"
          >
            <h4
              id={`improvements-label-${index}`}
              className="text-xs font-bold uppercase tracking-wider text-gold-900 mb-2.5 flex items-center gap-1.5"
            >
              <span className="h-4 w-4 rounded-full bg-gold-100 text-gold-800 flex items-center justify-center text-xs font-bold">→</span>
              <span>Areas for Improvement</span>
            </h4>
            {areasForImprovement.length > 0 ? (
              <ul className="space-y-2" role="list">
                {areasForImprovement.map((area, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs sm:text-sm text-gold-950 leading-snug"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-1 flex-shrink-0 h-1.5 w-1.5 rounded-full bg-gold-600"
                    />
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-darkslate-400 italic">None identified</p>
            )}
          </section>
        </div>

        {/* 3 Core Dimensions */}
        {(feedback.howTheyAnswered || feedback.toneAnalysis || feedback.questionConnection) && (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3 pt-1">
            {feedback.howTheyAnswered && (
              <div className="rounded-xl bg-sage-100/70 border border-sage-200 p-4">
                <span className="text-xs font-bold text-forest-800 block mb-1">Structure & Depth</span>
                <p className="text-xs text-darkslate-800 leading-relaxed">{feedback.howTheyAnswered}</p>
              </div>
            )}
            {feedback.toneAnalysis && (
              <div className="rounded-xl bg-forest-50/70 border border-forest-200 p-4">
                <span className="text-xs font-bold text-forest-800 block mb-1">Tone & Delivery</span>
                <p className="text-xs text-darkslate-800 leading-relaxed">{feedback.toneAnalysis}</p>
              </div>
            )}
            {feedback.questionConnection && (
              <div className="rounded-xl bg-gold-50/70 border border-gold-200 p-4">
                <span className="text-xs font-bold text-gold-800 block mb-1">Question Alignment</span>
                <p className="text-xs text-darkslate-800 leading-relaxed">{feedback.questionConnection}</p>
              </div>
            )}
          </div>
        )}

        {/* Summary Coach Recommendation */}
        <section
          aria-labelledby={`summary-label-${index}`}
          className="rounded-xl bg-forest-800 text-white p-4 sm:p-5 shadow-sm"
        >
          <h4
            id={`summary-label-${index}`}
            className="text-xs font-bold uppercase tracking-wider text-gold-300 mb-1 flex items-center gap-1.5"
          >
            <svg className="h-4 w-4 text-gold-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span>Evaluation Recommendation</span>
          </h4>
          <p className="text-xs sm:text-sm text-sage-100 leading-relaxed font-normal">{summary}</p>
        </section>
      </div>
    </article>
  );
}
