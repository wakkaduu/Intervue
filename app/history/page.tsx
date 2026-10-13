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
import { analyzeSpeechDelivery } from "@/lib/speech-metrics";

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const [sessions, setSessions] = useState<StoredSession[]>([]);
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
              <Link
                href="/"
                className="w-full sm:w-auto rounded-xl bg-forest-700 hover:bg-forest-800 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md transition-all active:scale-95"
              >
                Start Practice Session
              </Link>
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full sm:w-auto rounded-xl border border-sage-300 bg-[#F0F5F1] px-6 py-2.5 text-xs sm:text-sm font-semibold text-darkslate-700 hover:bg-[#D4E3D8] transition-all"
              >
                Sign In
              </button>
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

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
            {isGuest && (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-forest-800 to-forest-700 px-4 py-2.5 text-xs sm:text-sm font-bold text-emerald-200 shadow-sm hover:from-forest-700 hover:to-forest-600 hover:text-white transition-all active:scale-95"
              >
                <span>Save to Account</span>
              </button>
            )}

            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-forest-700 hover:bg-forest-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-forest-950/40 transition-all active:scale-95 text-center"
            >
              <span>Start Practice Session</span>
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
                  You can practice freely as a guest. When you decide to create an account, sign in to save your results permanently to Supabase cloud.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="shrink-0 rounded-xl bg-forest-750 hover:bg-forest-850 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all active:scale-95 flex items-center gap-2"
            >
              <span>Save Progress to Account</span>
            </button>
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
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl bg-forest-700 hover:bg-forest-800 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all"
              >
                Start an Interview Now →
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
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 sm:p-5">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D4E3D8] text-xl">
                          {icon}
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-sm sm:text-base font-bold text-forest-950 truncate">
                            {sess.category}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-darkslate-500 mt-0.5">
                            <span>{formattedDate}</span>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1">
                              {sess.mode === "mic" ? (
                                <svg className="h-3.5 w-3.5 text-forest-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                </svg>
                              ) : (
                                <svg className="h-3.5 w-3.5 text-forest-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              )}
                              <span>{sess.mode === "mic" ? "Voice Mode" : "Written Mode"}</span>
                            </span>
                            <span>•</span>
                            <span>{sess.questionCount} Questions</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="flex items-center gap-1.5 rounded-xl bg-[#D4E3D8] border border-sage-300 px-3 py-1.5">
                          <span className="text-xs font-bold text-darkslate-600">Score:</span>
                          <span className="text-sm font-extrabold text-forest-900">
                            {sess.averageScore} / 10
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? null : sess.id)}
                          className="rounded-xl border border-sage-300 bg-[#F0F5F1] px-3 py-1.5 text-xs font-semibold text-darkslate-700 hover:bg-[#D4E3D8] transition-colors"
                        >
                          {isExpanded ? "Hide Details ▲" : "View Details ▼"}
                        </button>
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
