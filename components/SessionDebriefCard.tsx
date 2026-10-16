"use client";

import type { SessionDebrief } from "@/types";

interface SessionDebriefCardProps {
  debrief: SessionDebrief;
  /** True while the AI debrief is still being generated (a local summary is shown meanwhile). */
  isEnhancing: boolean;
  /** Called when the user taps a question reference to jump to its detailed review. */
  onJumpToQuestion?: (index: number) => void;
}

/**
 * SessionDebriefCard — consolidated, cross-answer takeaways shown above the
 * per-question reviews: verdict, recurring strengths, priority fixes, next steps.
 */
export default function SessionDebriefCard({
  debrief,
  isEnhancing,
  onJumpToQuestion,
}: SessionDebriefCardProps) {
  const { headline, summary, recurringStrengths, priorityFixes, nextSteps } = debrief;

  return (
    <section
      aria-label="Overall session debrief"
      aria-busy={isEnhancing}
      className="rounded-3xl border border-sage-300/90 bg-[#E2ECE5] shadow-md overflow-hidden"
    >
      <div className="bg-forest-800 px-5 sm:px-6 py-4 text-white">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gold-300">
            Overall Debrief
          </h2>
          <span
            role="status"
            className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-sage-100"
          >
            {isEnhancing
              ? "Refining with AI…"
              : debrief.source === "ai"
              ? "AI debrief"
              : "Basic debrief (AI unavailable)"}
          </span>
        </div>
        <p className="mt-2 text-lg sm:text-xl font-extrabold leading-snug">{headline}</p>
      </div>

      <div className="space-y-5 px-5 sm:px-6 py-5">
        <p className="text-sm text-darkslate-800 leading-relaxed">{summary}</p>

        {typeof debrief.bestQuestionIndex === "number" &&
          typeof debrief.weakestQuestionIndex === "number" &&
          debrief.bestQuestionIndex !== debrief.weakestQuestionIndex &&
          onJumpToQuestion && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onJumpToQuestion(debrief.bestQuestionIndex!)}
                className="min-h-[44px] rounded-lg border border-forest-300 bg-forest-50 px-3 py-2 text-xs font-bold text-forest-900 hover:bg-forest-100"
              >
                Best answer: Q{debrief.bestQuestionIndex + 1} ↓
              </button>
              <button
                type="button"
                onClick={() => onJumpToQuestion(debrief.weakestQuestionIndex!)}
                className="min-h-[44px] rounded-lg border border-gold-300 bg-gold-50 px-3 py-2 text-xs font-bold text-gold-900 hover:bg-gold-100"
              >
                Needs most work: Q{debrief.weakestQuestionIndex + 1} ↓
              </button>
            </div>
          )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-forest-200/80 bg-forest-50/60 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-forest-800 mb-2">
              What you do well
            </h3>
            <ul className="space-y-2">
              {recurringStrengths.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-forest-950 leading-snug">
                  <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-forest-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-gold-200/80 bg-gold-50/60 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gold-900 mb-2">
              Fix these first
            </h3>
            <ol className="space-y-2 list-none p-0">
              {priorityFixes.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gold-950 leading-snug">
                  <span aria-hidden="true" className="font-black text-gold-700">{i + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="rounded-xl bg-[#D4E3D8] border border-sage-300/80 p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-darkslate-700 mb-2">
            Your next steps
          </h3>
          <ul className="space-y-2">
            {nextSteps.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-darkslate-900 leading-snug">
                <span aria-hidden="true" className="mt-0.5 text-forest-700">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
