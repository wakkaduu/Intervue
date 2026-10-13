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
}

/**
 * CategoryCard — selectable category tile with domain icon and question count.
 */
export default function CategoryCard({ category, selected, onSelect }: CategoryCardProps) {
  const icon = getCategoryIcon(category);

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(category)}
      className={[
        "group relative flex flex-col justify-between w-full rounded-xl border-2 p-4 text-left transition-all duration-150 min-h-[110px]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
        selected
          ? "border-indigo-600 bg-indigo-600 text-white shadow-md ring-2 ring-indigo-500/30"
          : "border-gray-200 bg-white text-gray-900 hover:border-indigo-300 hover:bg-indigo-50/40 hover:shadow-sm",
      ].join(" ")}
    >
      <div className="flex items-center justify-between w-full mb-2">
        <span
          className={[
            "flex h-8 w-8 items-center justify-center rounded-lg text-lg transition-colors",
            selected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-700 group-hover:bg-indigo-100",
          ].join(" ")}
          aria-hidden="true"
        >
          {icon}
        </span>
        <span
          className={[
            "h-2 w-2 rounded-full transition-colors",
            selected ? "bg-white" : "bg-gray-300 group-hover:bg-indigo-400",
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
            selected ? "text-indigo-100" : "text-gray-400",
          ].join(" ")}
        >
          12 practice questions
        </span>
      </div>
    </button>
  );
}
