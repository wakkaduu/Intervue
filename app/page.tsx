"use client";

// Home screen — pick a track and mode, start practising in one step.
// Requirements: 1.1, 1.2, 1.4

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import ErrorMessage from "@/components/ErrorMessage";
import { CATEGORY_GROUPS, getCategoryIcon, getQuestionsByCategory } from "@/lib/questions";
import { shortCategory } from "@/lib/progress-trend";
import type { AnswerMode } from "@/types";

const MODE_STORAGE_KEY = "intervue_last_mode";

const MicIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
);

const PenIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

export default function Home() {
  const router = useRouter();
  const { selectedCategory, openSidebar } = useSidebar();
  const [answerMode, setAnswerMode] = useState<AnswerMode>("mic");
  const [showError, setShowError] = useState(false);

  // Remember the last used mode
  useEffect(() => {
    try {
      const saved = localStorage.getItem(MODE_STORAGE_KEY);
      if (saved === "mic" || saved === "typed") setAnswerMode(saved);
    } catch {
      // storage unavailable
    }
  }, []);

  function chooseMode(mode: AnswerMode) {
    setAnswerMode(mode);
    try {
      localStorage.setItem(MODE_STORAGE_KEY, mode);
    } catch {
      // storage unavailable
    }
  }

  const activeGroup = useMemo(
    () => CATEGORY_GROUPS.find((g) => g.categories.includes(selectedCategory)),
    [selectedCategory]
  );

  // "Name (details)" -> details shown as a quieter second line
  const trackDetail = useMemo(() => {
    const m = selectedCategory.match(/\((.+)\)\s*$/);
    return m ? m[1] : "";
  }, [selectedCategory]);

  const trackQuestions = useMemo(() => getQuestionsByCategory(selectedCategory), [selectedCategory]);
  const questionCount = trackQuestions.length;
  const previewQuestions = trackQuestions.slice(0, 3);
  const estimatedMinutes = Math.max(5, questionCount * 2);

  function handleStartSession() {
    if (!selectedCategory) {
      setShowError(true);
      return;
    }
    setShowError(false);
    router.push(`/interview?category=${encodeURIComponent(selectedCategory)}&mode=${answerMode}`);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-2 animate-fade-up">
      {/* ── Hero ── */}
      <header className="text-center space-y-3 pt-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-forest-600/80 bg-forest-900/90 px-3.5 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-sm">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" aria-hidden="true" />
          <span>AI interviewer · voice or written</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white text-balance sm:text-4xl lg:text-5xl">
          Practice the interview.
          <br />
          <span className="text-emerald-400">Get coached like it&apos;s real</span>
          <span className="text-gold-400">.</span>
        </h1>
        <p className="mx-auto max-w-xl text-sm leading-relaxed text-sage-200 sm:text-base">
          Answer out loud or in writing. Get specific feedback that quotes what you actually said, shows a
          stronger way to say it, and asks the follow-up a real interviewer would.
        </p>
      </header>

      {/* ── Start practice: the one focal card ── */}
      <section
        aria-labelledby="start-heading"
        className="rounded-3xl border border-sage-300/80 bg-[#E2ECE5] p-5 sm:p-7 shadow-xl shadow-forest-950/30 ring-1 ring-white/10 space-y-5"
      >
        <h2 id="start-heading" className="sr-only">
          Start a practice session
        </h2>

        {/* Track */}
        <div className="flex items-start gap-3.5">
          <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-sage-300/90 bg-[#D4E3D8] text-2xl" aria-hidden="true">
            {getCategoryIcon(selectedCategory)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-forest-800">
              {activeGroup?.name || "Your track"}
            </p>
            <p className="mt-0.5 text-base font-extrabold leading-snug text-forest-950 sm:text-xl" title={selectedCategory}>
              {shortCategory(selectedCategory)}
            </p>
            {trackDetail && (
              <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-darkslate-600">{trackDetail}</p>
            )}
          </div>
          <button
            type="button"
            onClick={openSidebar}
            aria-label="Change track. 52 tracks available"
            className="min-h-[44px] shrink-0 rounded-xl border border-forest-600/80 bg-forest-800 px-3.5 py-2 text-xs font-bold text-emerald-200 transition-all hover:bg-forest-700 hover:text-white active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-2"
          >
            Change
          </button>
        </div>

        {/* Mode: segmented control */}
        <div>
          <p id="mode-label" className="mb-2 text-xs font-bold uppercase tracking-wider text-darkslate-600">
            How do you want to answer?
          </p>
          <div role="radiogroup" aria-labelledby="mode-label" className="grid grid-cols-2 gap-2 rounded-2xl bg-[#D4E3D8] p-1.5">
            {(
              [
                { mode: "mic" as const, label: "Voice", hint: "Speak your answers", Icon: MicIcon },
                { mode: "typed" as const, label: "Written", hint: "Type your answers", Icon: PenIcon },
              ]
            ).map(({ mode, label, hint, Icon }) => {
              const selected = answerMode === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => chooseMode(mode)}
                  className={`flex min-h-[56px] items-center justify-center gap-2.5 rounded-xl px-3 py-2 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600 ${
                    selected
                      ? "bg-forest-700 text-white shadow-md"
                      : "text-darkslate-700 hover:bg-[#E2ECE5]"
                  }`}
                >
                  <Icon className={`h-5 w-5 shrink-0 ${selected ? "text-emerald-300" : "text-darkslate-500"}`} />
                  <span>
                    <span className="block text-sm font-bold leading-tight">{label}</span>
                    <span className={`block text-[11px] leading-tight ${selected ? "text-sage-200" : "text-darkslate-500"}`}>
                      {hint}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {showError && (
          <div className="animate-shake">
            <ErrorMessage id="category-error" message="Please choose a track before starting your practice session." />
          </div>
        )}

        {/* Primary action */}
        <div>
          <button
            type="button"
            onClick={handleStartSession}
            className="group flex min-h-[56px] w-full items-center justify-center gap-3 rounded-2xl bg-forest-700 p-4 text-base font-bold text-white shadow-lg shadow-forest-950/30 transition-all duration-200 hover:bg-forest-600 hover:shadow-xl active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-2"
          >
            {answerMode === "mic" ? <MicIcon className="h-5 w-5 text-emerald-300" /> : <PenIcon className="h-5 w-5 text-emerald-300" />}
            <span>Start practicing</span>
            <span className="text-gold-300 transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
          </button>
          <p className="mt-2.5 text-center text-xs text-darkslate-600">
            {questionCount} questions · about {estimatedMinutes} minutes · feedback on every answer at the end
          </p>
        </div>
      </section>

      {/* ── What the feedback looks like ── */}
      <section aria-labelledby="sample-heading" className="space-y-3">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="sample-heading" className="text-lg font-extrabold text-white sm:text-xl">
            What your feedback looks like
          </h2>
          <span className="shrink-0 rounded-full border border-forest-600/80 bg-forest-900/80 px-2.5 py-0.5 text-[11px] font-semibold text-sage-200">
            Example
          </span>
        </div>

        <article className="rounded-2xl border border-sage-300/80 bg-[#E2ECE5] p-5 shadow-md sm:p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-darkslate-600">Question</p>
              <p className="mt-1 text-sm font-bold leading-snug text-forest-950 sm:text-base">
                Tell me about a time you solved a difficult technical problem.
              </p>
              <p className="mt-2 rounded-lg bg-[#D4E3D8] px-3 py-2 text-xs italic leading-relaxed text-darkslate-700">
                “…I looked into it and found the database queries were the issue, so I fixed them and it got faster.”
              </p>
            </div>
            <div className="shrink-0 rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-center text-rose-800" aria-label="Score 3 out of 10">
              <span className="block text-2xl font-extrabold leading-none">3</span>
              <span className="text-[10px] font-bold uppercase">/ 10</span>
            </div>
          </div>

          <div className="rounded-xl bg-forest-800 p-4 text-sage-100">
            <p className="text-xs font-bold uppercase tracking-wider text-gold-300">Interviewer&apos;s take</p>
            <p className="mt-1 text-sm leading-relaxed">
              You gave me a headline instead of the story. When you said “I fixed them”, you skipped the part I
              most wanted to hear: how you found the problem and what you changed.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border-l-4 border-gold-500 bg-gold-50/80 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-gold-900">Work on this first</p>
              <p className="mt-1 text-sm leading-relaxed text-gold-950">
                Break “I fixed them” into your diagnostic steps and the exact change you made.
              </p>
            </div>
            <div className="rounded-xl border border-forest-200 bg-forest-50/80 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-forest-800">Try saying it like this</p>
              <p className="mt-1 text-sm italic leading-relaxed text-forest-950">
                “I checked the slow-query log and found an unindexed join on [table]. A composite index cut it
                from [X ms] to [Y ms].”
              </p>
            </div>
          </div>

          <p className="text-sm text-darkslate-800">
            <span className="font-bold">A real interviewer would ask next: </span>
            What told you the queries were the bottleneck?
          </p>
        </article>
      </section>

      {/* ── Sample questions for the chosen track ── */}
      <section aria-labelledby="questions-heading" className="space-y-3 pb-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="questions-heading" className="text-lg font-extrabold text-white sm:text-xl">
            A taste of this track
          </h2>
          <span className="text-xs text-sage-300">
            {previewQuestions.length} of {questionCount} questions
          </span>
        </div>
        <ol className="space-y-2.5 list-none p-0">
          {previewQuestions.map((q, idx) => (
            <li
              key={q.id || idx}
              className="flex items-start gap-3 rounded-xl border border-sage-300/80 bg-[#E2ECE5] p-3.5 text-sm text-darkslate-900 shadow-sm transition-colors hover:bg-[#D4E3D8]"
            >
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-forest-700 text-[11px] font-bold text-white" aria-hidden="true">
                {idx + 1}
              </span>
              <p className="font-medium leading-relaxed">{q.text}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
