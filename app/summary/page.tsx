"use client";

// Session Summary screen
// Requirements: 7.1, 7.2, 7.3, 7.4

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import SessionSummaryCard from "@/components/SessionSummaryCard";
import SessionDebriefCard from "@/components/SessionDebriefCard";
import { buildDebriefFallback } from "@/lib/debrief";
import AuthModal from "@/components/AuthModal";
import { calculateAverageScore } from "@/hooks/useInterviewSession";
import { saveGuestSession, syncGuestSessionsToAccount } from "@/lib/guest-storage";
import { analyzeSpeechDelivery } from "@/lib/speech-metrics";
import type { SessionDebrief, SessionEntry } from "@/types";

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
  const { data: session } = useSession();
  const [entries, setEntries] = useState<SessionEntry[] | null>(null);
  const [savedToAccount, setSavedToAccount] = useState(false);
  const [guestSaved, setGuestSaved] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [debrief, setDebrief] = useState<SessionDebrief | null>(null);
  const [debriefLoading, setDebriefLoading] = useState(false);

  useEffect(() => {
    const results = loadSessionResults();
    if (results === null) {
      // Missing or invalid data — redirect to home
      router.replace("/");
      return;
    }
    setEntries(results);
  }, [router]);

  // Consolidated debrief: show the local one immediately, then replace with the AI one
  useEffect(() => {
    if (!entries || entries.length === 0) return;
    setDebrief(buildDebriefFallback(entries));
    setDebriefLoading(true);

    const controller = new AbortController();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    try {
      const gk = localStorage.getItem("mock_gemini_key");
      const qk = localStorage.getItem("mock_groq_key");
      if (gk) headers["x-gemini-key"] = gk;
      if (qk) headers["x-groq-key"] = qk;
    } catch {
      // storage unavailable — server keys are used
    }

    fetch("/api/review/summary", {
      method: "POST",
      headers,
      body: JSON.stringify({ entries }),
      signal: controller.signal,
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.debrief) setDebrief(data.debrief as SessionDebrief);
      })
      .catch(() => {})
      .finally(() => {
        if (!controller.signal.aborted) setDebriefLoading(false);
      });

    return () => controller.abort();
  }, [entries]);

  const jumpToQuestion = (index: number) => {
    document
      .getElementById(`question-review-${index}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const hasEntries = entries && entries.length > 0;
  const averageScore = hasEntries ? calculateAverageScore(entries) : null;

  // Auto-save to authenticated account or local guest storage
  useEffect(() => {
    if (entries && entries.length > 0) {
      if (session?.user && !savedToAccount) {
        const category = entries[0]?.question?.category || "General";
        fetch("/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category,
            mode: "typed",
            averageScore: averageScore || 0,
            entries,
          }),
        })
          .then((r) => {
            if (r.ok) {
              setSavedToAccount(true);
              syncGuestSessionsToAccount();
            }
          })
          .catch(() => {});
      } else if (!session?.user && !guestSaved) {
        const category = entries[0]?.question?.category || "General";
        saveGuestSession({
          category,
          mode: "typed",
          averageScore: averageScore || 0,
          entries,
        });
        setGuestSaved(true);
      }
    }
  }, [session, entries, averageScore, savedToAccount, guestSaved]);

  /** Derive styling for the average score badge. */
  const avgTheme =
    averageScore === null
      ? { badge: "bg-[#E2ECE5] border-sage-300/90 text-darkslate-800", ring: "text-darkslate-400" }
      : averageScore >= 8
      ? { badge: "bg-[#E2ECE5] border-sage-300/90 text-forest-950", ring: "text-forest-700" }
      : averageScore >= 5
      ? { badge: "bg-[#E2ECE5] border-sage-300/90 text-gold-950", ring: "text-gold-600" }
      : { badge: "bg-[#E2ECE5] border-sage-300/90 text-rose-950", ring: "text-rose-600" };

  // Aggregate session speech delivery metrics (when spoken answers exist)
  const sessionDelivery = useMemo(() => {
    if (!entries || entries.length === 0) return null;
    let totalWords = 0;
    let totalFillers = 0;
    let totalDuration = 0;

    for (const e of entries) {
      const dur = e.durationSeconds && e.durationSeconds > 0 ? e.durationSeconds : 0;
      if (dur > 0) {
        totalDuration += dur;
        const metrics = analyzeSpeechDelivery(e.answer, dur);
        totalWords += metrics.totalWords;
        totalFillers += metrics.fillerCount;
      }
    }

    if (totalDuration < 3) return null;
    const avgWpm = Math.round(totalWords / (totalDuration / 60));
    return {
      avgWpm,
      totalWords,
      totalFillers,
      totalDuration: Math.round(totalDuration),
    };
  }, [entries]);

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
            className={`rounded-3xl border p-6 sm:p-8 text-center shadow-md relative overflow-hidden ${avgTheme.badge}`}
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
                <span className="text-forest-850">Strong Hire — Advanced Readiness</span>
              ) : averageScore !== null && averageScore >= 6.5 ? (
                <span className="text-gold-900">Borderline / Lean Hire — Polishing Required</span>
              ) : averageScore !== null && averageScore >= 4.5 ? (
                <span className="text-rose-900 font-extrabold">Below Hiring Bar — Substantial Gaps</span>
              ) : (
                <span className="text-rose-950 font-black">Strong No Hire — Fundamental Deficits</span>
              )}
            </div>

            {/* Delivery Cadence & Filler Word Summary */}
            {sessionDelivery && (
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-5 border-t border-sage-300/70 text-center">
                <div className="rounded-xl bg-white/70 p-2.5 border border-sage-200/80 shadow-xs">
                  <span className="block text-lg font-black text-forest-900">
                    {sessionDelivery.avgWpm} WPM
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-darkslate-600">
                    Average Pacing
                  </span>
                </div>
                <div className="rounded-xl bg-white/70 p-2.5 border border-sage-200/80 shadow-xs">
                  <span className="block text-lg font-black text-forest-900">
                    {sessionDelivery.totalFillers}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-darkslate-600">
                    Filler Words
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-1 rounded-xl bg-white/70 p-2.5 border border-sage-200/80 shadow-xs">
                  <span className="block text-lg font-black text-forest-900">
                    {sessionDelivery.totalDuration}s
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-darkslate-600">
                    Speaking Time
                  </span>
                </div>
              </div>
            )}
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

        {/* ── Consolidated debrief across all answers ── */}
        {hasEntries && debrief && (
          <SessionDebriefCard
            debrief={debrief}
            isEnhancing={debriefLoading}
            onJumpToQuestion={jumpToQuestion}
          />
        )}

        {/* ── Account Sync & Persistence Status ── */}
        {hasEntries && (
          <div className="rounded-2xl border border-sage-300/80 bg-[#E2ECE5] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start sm:items-center gap-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest-850 text-white shadow-xs border border-forest-700/60">
                <svg className="h-5 w-5 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-extrabold text-forest-950 flex flex-wrap items-center gap-2">
                  <span>
                    {session?.user
                      ? savedToAccount
                        ? `Saved to profile (${session.user.name})`
                        : "Synchronizing session to cloud account..."
                      : "Guest Practice Session Saved Locally"}
                  </span>
                  {!session?.user && (
                    <span className="rounded-full bg-forest-100 border border-forest-300 px-2 py-0.5 text-[10px] font-bold text-forest-800">
                      Local Device
                    </span>
                  )}
                </p>
                <p className="text-xs text-darkslate-600 mt-0.5">
                  {session?.user
                    ? "Your score and coach breakdown are permanently linked to your profile in Supabase."
                    : "You can keep practicing freely without an account. When you decide to create an account, sign in to save your complete history."}
                </p>
              </div>
            </div>

            {session?.user ? (
              <Link
                href="/history"
                className="w-full sm:w-auto text-center shrink-0 rounded-xl bg-forest-700 hover:bg-forest-800 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-colors"
              >
                View History →
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full sm:w-auto justify-center shrink-0 inline-flex items-center gap-2 rounded-xl bg-forest-750 hover:bg-forest-850 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all active:scale-95"
              >
                <span>Save to Account</span>
              </button>
            )}
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
                <li key={entry.question.id ?? i} id={`question-review-${i}`} className="scroll-mt-20">
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

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
