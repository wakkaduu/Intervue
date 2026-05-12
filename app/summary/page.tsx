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

  /** Derive a color class for the average score badge. */
  const avgBadgeClass =
    averageScore === null
      ? ""
      : averageScore >= 8
      ? "text-green-700 bg-green-50 ring-green-200"
      : averageScore >= 5
      ? "text-yellow-700 bg-yellow-50 ring-yellow-200"
      : "text-red-700 bg-red-50 ring-red-200";

  return (
    <main
      id="main-content"
      className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="mx-auto w-full max-w-3xl">

        {/* ── Page header ── */}
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600 mb-1">
            Session Complete
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Your Results
          </h1>
          <p className="mt-2 text-base text-gray-500">
            Here&apos;s a breakdown of how you did in this practice session.
          </p>
        </div>

        {/* ── Average score banner (Req 7.2) or no-answers message (Req 7.3) ── */}
        {hasEntries ? (
          <div
            className={`mb-8 flex flex-col items-center justify-center rounded-xl px-6 py-6 ring-1 shadow-sm ${avgBadgeClass}`}
            aria-label={`Session average score: ${averageScore} out of 10`}
          >
            <p className="text-sm font-semibold uppercase tracking-wide mb-1 opacity-70">
              Average Score
            </p>
            <p className="text-5xl font-bold leading-none" aria-hidden="true">
              {averageScore}
            </p>
            <p className="text-base font-medium mt-1 opacity-70" aria-hidden="true">
              / 10
            </p>
            <p className="mt-2 text-sm opacity-60">
              Across {entries.length} answered{" "}
              {entries.length === 1 ? "question" : "questions"}
            </p>
          </div>
        ) : (
          /* Req 7.3 — no answers submitted */
          <div
            role="status"
            className="mb-8 rounded-xl border border-gray-200 bg-white px-6 py-8 text-center shadow-sm"
          >
            <p className="text-lg font-semibold text-gray-700">
              No answers were submitted
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Start a new session and answer at least one question to see your
              results here.
            </p>
          </div>
        )}

        {/* ── Per-question summary cards (Req 7.1) ── */}
        {hasEntries && (
          <section aria-label="Answered questions">
            <h2 className="sr-only">Answered Questions</h2>
            <ol className="space-y-6 list-none p-0">
              {entries.map((entry, i) => (
                <li key={entry.question.id ?? i}>
                  <SessionSummaryCard entry={entry} index={i + 1} />
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* ── New Session button (Req 7.4) ── */}
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => router.push("/")}
            aria-label="Start a new session"
            className="rounded-lg bg-indigo-600 px-8 py-3 text-base font-semibold text-white shadow-sm
                       hover:bg-indigo-700 active:bg-indigo-800
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                       focus-visible:ring-offset-2
                       transition-colors duration-150"
          >
            New Session
          </button>
        </div>
      </div>
    </main>
  );
}
