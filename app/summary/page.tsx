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
      ? { badge: "bg-slate-50 border-slate-200 text-slate-800", ring: "text-slate-400" }
      : averageScore >= 8
      ? { badge: "bg-emerald-50/90 border-emerald-200 text-emerald-950", ring: "text-emerald-600" }
      : averageScore >= 5
      ? { badge: "bg-amber-50/90 border-amber-200 text-amber-950", ring: "text-amber-600" }
      : { badge: "bg-rose-50/90 border-rose-200 text-rose-950", ring: "text-rose-600" };

  return (
    <div className="py-8">
      <div className="mx-auto w-full max-w-3xl space-y-8">

        {/* ── Page header ── */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-200/80 px-3.5 py-1 text-xs font-bold text-indigo-700">
            <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
            <span>INTERVUE PERFORMANCE REPORT</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Interview Session Results
          </h1>
          <p className="text-sm sm:text-base text-slate-500 max-w-lg mx-auto">
            Comprehensive breakdown of your answers evaluated on Structure & Depth, Tone & Delivery, and Connection to the Question.
          </p>
        </div>

        {/* ── Average score banner (Req 7.2) or no-answers message (Req 7.3) ── */}
        {hasEntries ? (
          <div
            className={`rounded-3xl border p-8 text-center shadow-sm relative overflow-hidden ${avgTheme.badge}`}
            aria-label={`Session average score: ${averageScore} out of 10`}
          >
            {/* Ambient decorative glow */}
            <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
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

            <p className="mt-3 text-xs sm:text-sm font-medium text-slate-600">
              Evaluated across {entries.length} answered{" "}
              {entries.length === 1 ? "question" : "questions"} by Intervue AI Coach
            </p>

            {/* Performance status tag */}
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1 text-xs font-bold shadow-xs border border-slate-200/80">
              {averageScore !== null && averageScore >= 8 ? (
                <span className="text-emerald-700">🌟 Excellent Interview Readiness</span>
              ) : averageScore !== null && averageScore >= 5 ? (
                <span className="text-amber-700">📈 Good Foundation — Refine Polish & Specifics</span>
              ) : (
                <span className="text-rose-700">💪 Needs Practice — Review Areas for Improvement</span>
              )}
            </div>
          </div>
        ) : (
          /* Req 7.3 — no answers submitted */
          <div
            role="status"
            className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xs"
          >
            <p className="text-base font-bold text-slate-800">
              No answers were submitted
            </p>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Start a new session and complete at least one question to see your comprehensive AI analysis here.
            </p>
          </div>
        )}

        {/* ── Per-question summary cards (Req 7.1) ── */}
        {hasEntries && (
          <section aria-label="Answered questions" className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600">
                Detailed Question Reviews
              </h2>
              <span className="text-xs text-slate-400">
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
            className="rounded-xl bg-indigo-600 px-8 py-3.5 text-sm font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 active:bg-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-all"
          >
            Start Another Practice Session
          </button>
        </div>
      </div>
    </div>
  );
}
