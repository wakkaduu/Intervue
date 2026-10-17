"use client";

// Session Summary screen
// Requirements: 7.1, 7.2, 7.3, 7.4

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import SessionSummaryCard from "@/components/SessionSummaryCard";
import SessionDebriefCard from "@/components/SessionDebriefCard";
import ScoreRing from "@/components/ScoreRing";
import Button, { buttonClasses } from "@/components/ui/Button";
import { scoreVerdict } from "@/lib/score-verdict";
import { shortCategory } from "@/lib/progress-trend";
import { markSaved, resultsKey, wasSaved } from "@/lib/session-save";
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

function loadSessionMode(): "mic" | "typed" {
  try {
    return sessionStorage.getItem("sessionMode") === "mic" ? "mic" : "typed";
  } catch {
    return "typed";
  }
}

export default function SummaryPage() {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const [entries, setEntries] = useState<SessionEntry[] | null>(null);
  const [savedToAccount, setSavedToAccount] = useState(false);
  const [guestSaved, setGuestSaved] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [debrief, setDebrief] = useState<SessionDebrief | null>(null);
  const [debriefLoading, setDebriefLoading] = useState(false);
  const [openCards, setOpenCards] = useState<Set<number>>(new Set());
  const [sessionMode, setSessionMode] = useState<"mic" | "typed">("typed");

  useEffect(() => {
    const results = loadSessionResults();
    if (results === null) {
      // Missing or invalid data — redirect to home
      router.replace("/");
      return;
    }
    setSessionMode(loadSessionMode());
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

  const toggleCard = (index: number) =>
    setOpenCards((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });

  const jumpToQuestion = (index: number) => {
    setOpenCards((prev) => new Set(prev).add(index));
    // wait for the card to expand before scrolling to it
    setTimeout(() => {
      document
        .getElementById(`question-review-${index}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const hasEntries = entries && entries.length > 0;
  const averageScore = hasEntries ? calculateAverageScore(entries) : null;

  // Auto-save to the signed-in account or to local guest storage, once per finished session
  useEffect(() => {
    if (!entries || entries.length === 0) return;
    if (authStatus === "loading") return; // wait to know whether the user is signed in
    const key = resultsKey(entries);
    const category = entries[0]?.question?.category || "General";

    if (session?.user) {
      if (savedToAccount) return;
      if (wasSaved("account", key)) {
        setSavedToAccount(true);
        return;
      }
      fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, mode: sessionMode, averageScore: averageScore || 0, entries }),
      })
        .then((r) => {
          if (r.ok) {
            markSaved("account", key);
            setSavedToAccount(true);
            syncGuestSessionsToAccount();
          }
        })
        .catch(() => {});
    } else {
      if (guestSaved) return;
      if (!wasSaved("guest", key)) {
        saveGuestSession({ category, mode: sessionMode, averageScore: averageScore || 0, entries });
        markSaved("guest", key);
      }
      setGuestSaved(true);
    }
  }, [session, authStatus, entries, averageScore, savedToAccount, guestSaved, sessionMode]);

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

  const verdict = averageScore !== null ? scoreVerdict(averageScore) : null;
  const category = entries?.[0]?.question?.category;

  return (
    <div className="py-6 sm:py-8">
      <div className="mx-auto w-full max-w-3xl space-y-6 pb-24 sm:pb-6 animate-fade-up">

        {/* ── Page header ── */}
        <header className="space-y-1.5 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">Session complete</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Your results</h1>
          {category && (
            <p className="text-sm text-sage-200">
              {shortCategory(category)} · {entries?.length} {entries?.length === 1 ? "question" : "questions"} ·{" "}
              {sessionMode === "mic" ? "Voice" : "Written"}
            </p>
          )}
        </header>

        {/* ── Score card ── */}
        {hasEntries && averageScore !== null && verdict ? (
          <section
            aria-label="Overall score"
            className="rounded-3xl border border-sage-300/90 bg-[#E2ECE5] p-5 shadow-lg shadow-forest-950/20 sm:p-7"
          >
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-8">
              <ScoreRing score={averageScore} />
              <div className="min-w-0 flex-1 space-y-3 text-center sm:text-left">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-darkslate-600">Overall</p>
                  <p className="text-2xl font-extrabold tracking-tight text-forest-950 sm:text-3xl">
                    {verdict.label}
                  </p>
                  {debrief && (
                    <p className="mt-1 text-sm leading-snug text-darkslate-700">{debrief.headline}</p>
                  )}
                </div>

                {sessionDelivery && (
                  <dl className="grid grid-cols-3 gap-2 border-t border-sage-300/70 pt-3">
                    {[
                      { label: "Pace", value: `${sessionDelivery.avgWpm} wpm` },
                      { label: "Filler words", value: String(sessionDelivery.totalFillers) },
                      { label: "Speaking time", value: `${sessionDelivery.totalDuration}s` },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-xl bg-white/60 px-2 py-2 text-center">
                        <dd className="text-base font-extrabold text-forest-900 tabular-nums">{stat.value}</dd>
                        <dt className="text-[10px] font-bold uppercase tracking-wider text-darkslate-600">
                          {stat.label}
                        </dt>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            </div>
          </section>
        ) : (
          /* Req 7.3 — no answers submitted */
          <div role="status" className="rounded-2xl border border-sage-300 bg-[#E2ECE5] p-8 text-center shadow-md">
            <p className="text-base font-bold text-darkslate-900">No answers were submitted</p>
            <p className="mt-1 text-sm text-darkslate-600">
              Start a new session and complete at least one question to see your results here.
            </p>
          </div>
        )}

        {/* ── Consolidated debrief across all answers ── */}
        {hasEntries && debrief && (
          <SessionDebriefCard debrief={debrief} isEnhancing={debriefLoading} onJumpToQuestion={jumpToQuestion} />
        )}

        {/* ── Save status (compact) ── */}
        {hasEntries && (
          <div className="flex flex-col gap-3 rounded-2xl border border-sage-300/80 bg-[#E2ECE5] p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span
                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-forest-800 text-emerald-300"
                aria-hidden="true"
              >
                ✓
              </span>
              <div role="status">
                <p className="text-sm font-bold text-forest-950">
                  {session?.user
                    ? savedToAccount
                      ? "Saved to your history"
                      : "Saving to your account…"
                    : "Saved on this device"}
                </p>
                <p className="text-xs text-darkslate-600">
                  {session?.user
                    ? "Track your progress over time on the History page."
                    : "Sign in to keep your history across devices."}
                </p>
              </div>
            </div>
            {session?.user ? (
              <Link href="/history" className={buttonClasses({ variant: "secondary", size: "sm" })}>
                View history
              </Link>
            ) : (
              <Button variant="primary" size="sm" onClick={() => setIsAuthModalOpen(true)}>
                Save to account
              </Button>
            )}
          </div>
        )}

        {/* ── Per-question reviews (collapsed by default) ── */}
        {hasEntries && (
          <section aria-label="Answered questions" className="space-y-3">
            <div className="flex items-center justify-between border-b border-forest-700/60 pb-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-sage-200">Question reviews</h2>
              <button
                type="button"
                onClick={() =>
                  setOpenCards(openCards.size === entries.length ? new Set() : new Set(entries.map((_, i) => i)))
                }
                className="min-h-[44px] rounded-lg px-2 text-xs font-bold text-emerald-300 underline underline-offset-2 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              >
                {openCards.size === entries.length ? "Collapse all" : "Expand all"}
              </button>
            </div>

            <ol className="space-y-3 list-none p-0">
              {entries.map((entry, i) => {
                const isOpen = openCards.has(i);
                const v = scoreVerdict(entry.feedback.score);
                const toneClass =
                  v.tone === "good"
                    ? "bg-forest-50 text-forest-800 border-forest-300"
                    : v.tone === "mid"
                    ? "bg-gold-50 text-gold-900 border-gold-300"
                    : "bg-rose-50 text-rose-800 border-rose-300";
                return (
                  <li key={entry.question.id ?? i} id={`question-review-${i}`} className="scroll-mt-20">
                    <div className="overflow-hidden rounded-2xl border border-sage-300/90 bg-[#E2ECE5] shadow-sm">
                      <button
                        type="button"
                        onClick={() => toggleCard(i)}
                        aria-expanded={isOpen}
                        aria-controls={`question-panel-${i}`}
                        className="flex min-h-[64px] w-full items-start gap-3 px-4 py-3 text-left hover:bg-[#D4E3D8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-forest-600"
                      >
                        <span
                          className={`shrink-0 rounded-lg border px-2.5 py-1 text-center ${toneClass}`}
                          aria-label={`Score ${entry.feedback.score} out of 10, ${v.label}`}
                        >
                          <span className="block text-sm font-extrabold leading-none">{entry.feedback.score}/10</span>
                          <span className="mt-0.5 block text-[9px] font-bold uppercase tracking-tight">{v.label}</span>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs font-bold text-darkslate-600">Question {i + 1}</span>
                          <span className="block text-sm font-semibold leading-snug text-forest-950">
                            {entry.question.text}
                          </span>
                          {!isOpen && entry.feedback.focusNext && (
                            <span className="mt-1 block text-xs leading-snug text-gold-900">
                              <strong>Work on:</strong> {entry.feedback.focusNext}
                            </span>
                          )}
                        </span>
                        <span className="shrink-0 pt-1 text-xs font-bold text-forest-800" aria-hidden="true">
                          {isOpen ? "Hide ▲" : "Full review ▼"}
                        </span>
                      </button>
                    </div>
                    {isOpen && (
                      <div id={`question-panel-${i}`} className="mt-3">
                        <SessionSummaryCard entry={entry} index={i + 1} />
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        <div className="text-center sm:hidden">
          <Link href="/" className={buttonClasses({ variant: "dark", size: "md" })}>
            Try a different track
          </Link>
        </div>
      </div>

      {/* ── Next actions: sticky on phones, inline on larger screens ── */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-forest-700/60 bg-[#1C2E23]/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <div className="mx-auto flex max-w-3xl flex-col gap-2.5 sm:flex-row sm:justify-center">
          {category && (
            <Button
              variant="accent"
              size="lg"
              className="sm:min-w-[260px]"
              onClick={() =>
                router.push(`/interview?category=${encodeURIComponent(category)}&mode=${sessionMode}`)
              }
            >
              Practice this track again
            </Button>
          )}
          <Link href="/" className={buttonClasses({ variant: "dark", size: "lg", className: "hidden sm:inline-flex" })}>
            Try a different track
          </Link>
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
