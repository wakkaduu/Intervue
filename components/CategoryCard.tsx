"use client";

import type { Category } from "@/types";

interface CategoryCardProps {
  /** The interview category this card represents. */
  category: Category;
  /** Whether this category is currently selected. Controls aria-pressed and visual state. */
  selected: boolean;
  /** Called with the category value when the user activates this card. */
  onSelect: (category: Category) => void;
}

/**
 * CategoryCard — selectable category tile rendered as a <button>.
 *
 * Accessibility:
 *   - Rendered as a native <button> so it is keyboard-focusable by default (Req 8.3, 8.4)
 *   - aria-pressed reflects the selected state for screen readers (design §CategoryCard)
 *   - Visible label is the category name text (Req 8.3)
 *   - focus-visible ring: 2px outline with ≥3:1 contrast against adjacent colors (Req 8.4)
 *
 * Visual states:
 *   - Default:  white background, gray border, dark text
 *   - Selected: indigo background, indigo border, white text — visually distinct (Req 1.1)
 *   - Hover:    subtle background lift on unselected cards
 */
export default function CategoryCard({ category, selected, onSelect }: CategoryCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(category)}
      className={[
        // Base layout & typography
        "w-full rounded-lg border-2 px-4 py-5 text-left text-sm font-semibold transition-colors duration-150",
        // Focus-visible ring — 2px outline, indigo ring with offset for ≥3:1 contrast (Req 8.4)
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
        // Selected vs. unselected visual states
        selected
          ? "border-indigo-600 bg-indigo-600 text-white shadow-md"
          : "border-gray-300 bg-white text-gray-800 hover:border-indigo-400 hover:bg-indigo-50",
      ].join(" ")}
    >
      {/* Category icon indicator — filled dot when selected, hollow when not */}
      <span
        aria-hidden="true"
        className={[
          "mb-2 block h-3 w-3 rounded-full",
          selected ? "bg-white" : "bg-indigo-200",
        ].join(" ")}
      />

      {/* Visible label — serves as the accessible name (Req 8.3) */}
      <span className="block leading-snug">{category}</span>
    </button>
  );
}
