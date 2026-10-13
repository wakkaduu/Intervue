"use client";

// Session Summary screen
// Requirements: 7.1, 7.2, 7.3, 7.4

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SessionSummaryCard from "@/components/SessionSummaryCard";
import { calculateAverageScore } from "@/hooks/useInterviewSession";
import type { SessionEntry } from "@/types";

/**
 * Reads and parses `SessionEntry[]` from sessionStorage.
 * Returns `null` if the key is missing or the value is not a valid JSON array.
 */
function loadSessionResults(): SessionEntry[] | null {
  try {
    const raw = sessionStorage.getItem("sessionResults");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed as SessionEntry[];
  } catch {
    return null;
  }
}

export default function SummaryPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<SessionEntry[] | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const results = loadSessionResults();
    if (results === null) {
      // Missing or invalid data — redirect to home
      router.replace("/");
      return;
    }
    setEntries(results);
    setReady(true);
  }, [router]);

  // While we're determining whether to redirect or render, show nothing
  if (!ready || entries === null) {
    return null;
  }

  const hasEntries = entries.length > 0;
  const averageScore = hasEntries ? calculateAverageScore(entries) : null;

  /** Derive styling for the average score badge. */
  const avgTheme =
    averageScore === null
      ? { badge: "bg-[#E2ECE5] border-sage-300/90 text-darkslate-800", ring: "text-darkslate-400" }
      : averageScore >= 8
      ? { badge: "bg-[#E2ECE5] border-sage-300/90 text-forest-950", ring: "text-forest-700" }
      : averageScore >= 5
      ? { badge: "bg-[#E2ECE5] border-sage-300/90 text-gold-950", ring: "text-gold-600" }
      : { badge: "bg-[#E2ECE5] border-sage-300/90 text-rose-950", ring: "text-rose-600" };

  return (
    <div className="py-8">
      <div className="mx-auto w-full max-w-3xl space-y-8">

        {/* ── Page header ── */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-forest-800/90 border border-emerald-500/30 px-3.5 py-1 text-xs font-bold text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>INTERVUE PERFORMANCE REPORT</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Interview Session Results
          </h1>
          <p className="text-sm sm:text-base text-sage-200 max-w-lg mx-auto">
            Comprehensive breakdown of your answers evaluated on Structure & Depth, Tone & Delivery, and Connection to the Question.
          </p>
        </div>

        {/* ── Average score banner (Req 7.2) or no-answers message (Req 7.3) ── */}
        {hasEntries ? (
          <div
            className={`rounded-3xl border p-8 text-center shadow-md relative overflow-hidden ${avgTheme.badge}`}
            aria-label={`Session average score: ${averageScore} out of 10`}
          >
            {/* Ambient decorative glow */}
            <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-forest-700/10 blur-2xl pointer-events-none" />

            <p className="text-xs font-bold uppercase tracking-widest text-darkslate-500 mb-2">
              Overall Session Performance
            </p>

            <div className="flex items-baseline justify-center gap-1">
              <span className="text-6xl sm:text-7xl font-black tracking-tight" aria-hidden="true">
                {averageScore}
              </span>
              <span className="text-2xl font-bold opacity-60" aria-hidden="true">
                / 10
              </span>
            </div>

            <p className="mt-3 text-xs sm:text-sm font-medium text-darkslate-600">
              Evaluated across {entries.length} answered{" "}
              {entries.length === 1 ? "question" : "questions"} by Intervue Performance Coach
            </p>

            {/* Performance status tag */}
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#D4E3D8] px-3.5 py-1 text-xs font-bold shadow-xs border border-sage-300">
              {averageScore !== null && averageScore >= 8 ? (
                <span className="text-forest-800">🌟 Excellent Interview Readiness</span>
              ) : averageScore !== null && averageScore >= 5 ? (
                <span className="text-gold-800">📈 Good Foundation — Refine Polish & Specifics</span>
              ) : (
                <span className="text-rose-700">💪 Needs Practice — Review Areas for Improvement</span>
              )}
            </div>
          </div>
        ) : (
          /* Req 7.3 — no answers submitted */
          <div
            role="status"
            className="rounded-2xl border border-sage-300 bg-[#E2ECE5] p-8 text-center shadow-md"
          >
            <p className="text-base font-bold text-darkslate-900">
              No answers were submitted
            </p>
            <p className="mt-1 text-xs sm:text-sm text-darkslate-600">
              Start a new session and complete at least one question to see your comprehensive performance results here.
            </p>
          </div>
        )}

        {/* ── Per-question summary cards (Req 7.1) ── */}
        {hasEntries && (
          <section aria-label="Answered questions" className="space-y-4">
            <div className="flex items-center justify-between border-b border-forest-700/60 pb-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-sage-200">
                Detailed Question Reviews
              </h2>
              <span className="text-xs text-sage-300">
                {entries.length} {entries.length === 1 ? "card" : "cards"}
              </span>
            </div>

            <ol className="space-y-6 list-none p-0">
              {entries.map((entry, i) => (
                <li key={entry.question.id ?? i}>
                  <SessionSummaryCard entry={entry} index={i + 1} />
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* ── Navigation / New Session buttons (Req 7.4) ── */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => router.push("/")}
            aria-label="Start a new session"
            className="rounded-xl bg-forest-700 px-8 py-3.5 text-sm font-bold text-white shadow-md shadow-forest-900/20 hover:bg-forest-800 active:bg-forest-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600 focus-visible:ring-offset-2 transition-all"
          >
            Start Another Practice Session
          </button>
        </div>
      </div>
    </div>
  );
}
