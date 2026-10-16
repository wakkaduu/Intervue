"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { getCategoryIcon } from "@/lib/questions";
import type { StoredSession, UserAnalytics } from "@/lib/db";
import {
  getGuestSessions,
  calculateGuestAnalytics,
  syncGuestSessionsToAccount,
} from "@/lib/guest-storage";
import AuthModal from "@/components/AuthModal";
import Button, { buttonClasses } from "@/components/ui/Button";
import { scoreVerdict } from "@/lib/score-verdict";
import { analyzeSpeechDelivery } from "@/lib/speech-metrics";
import ScoreTrendChart from "@/components/ScoreTrendChart";
import { buildTrendPoints, shortCategory, summarizeTrend, trackOptions } from "@/lib/progress-trend";

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const [sessions, setSessions] = useState<StoredSession[]>([]);
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [trendTrack, setTrendTrack] = useState<string>("all");

  useEffect(() => {
    if (status === "authenticated") {
      setIsGuest(false);
      fetchHistory();
    } else if (status === "unauthenticated") {
      const localGuestSessions = getGuestSessions();
      if (localGuestSessions.length > 0) {
        setSessions(localGuestSessions);
        setAnalytics(calculateGuestAnalytics());
        setIsGuest(true);
      } else {
        setSessions([]);
        setAnalytics(null);
        setIsGuest(false);
      }
      setLoading(false);
    }
  }, [status]);

  async function fetchHistory() {
    setLoading(true);
    try {
      // First attempt to sync any lingering guest sessions if user just logged in
      try {
        await syncGuestSessionsToAccount();
      } catch {
        // ignore
      }

      const res = await fetch("/api/history");
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
        setAnalytics(data.analytics || null);
        setIsGuest(false);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-forest-600 border-t-emerald-300" />
        <p className="text-sm font-semibold text-sage-200">Loading your interview history...</p>
      </div>
    );
  }

  if (status === "unauthenticated" && !isGuest) {
    return (
      <div className="py-16">
        <div className="mx-auto max-w-lg px-4 text-center">
          <div className="rounded-3xl border border-sage-300 bg-[#E2ECE5] p-8 sm:p-10 shadow-2xl space-y-5">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-850 text-white shadow-sm border border-forest-700/60">
              <svg className="h-6 w-6 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold text-forest-950">
                Practice freely without an account
              </h1>
              <p className="text-xs sm:text-sm text-darkslate-600 max-w-sm mx-auto">
                You can complete any of the 52 interview tracks freely as a guest. When you complete sessions, your results will appear here.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/" className={buttonClasses({ variant: "primary", size: "md", className: "w-full sm:w-auto" })}>
                Start practice session
              </Link>
              <Button variant="secondary" size="md" className="w-full sm:w-auto" onClick={() => setIsAuthModalOpen(true)}>
                Sign in
              </Button>
            </div>
          </div>
        </div>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={fetchHistory}
        />
      </div>
    );
  }

  const tracks = trackOptions(sessions);
  const activeTrack = trendTrack !== "all" && tracks.some((t) => t.category === trendTrack) ? trendTrack : null;
  const trendPoints = buildTrendPoints(sessions, activeTrack);
  const trend = summarizeTrend(trendPoints);

  return (
    <div className="py-6 sm:py-10">
      <div className="mx-auto max-w-5xl px-3 sm:px-6 space-y-6 sm:space-y-8">
        {/* Header Profile Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-forest-700/60 pb-6">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-forest-850 text-emerald-200 text-lg font-bold shadow-lg border border-forest-750 shrink-0">
              {isGuest ? (
                <svg className="h-6 w-6 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              ) : (
                session?.user?.name?.charAt(0) || "U"
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {isGuest ? "Guest Candidate" : session?.user?.name || "Candidate"}
                </h1>
                <span className="rounded-full bg-forest-900 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 uppercase">
                  {isGuest ? "Guest Mode" : "Verified Candidate"}
                </span>
              </div>
              <p className="text-xs text-sage-300 font-medium">
                {isGuest ? "Progress stored locally on this device" : session?.user?.email}
              </p>
            </div>
          </div>

          <div className="flex w-full flex-wrap items-center gap-2.5 sm:w-auto sm:gap-3">
            <Link href="/" className={buttonClasses({ variant: "accent", size: "md", className: "w-full sm:w-auto" })}>
              Start practice session
            </Link>
          </div>
        </div>

        {/* Guest Mode Notification Banner */}
        {isGuest && (
          <div className="rounded-2xl border border-emerald-500/40 bg-[#E2ECE5] p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-start sm:items-center gap-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest-850 text-white shadow-xs border border-forest-750">
                <svg className="h-5 w-5 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              </span>
              <div>
                <h2 className="text-sm font-extrabold text-forest-950 flex items-center gap-2">
                  <span>Guest History Active ({sessions.length} sessions stored locally)</span>
                  <span className="rounded-full bg-forest-100 border border-forest-300 px-2 py-0.5 text-[10px] font-bold text-forest-800">
                    Local Device
                  </span>
                </h2>
                <p className="text-xs text-darkslate-600 mt-0.5">
                  Your sessions are saved in this browser only. Create a free account to keep them across devices.
                </p>
              </div>
            </div>
            <Button variant="primary" size="md" className="shrink-0" onClick={() => setIsAuthModalOpen(true)}>
              Save progress to account
            </Button>
          </div>
        )}

        {/* Analytics KPI Cards */}
        {analytics && (
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
            <div className="rounded-2xl border border-sage-300/80 bg-[#E2ECE5] p-5 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-darkslate-500 block mb-1">
                Completed Sessions
              </span>
              <span className="text-2xl sm:text-3xl font-black text-forest-950">
                {analytics.totalSessions}
              </span>
            </div>

            <div className="rounded-2xl border border-sage-300/80 bg-[#E2ECE5] p-5 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-darkslate-500 block mb-1">
                Average Score
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black text-forest-800">
                  {analytics.averageScore > 0 ? analytics.averageScore : "—"}
                </span>
                {analytics.averageScore > 0 && (
                  <span className="text-xs font-semibold text-darkslate-400">/ 10</span>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-sage-300/80 bg-[#E2ECE5] p-5 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-darkslate-500 block mb-1">
                Questions Answered
              </span>
              <span className="text-2xl sm:text-3xl font-black text-forest-950">
                {analytics.totalQuestionsAnswered}
              </span>
            </div>

            <div className="rounded-2xl border border-sage-300/80 bg-[#E2ECE5] p-5 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-darkslate-500 block mb-1">
                Tracks Explored
              </span>
              <span className="text-2xl sm:text-3xl font-black text-forest-950">
                {analytics.completedCategories.length}
              </span>
            </div>
          </div>
        )}

        {/* Progress trend */}
        {sessions.length > 0 && (
          <section aria-labelledby="progress-heading" className="rounded-2xl border border-sage-300/80 bg-[#E2ECE5] p-5 shadow-sm space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 id="progress-heading" className="text-base font-extrabold text-forest-950">
                  Your progress
                </h2>
                <p className="text-xs text-darkslate-600">Average score per practice session (out of 10)</p>
              </div>
              {tracks.length > 1 && (
                <div>
                  <label htmlFor="trend-track" className="sr-only">
                    Show progress for
                  </label>
                  <select
                    id="trend-track"
                    value={activeTrack ?? "all"}
                    onChange={(e) => setTrendTrack(e.target.value)}
                    className="min-h-[44px] w-full max-w-full rounded-lg border border-sage-300 bg-[#F0F5F1] px-3 py-2 text-xs font-semibold text-darkslate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600 sm:w-64"
                  >
                    <option value="all">All tracks ({sessions.length})</option>
                    {tracks.map((t) => (
                      <option key={t.category} value={t.category}>
                        {shortCategory(t.category)} ({t.count})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {trend && trend.count >= 2 && (
              <p className="text-sm font-semibold text-darkslate-900" aria-live="polite">
                <span aria-hidden="true">
                  {trend.direction === "up" ? "↑ " : trend.direction === "down" ? "↓ " : "→ "}
                </span>
                {trend.direction === "flat"
                  ? `Holding steady at ${trend.latest.toFixed(1)}`
                  : `${trend.direction === "up" ? "Up" : "Down"} ${Math.abs(trend.delta ?? 0).toFixed(1)} points`}
                <span className="font-normal text-darkslate-600"> {trend.deltaLabel} · best {trend.best.toFixed(1)}</span>
              </p>
            )}

            {trend && trend.count >= 2 ? (
              <ScoreTrendChart points={trendPoints} />
            ) : trend ? (
              <div className="rounded-xl bg-[#F0F5F1] border border-sage-300/70 p-5 text-center">
                <p className="text-5xl font-black tracking-tight text-forest-900">
                  {trend.latest.toFixed(1)}
                  <span className="text-xl font-bold text-darkslate-500"> / 10</span>
                </p>
                <p className="mt-2 text-sm text-darkslate-700">
                  Complete one more {activeTrack ? "session in this track" : "session"} and your trend line appears here.
                </p>
              </div>
            ) : (
              <p className="rounded-xl bg-[#F0F5F1] border border-sage-300/70 p-5 text-center text-sm text-darkslate-700">
                No sessions in this track yet.
              </p>
            )}
          </section>
        )}

        {/* Strengths & Improvement Insights */}
        {analytics && (analytics.topStrengths.length > 0 || analytics.areasForImprovement.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {analytics.topStrengths.length > 0 && (
              <div className="rounded-2xl border border-sage-300/80 bg-[#E2ECE5] p-5 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-forest-800 mb-3 flex items-center gap-1.5">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-forest-100 text-forest-800 text-[10px] font-bold">✓</span>
                  <span>Top Identified Strengths</span>
                </h3>
                <ul className="space-y-1.5 text-xs text-forest-950">
                  {analytics.topStrengths.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-forest-600 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analytics.areasForImprovement.length > 0 && (
              <div className="rounded-2xl border border-sage-300/80 bg-[#E2ECE5] p-5 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gold-900 mb-3 flex items-center gap-1.5">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-gold-100 text-gold-800 text-[10px] font-bold">→</span>
                  <span>Key Areas for Polish</span>
                </h3>
                <ul className="space-y-1.5 text-xs text-gold-950">
                  {analytics.areasForImprovement.map((a, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gold-600 shrink-0" />
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Sessions History List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-forest-700/60 pb-3">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Past Practice Sessions
            </h2>
            <span className="text-xs text-sage-300">
              {sessions.length} {sessions.length === 1 ? "session" : "sessions"} recorded
            </span>
          </div>

          {sessions.length === 0 ? (
            <div className="rounded-2xl border border-sage-300 bg-[#E2ECE5] p-10 text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sage-200/80 text-darkslate-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-darkslate-800">
                  No practice sessions saved yet
                </p>
                <p className="text-xs text-darkslate-600 max-w-md mx-auto">
                  Complete your first interview practice session and it will automatically be cataloged here with full performance evaluations.
                </p>
              </div>
              <Link href="/" className={buttonClasses({ variant: "primary", size: "md" })}>
                Start your first interview →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((sess) => {
                const icon = getCategoryIcon(sess.category);
                const isExpanded = expandedId === sess.id;
                const formattedDate = new Date(sess.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={sess.id}
                    className="rounded-2xl border border-sage-300/90 bg-[#E2ECE5] shadow-sm overflow-hidden transition-all"
                  >
                    {/* Header Row */}
                    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D4E3D8] text-xl" aria-hidden="true">
                          {icon}
                        </span>
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-bold text-forest-950 sm:text-base" title={sess.category}>
                            {shortCategory(sess.category)}
                          </h3>
                          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-darkslate-600">
                            <span>{formattedDate}</span>
                            <span aria-hidden="true">·</span>
                            <span>{sess.mode === "mic" ? "Voice" : "Written"}</span>
                            <span aria-hidden="true">·</span>
                            <span>{sess.questionCount} {sess.questionCount === 1 ? "question" : "questions"}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 sm:justify-end">
                        <div
                          className="whitespace-nowrap rounded-xl border border-sage-300 bg-[#D4E3D8] px-3 py-1.5 text-center"
                          aria-label={`Score ${sess.averageScore} out of 10, ${scoreVerdict(sess.averageScore).label}`}
                        >
                          <span className="text-sm font-extrabold tabular-nums text-forest-900">
                            {sess.averageScore} / 10
                          </span>
                          <span className="ml-2 hidden text-[11px] font-semibold text-darkslate-600 sm:inline">
                            {scoreVerdict(sess.averageScore).label}
                          </span>
                        </div>

                        <Button
                          variant="secondary"
                          size="sm"
                          aria-expanded={isExpanded}
                          onClick={() => setExpandedId(isExpanded ? null : sess.id)}
                        >
                          {isExpanded ? "Hide details ▲" : "View details ▼"}
                        </Button>
                      </div>
                    </div>

                    {/* Expandable Details Accordion */}
                    {isExpanded && (
                      <div className="border-t border-sage-300/80 bg-[#DCE7DF]/60 p-4 sm:p-6 space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-darkslate-600">
                          Question-by-Question Breakdown
                        </h4>
                        <div className="space-y-3">
                          {sess.entries.map((entry, idx) => (
                            <div
                              key={idx}
                              className="rounded-xl border border-sage-300 bg-[#F0F5F1] p-4 space-y-2 shadow-xs"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-xs font-bold text-forest-800">
                                  Q{idx + 1}: {entry.question.text}
                                </span>
                                <span className="rounded-lg bg-forest-100 px-2 py-0.5 text-xs font-bold text-forest-900 shrink-0">
                                  {entry.feedback.score} / 10
                                </span>
                              </div>
                              <p className="text-xs text-darkslate-700 bg-[#E2ECE5] p-2.5 rounded-lg whitespace-pre-wrap leading-relaxed">
                                {entry.answer}
                              </p>

                              {/* Speech delivery pacing & filler micro-badge */}
                              {(() => {
                                const dur =
                                  entry.durationSeconds && entry.durationSeconds > 0
                                    ? entry.durationSeconds
                                    : Math.max(10, Math.round(entry.answer.split(/\s+/).length / 2.3));
                                const dm = analyzeSpeechDelivery(entry.answer, dur);
                                return (
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100/90 border border-emerald-300/80 px-2 py-0.5 text-[10px] font-bold text-emerald-950">
                                      {dm.wpm} WPM ({dm.paceLabel.split(" ")[0]})
                                    </span>
                                    <span
                                      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold ${
                                        dm.fillerCount > 0
                                          ? "bg-amber-100/90 border-amber-300/80 text-amber-950"
                                          : "bg-emerald-100/90 border-emerald-300/80 text-emerald-950"
                                      }`}
                                    >
                                      {dm.fillerCount > 0
                                        ? `${dm.fillerCount} Fillers`
                                        : "0 Fillers"}
                                    </span>
                                  </div>
                                );
                              })()}

                              <p className="text-xs text-darkslate-700">
                                <span className="font-semibold text-forest-900">Recommendation:</span> {entry.feedback.summary}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
