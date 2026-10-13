"use client";

// Home screen — Intervue Platform Track Workspace with Left-Edge Sidebar Navigation
// Requirements: 1.1, 1.2, 1.4

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import ErrorMessage from "@/components/ErrorMessage";
import {
  CATEGORY_GROUPS,
  getCategoryIcon,
  getQuestionsByCategory,
} from "@/lib/questions";
import type { AnswerMode } from "@/types";

export default function Home() {
  const router = useRouter();
  const { selectedCategory, openSidebar } = useSidebar();
  const [answerMode, setAnswerMode] = useState<AnswerMode>("mic");
  const [showError, setShowError] = useState(false);

  // Active category domain info & questions preview
  const activeGroup = useMemo(() => {
    return CATEGORY_GROUPS.find((g) => g.categories.includes(selectedCategory));
  }, [selectedCategory]);

  const activeQuestionsPreview = useMemo(() => {
    return getQuestionsByCategory(selectedCategory).slice(0, 3);
  }, [selectedCategory]);

  function handleStartSession() {
    if (!selectedCategory) {
      setShowError(true);
      return;
    }
    setShowError(false);
    router.push(
      `/interview?category=${encodeURIComponent(selectedCategory)}&mode=${answerMode}`
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-2">
      {/* ── Elevated Hero Section ── */}
      <div className="text-center space-y-3 pb-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-forest-600/80 bg-forest-900/90 px-3.5 py-1 text-xs font-semibold text-emerald-300 shadow-xs backdrop-blur-sm">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Professional Speech & Written Interview Preparation</span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Master Every Interview with{" "}
          <span className="text-emerald-400">
            Intervue<span className="text-gold-400">.</span>
          </span>
        </h1>

        <p className="text-sm text-sage-200 max-w-xl mx-auto sm:text-base leading-relaxed">
          Prepare for admissions, tech, clinical, and leadership interviews. Choose a specialized track from the sidebar, answer by voice or written text, and receive structured feedback.
        </p>

        {/* Feature Highlights Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 pt-1 text-xs font-medium text-sage-300">
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-400 font-bold">🎙️</span>
            <span>Real-time Voice Transcription</span>
          </div>
          <span className="text-forest-600">•</span>
          <div className="flex items-center gap-1.5">
            <span className="text-gold-400 font-bold">📊</span>
            <span>Delivery & STAR Method Rubrics</span>
          </div>
          <span className="text-forest-600">•</span>
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-400 font-bold">📚</span>
            <span>624 Curated Scenarios</span>
          </div>
        </div>
      </div>

      {/* ── Active Track Card with Sidebar Open Control ── */}
      <div className="rounded-2xl border border-sage-300/80 bg-[#E2ECE5] p-6 sm:p-8 shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-sage-300/80 pb-5">
          <div className="flex items-start sm:items-center gap-3">
            <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#D4E3D8] text-2xl border border-sage-300/90 shadow-xs">
              {getCategoryIcon(selectedCategory)}
            </span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-forest-800 bg-[#D4E3D8] px-2.5 py-0.5 rounded-full border border-sage-300">
                {activeGroup?.name || "Specialized Field"}
              </span>
              <h2
                className="text-lg sm:text-2xl font-black text-forest-950 tracking-tight leading-snug mt-1 cursor-default"
                title={selectedCategory}
              >
                {selectedCategory}
              </h2>
            </div>
          </div>

          {/* Quick Button to Open Left Sidebar */}
          <button
            type="button"
            onClick={openSidebar}
            aria-label="Open sidebar to browse all 52 tracks"
            className="self-start sm:self-auto inline-flex items-center gap-2 rounded-xl border border-forest-600/80 bg-forest-800/90 px-3.5 py-2 text-xs font-bold text-emerald-200 shadow-xs hover:bg-forest-700 hover:border-forest-500 hover:text-white transition-all active:scale-95"
          >
            <svg
              className="h-4 w-4 text-emerald-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
            </svg>
            <span>Change Track (52 Available) ▾</span>
          </button>
        </div>

        <p className="text-xs sm:text-sm text-darkslate-700 leading-relaxed">
          {activeGroup?.description || "Structured mock interview scenarios designed to evaluate responses and readiness."}
        </p>

        {/* Track Highlights Badges */}
        <div className="grid grid-cols-3 gap-3 pt-1">
          <div className="rounded-xl bg-[#D4E3D8] border border-sage-300/80 p-3 text-center">
            <span className="block text-base sm:text-lg font-extrabold text-forest-900">12</span>
            <span className="text-[10px] sm:text-xs text-darkslate-600 font-medium">Practice Scenarios</span>
          </div>
          <div className="rounded-xl bg-[#D4E3D8] border border-sage-300/80 p-3 text-center">
            <span className="block text-base sm:text-lg font-extrabold text-forest-900">Dual Mode</span>
            <span className="text-[10px] sm:text-xs text-darkslate-600 font-medium">Voice & Written Ready</span>
          </div>
          <div className="rounded-xl bg-[#D4E3D8] border border-sage-300/80 p-3 text-center">
            <span className="block text-base sm:text-lg font-extrabold text-forest-900">STAR Rubric</span>
            <span className="text-[10px] sm:text-xs text-darkslate-600 font-medium">Structured Feedback</span>
          </div>
        </div>
      </div>

      {/* ── Step 1: Response Mode Selector ── */}
      <div className="rounded-2xl border border-sage-300/80 bg-[#E2ECE5] p-6 sm:p-7 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-sage-300/80 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-darkslate-600 flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-forest-700 text-[11px] font-bold text-white">1</span>
            <span>Select Response Mode</span>
          </h3>
          <span className="text-xs font-bold text-forest-800 bg-[#D4E3D8] border border-sage-300 px-2.5 py-0.5 rounded-full">
            {answerMode === "mic" ? "Voice Answering" : "Written Typing Mode"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="radiogroup" aria-label="Response Mode">
          {/* Voice Mode */}
          <button
            type="button"
            role="radio"
            aria-checked={answerMode === "mic"}
            onClick={() => setAnswerMode("mic")}
            className={`group relative flex items-start gap-4 rounded-xl border-2 p-4 text-left transition-all duration-200 ${
              answerMode === "mic"
                ? "border-forest-700 bg-[#D4E4D9] shadow-sm ring-2 ring-forest-500/20"
                : "border-sage-300 bg-[#EEF5F0] hover:border-forest-500 hover:bg-[#DCE8E0]"
            }`}
          >
            <div
              className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-xl transition-all ${
                answerMode === "mic"
                  ? "bg-forest-700 text-white shadow-sm shadow-forest-900/20"
                  : "bg-sage-200 text-darkslate-700 group-hover:bg-sage-300"
              }`}
              aria-hidden="true"
            >
              🎙️
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-forest-950 text-sm">Voice Mode</span>
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    answerMode === "mic"
                      ? "bg-forest-700 text-white shadow-xs"
                      : "bg-sage-200 text-darkslate-600"
                  }`}
                >
                  Recommended
                </span>
              </div>
              <p className="mt-1 text-xs text-darkslate-600 leading-relaxed">
                Speak into your microphone. Speech is transcribed live, assessing vocal flow, tone, and pacing.
              </p>
            </div>
          </button>

          {/* Written Mode */}
          <button
            type="button"
            role="radio"
            aria-checked={answerMode === "typed"}
            onClick={() => setAnswerMode("typed")}
            className={`group relative flex items-start gap-4 rounded-xl border-2 p-4 text-left transition-all duration-200 ${
              answerMode === "typed"
                ? "border-forest-700 bg-[#D4E4D9] shadow-sm ring-2 ring-forest-500/20"
                : "border-sage-300 bg-[#EEF5F0] hover:border-forest-500 hover:bg-[#DCE8E0]"
            }`}
          >
            <div
              className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-xl transition-all ${
                answerMode === "typed"
                  ? "bg-forest-700 text-white shadow-sm shadow-forest-900/20"
                  : "bg-sage-200 text-darkslate-700 group-hover:bg-sage-300"
              }`}
              aria-hidden="true"
            >
              ✍️
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-forest-950 text-sm">Written Mode</span>
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    answerMode === "typed"
                      ? "bg-forest-700 text-white"
                      : "bg-sage-200 text-darkslate-600"
                  }`}
                >
                  Essay Style
                </span>
              </div>
              <p className="mt-1 text-xs text-darkslate-600 leading-relaxed">
                Type structured answers directly. Ideal for crafting depth and concise STAR framework articulation.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* ── Step 2: Sample Questions Preview ── */}
      <div className="rounded-2xl border border-sage-300/80 bg-[#E2ECE5] p-6 sm:p-7 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-sage-300/80 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-darkslate-600 flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-forest-700 text-[11px] font-bold text-white">2</span>
            <span>Track Preview & Sample Scenarios</span>
          </h3>
          <span className="text-[11px] text-darkslate-500">3 of 12 questions shown</span>
        </div>

        <div className="space-y-2.5">
          {activeQuestionsPreview.map((q, idx) => (
            <div
              key={q.id || idx}
              className="flex items-start gap-3 rounded-xl bg-[#DCE7DF] border border-sage-300/80 p-3.5 text-xs text-darkslate-800 shadow-2xs hover:bg-[#D4E3D8] transition-colors"
            >
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-forest-700 text-[10px] font-bold text-white">
                {idx + 1}
              </span>
              <p className="font-medium text-darkslate-900 leading-relaxed">
                {q.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Inline Error */}
      {showError && (
        <div className="animate-shake">
          <ErrorMessage
            id="category-error"
            message="Please select an interview category track before starting your practice session."
          />
        </div>
      )}

      {/* ── Start Practice Session Button ── */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleStartSession}
          className="w-full group relative flex items-center justify-center gap-3 rounded-2xl bg-forest-700 hover:bg-forest-600 p-4 text-base font-bold text-white shadow-lg shadow-forest-950/40 transition-all duration-200 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]"
        >
          <span className="text-xl" aria-hidden="true">
            {answerMode === "mic" ? "🎙️" : "✍️"}
          </span>
          <span>
            Start {answerMode === "mic" ? "Voice" : "Written"} Practice Session (12 Questions)
          </span>
          <span className="text-gold-300 group-hover:translate-x-1 transition-transform" aria-hidden="true">
            →
          </span>
        </button>
        <p className="mt-2 text-center text-xs text-sage-300">
          Evaluated on Structure & Depth, Tone & Delivery, and Connection to the Question.
        </p>
      </div>
    </div>
  );
}


