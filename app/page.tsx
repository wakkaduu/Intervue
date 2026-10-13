"use client";

// Home screen — Category & Mode Selection
// Requirements: 1.1, 1.2, 1.4

import { useState } from "react";
import { useRouter } from "next/navigation";
import CategoryCard from "@/components/CategoryCard";
import ErrorMessage from "@/components/ErrorMessage";
import { getCategories } from "@/lib/questions";
import type { AnswerMode, Category } from "@/types";

const categories = getCategories();

export default function Home() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [answerMode, setAnswerMode] = useState<AnswerMode>("mic");
  const [showError, setShowError] = useState(false);

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
    // Clear the error once the user makes a selection
    if (showError) setShowError(false);
  }

  return (
    <div className="flex flex-col items-center justify-center py-6">
      <div className="w-full max-w-3xl space-y-8">
        {/* Page heading */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Mock Interview Helper
          </h1>
          <p className="mt-2 text-base text-gray-600">
            Choose an answering mode and category to begin your practice session.
          </p>
        </div>

        {/* ── Step 1: Answering Mode Selection ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              1. Choose How You Will Answer
            </h2>
            <span className="text-xs text-indigo-600 font-medium">
              {answerMode === "mic" ? "Voice-only answering" : "Written typing mode"}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2" role="radiogroup" aria-label="Answer Mode">
            {/* Voice Mode */}
            <button
              type="button"
              role="radio"
              aria-checked={answerMode === "mic"}
              onClick={() => setAnswerMode("mic")}
              className={`flex items-start gap-4 rounded-xl border p-4 text-left transition-all ${
                answerMode === "mic"
                  ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500 shadow-sm"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
              }`}
            >
              <div
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-xl ${
                  answerMode === "mic" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"
                }`}
                aria-hidden="true"
              >
                🎙️
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Voice Mode</span>
                  {answerMode === "mic" && (
                    <span className="text-xs font-semibold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                      Selected
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                  Answer strictly using your microphone. Questions must be spoken aloud to practice speech and tone.
                </p>
              </div>
            </button>

            {/* Written Mode */}
            <button
              type="button"
              role="radio"
              aria-checked={answerMode === "typed"}
              onClick={() => setAnswerMode("typed")}
              className={`flex items-start gap-4 rounded-xl border p-4 text-left transition-all ${
                answerMode === "typed"
                  ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500 shadow-sm"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
              }`}
            >
              <div
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-xl ${
                  answerMode === "typed" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"
                }`}
                aria-hidden="true"
              >
                ✍️
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Written Mode</span>
                  {answerMode === "typed" && (
                    <span className="text-xs font-semibold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                      Selected
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                  Answer by typing in the editor. Focus on structuring comprehensive, thoughtful written answers.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* ── Step 2: Category Selection ── */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            2. Select Interview Category
          </h2>

          <div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            role="group"
            aria-label="Interview categories"
          >
            {categories.map((category) => (
              <CategoryCard
                key={category}
                category={category}
                selected={selectedCategory === category}
                onSelect={handleSelectCategory}
              />
            ))}
          </div>
        </div>

        {/* Inline error — Req 1.4 */}
        {showError && (
          <div className="mt-4">
            <ErrorMessage
              id="category-error"
              message="Please select a category before starting your session."
            />
          </div>
        )}

        {/* Start Session button */}
        <div className="pt-2 flex justify-center">
          <button
            type="button"
            onClick={handleStartSession}
            aria-describedby={showError ? "category-error" : undefined}
            className="rounded-lg bg-indigo-600 px-8 py-3 text-base font-semibold text-white shadow-sm
                       hover:bg-indigo-700 active:bg-indigo-800
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                       focus-visible:ring-offset-2
                       disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
          >
            Start {answerMode === "mic" ? "Voice" : "Written"} Session
          </button>
        </div>
      </div>
    </div>
  );
}
