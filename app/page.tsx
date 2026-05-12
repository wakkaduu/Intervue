"use client";

// Home screen — Category Selection
// Requirements: 1.1, 1.2, 1.4

import { useState } from "react";
import { useRouter } from "next/navigation";
import CategoryCard from "@/components/CategoryCard";
import ErrorMessage from "@/components/ErrorMessage";
import { getCategories } from "@/lib/questions";
import type { Category } from "@/types";

const categories = getCategories();

export default function Home() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showError, setShowError] = useState(false);

  function handleStartSession() {
    if (!selectedCategory) {
      setShowError(true);
      return;
    }
    setShowError(false);
    router.push(`/interview?category=${encodeURIComponent(selectedCategory)}`);
  }

  function handleSelectCategory(category: Category) {
    setSelectedCategory(category);
    // Clear the error once the user makes a selection
    if (showError) setShowError(false);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl">
        {/* Page heading */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Mock Interview Helper
          </h1>
          <p className="mt-2 text-base text-gray-600">
            Choose a category to begin your practice session.
          </p>
        </div>

        {/* Category grid — Req 1.1 */}
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
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={handleStartSession}
            aria-describedby={showError ? "category-error" : undefined}
            className="rounded-lg bg-indigo-600 px-8 py-3 text-base font-semibold text-white shadow-sm
                       hover:bg-indigo-700
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                       focus-visible:ring-offset-2
                       disabled:cursor-not-allowed disabled:opacity-50"
          >
            Start Session
          </button>
        </div>
      </div>
    </main>
  );
}
