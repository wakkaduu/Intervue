"use client";

// Home screen — Intervue Platform Category & Mode Selection
// Requirements: 1.1, 1.2, 1.4

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import CategoryCard from "@/components/CategoryCard";
import ErrorMessage from "@/components/ErrorMessage";
import { getCategories, CATEGORY_GROUPS } from "@/lib/questions";
import type { AnswerMode, Category } from "@/types";

const allCategories = getCategories();

export default function Home() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [answerMode, setAnswerMode] = useState<AnswerMode>("mic");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showError, setShowError] = useState(false);

  // Filter categories by selected domain group and instant search query
  const filteredCategories = useMemo(() => {
    let list = allCategories;

    if (selectedGroupId !== "all") {
      const group = CATEGORY_GROUPS.find((g) => g.id === selectedGroupId);
      if (group) {
        list = group.categories;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((cat) => cat.toLowerCase().includes(q));
    }

    return list;
  }, [selectedGroupId, searchQuery]);

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

  function handleSelectCategory(category: Category) {
    setSelectedCategory(category);
    if (showError) setShowError(false);
  }

  return (
    <div className="flex flex-col items-center justify-center py-4 sm:py-8">
      <div className="w-full max-w-4xl space-y-10">
        {/* ── Hero Section ── */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50/80 px-3.5 py-1 text-xs font-semibold text-indigo-700 shadow-xs backdrop-blur-sm animate-pulse-subtle">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-ping" />
            <span>AI-Powered Speech & Written Coaching</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Master Every Interview with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600">
              Intervue
            </span>
          </h1>

          <p className="mt-3 text-base text-slate-600 max-w-2xl mx-auto sm:text-lg leading-relaxed">
            Practice realistic questions across 32 specialized tracks. Answer by voice or written text, then receive expert feedback on your structure, delivery tone, and relevance.
          </p>

          {/* Feature Highlights Bar */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-2 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="text-indigo-600 font-bold">🎙️</span>
              <span>Whisper Voice Engine</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5">
              <span className="text-violet-600 font-bold">🤖</span>
              <span>Gemini Tone & STAR Analysis</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-600 font-bold">📚</span>
              <span>384+ Curated Scenarios</span>
            </div>
          </div>
        </div>

        {/* ── Step 1: Answering Mode Selection ── */}
        <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white/70 p-6 shadow-xs backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-bold text-indigo-700">1</span>
              <span>Choose Your Response Mode</span>
            </h2>
            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
              {answerMode === "mic" ? "Voice Answering (Mic)" : "Written Typing Mode"}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2" role="radiogroup" aria-label="Answer Mode">
            {/* Voice Mode */}
            <button
              type="button"
              role="radio"
              aria-checked={answerMode === "mic"}
              onClick={() => setAnswerMode("mic")}
              className={`group relative flex items-start gap-4 rounded-xl border-2 p-5 text-left transition-all duration-200 ${
                answerMode === "mic"
                  ? "border-indigo-600 bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/50 shadow-md ring-2 ring-indigo-500/20"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80"
              }`}
            >
              <div
                className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-2xl transition-all duration-200 ${
                  answerMode === "mic"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-105"
                    : "bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-600"
                }`}
                aria-hidden="true"
              >
                🎙️
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-base">Voice Mode</span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      answerMode === "mic"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    Recommended
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                  Speak your answers into the microphone. Whisper transcribes your words while Gemini assesses your vocal tone, composure, and delivery flow.
                </p>
              </div>
            </button>

            {/* Written Mode */}
            <button
              type="button"
              role="radio"
              aria-checked={answerMode === "typed"}
              onClick={() => setAnswerMode("typed")}
              className={`group relative flex items-start gap-4 rounded-xl border-2 p-5 text-left transition-all duration-200 ${
                answerMode === "typed"
                  ? "border-indigo-600 bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/50 shadow-md ring-2 ring-indigo-500/20"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80"
              }`}
            >
              <div
                className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-2xl transition-all duration-200 ${
                  answerMode === "typed"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-105"
                    : "bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-600"
                }`}
                aria-hidden="true"
              >
                ✍️
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-base">Written Mode</span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      answerMode === "typed"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    Essay & Depth
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                  Type your answers directly in the structured editor. Ideal for practicing depth, problem breakdown, and concise STAR framework articulation.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* ── Step 2: Category Selection ── */}
        <div className="space-y-5 rounded-2xl border border-slate-200/80 bg-white/70 p-6 shadow-xs backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-bold text-indigo-700">2</span>
                <span>Select Your Interview Track ({allCategories.length} Tracks)</span>
              </h2>
              {selectedCategory && (
                <p className="text-xs text-indigo-700 font-semibold mt-1">
                  Selected track: <span className="underline decoration-indigo-300">{selectedCategory}</span>
                </p>
              )}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search tracks (e.g. medical, law, YC)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white/90 pl-9 pr-8 py-2.5 text-xs text-slate-900 shadow-xs placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
              <span className="absolute left-3 top-3 text-slate-400 text-xs" aria-hidden="true">
                🔍
              </span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 text-xs"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Group Filter Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-slate-200/70 pb-3">
            <button
              type="button"
              onClick={() => setSelectedGroupId("all")}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                selectedGroupId === "all"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              All Tracks ({allCategories.length})
            </button>
            {CATEGORY_GROUPS.map((group) => (
              <button
                type="button"
                key={group.id}
                onClick={() => setSelectedGroupId(group.id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  selectedGroupId === group.id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                <span>{group.icon}</span>
                <span>{group.name}</span>
                <span className="opacity-70 text-[10px]">({group.categories.length})</span>
              </button>
            ))}
          </div>

          {/* Category Cards Grid */}
          {filteredCategories.length > 0 ? (
            <div
              className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 max-h-[540px] overflow-y-auto p-1 pr-2 scrollbar-thin"
              role="group"
              aria-label="Interview categories"
            >
              {filteredCategories.map((category) => (
                <CategoryCard
                  key={category}
                  category={category}
                  selected={selectedCategory === category}
                  onSelect={handleSelectCategory}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/50 p-10 text-center space-y-3">
              <span className="text-3xl" aria-hidden="true">🔍</span>
              <p className="text-sm font-semibold text-slate-800">
                No interview tracks found matching &quot;{searchQuery}&quot;
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try searching for a different profession, academic field, or clear your search to browse all categories.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedGroupId("all");
                }}
                className="mt-2 inline-flex items-center rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </div>

        {/* Inline error */}
        {showError && (
          <div className="animate-shake">
            <ErrorMessage
              id="category-error"
              message="Please select an interview category track before starting your practice session."
            />
          </div>
        )}

        {/* Start Session CTA */}
        <div className="pt-2 flex flex-col items-center gap-3 text-center">
          <button
            type="button"
            onClick={handleStartSession}
            aria-describedby={showError ? "category-error" : undefined}
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 px-10 py-4 text-base font-bold text-white shadow-xl shadow-indigo-600/25 transition-all duration-200 hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-600/35 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="text-xl" aria-hidden="true">
              {answerMode === "mic" ? "🎙️" : "✍️"}
            </span>
            <span>
              Start {answerMode === "mic" ? "Voice" : "Written"} Session
              {selectedCategory ? ` • ${selectedCategory.split("(")[0].trim()}` : ""}
            </span>
            <span className="text-indigo-200 group-hover:translate-x-1 transition-transform" aria-hidden="true">
              →
            </span>
          </button>

          {selectedCategory ? (
            <p className="text-xs font-medium text-slate-500">
              12 questions in this track • Evaluated on Structure, Tone, and Question Connection
            </p>
          ) : (
            <p className="text-xs text-slate-400">
              Select an interview track above to begin
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
