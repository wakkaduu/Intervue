"use client";

import type { Category } from "@/types";
import { getCategoryIcon } from "@/lib/questions";

interface CategoryCardProps {
  /** The interview category this card represents. */
  category: Category;
  /** Whether this category is currently selected. Controls aria-pressed and visual state. */
  selected: boolean;
  /** Called with the category value when the user activates this card. */
  onSelect: (category: Category) => void;
  /** Visual variant: "card" (grid tile) or "sidebar" (sleek navigation list row). Defaults to "sidebar". */
  variant?: "card" | "sidebar";
}

/**
 * CategoryCard — selectable category item supporting grid tile and sidebar navigation modes.
 */
export default function CategoryCard({
  category,
  selected,
  onSelect,
  variant = "sidebar",
}: CategoryCardProps) {
  const icon = getCategoryIcon(category);

  if (variant === "sidebar") {
    return (
      <button
        type="button"
        title={category}
        aria-label={`Select track: ${category}`}
        aria-pressed={selected}
        onClick={() => onSelect(category)}
        className={[
          "group relative flex items-center justify-between w-full rounded-xl px-3 py-2.5 text-left transition-all duration-150 border",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600",
          selected
            ? "border-forest-700 bg-gradient-to-r from-[#D2E2D6] via-[#DEEAE1] to-[#D2E2D6] text-forest-950 font-bold shadow-xs ring-1 ring-forest-600/30"
            : "border-transparent bg-transparent text-darkslate-700 hover:bg-sage-200/60 hover:text-darkslate-900",
        ].join(" ")}
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          <span
            className={[
              "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-sm transition-colors",
              selected
                ? "bg-forest-700 text-white shadow-xs"
                : "bg-sage-100 text-darkslate-600 group-hover:bg-sage-200",
            ].join(" ")}
            aria-hidden="true"
          >
            {icon}
          </span>
          <span className="block text-xs sm:text-[13px] leading-snug truncate">
            {category}
          </span>
        </div>

        <span
          className={[
            "flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors",
            selected
              ? "bg-gold-100 text-gold-900 border border-gold-300/70"
              : "bg-sage-100 text-darkslate-500 group-hover:bg-sage-200",
          ].join(" ")}
        >
          12 Qs
        </span>
      </button>
    );
  }

  // Fallback "card" tile variant
  return (
    <button
      type="button"
      title={category}
      aria-label={`Select track: ${category}`}
      aria-pressed={selected}
      onClick={() => onSelect(category)}
      className={[
        "group relative flex flex-col justify-between w-full rounded-xl border-2 p-4 text-left transition-all duration-150 min-h-[110px]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600 focus-visible:ring-offset-2",
        selected
          ? "border-forest-700 bg-forest-700 text-white shadow-md ring-2 ring-forest-500/30"
          : "border-sage-300 bg-[#E2ECE5] text-darkslate-900 hover:border-forest-500 hover:bg-[#D5E3DA] hover:shadow-sm",
      ].join(" ")}
    >
      <div className="flex items-center justify-between w-full mb-2">
        <span
          className={[
            "flex h-8 w-8 items-center justify-center rounded-lg text-lg transition-colors",
            selected ? "bg-white/20 text-white" : "bg-sage-100 text-darkslate-700 group-hover:bg-forest-100",
          ].join(" ")}
          aria-hidden="true"
        >
          {icon}
        </span>
        <span
          className={[
            "h-2 w-2 rounded-full transition-colors",
            selected ? "bg-gold-400" : "bg-sage-300 group-hover:bg-forest-400",
          ].join(" ")}
          aria-hidden="true"
        />
      </div>

      <div>
        <span className="block font-semibold text-sm leading-snug">
          {category}
        </span>
        <span
          className={[
            "block mt-1 text-xs font-normal",
            selected ? "text-sage-100" : "text-darkslate-400",
          ].join(" ")}
        >
          12 practice questions
        </span>
      </div>
    </button>
  );
}
