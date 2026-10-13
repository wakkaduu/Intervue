"use client";

import { useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { getCategories, CATEGORY_GROUPS, getCategoryIcon } from "@/lib/questions";
import type { Category } from "@/types";

const allCategories = getCategories();

interface HoveredTrackInfo {
  category: Category;
  icon: string;
  groupName: string;
  top: number;
  right: number;
  bottom: number;
  left: number;
}

function parseCategoryName(category: string): { title: string; details: string | null } {
  const match = category.match(/^(.*?)\s*\((.*?)\)$/);
  if (match) {
    return {
      title: match[1].trim(),
      details: match[2].trim(),
    };
  }
  return {
    title: category,
    details: null,
  };
}

export default function CategorySidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isSidebarOpen, closeSidebar, selectedCategory, setSelectedCategory } = useSidebar();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("all");
  const [hoveredTrack, setHoveredTrack] = useState<HoveredTrackInfo | null>(null);

  function handleCategoryMouseEnter(
    e: React.MouseEvent<HTMLButtonElement>,
    cat: Category,
    groupName?: string
  ) {
    const rect = e.currentTarget.getBoundingClientRect();
    const group =
      groupName ||
      CATEGORY_GROUPS.find((g) => g.categories.includes(cat))?.name ||
      "Interview Track";
    setHoveredTrack({
      category: cat,
      icon: getCategoryIcon(cat),
      groupName: group,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      left: rect.left,
    });
  }

  function handleCategoryFocus(
    e: React.FocusEvent<HTMLButtonElement>,
    cat: Category,
    groupName?: string
  ) {
    const rect = e.currentTarget.getBoundingClientRect();
    const group =
      groupName ||
      CATEGORY_GROUPS.find((g) => g.categories.includes(cat))?.name ||
      "Interview Track";
    setHoveredTrack({
      category: cat,
      icon: getCategoryIcon(cat),
      groupName: group,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      left: rect.left,
    });
  }

  function handleCategoryLeave() {
    setHoveredTrack(null);
  }

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

  // Group filtered categories by domain for structured accordion/section view
  const groupedCategories = useMemo(() => {
    if (searchQuery.trim() || selectedGroupId !== "all") {
      return null;
    }

    return CATEGORY_GROUPS.map((group) => ({
      ...group,
      categories: group.categories.filter((cat) => allCategories.includes(cat)),
    }));
  }, [searchQuery, selectedGroupId]);

  function handleSelect(category: Category) {
    setSelectedCategory(category);
    setHoveredTrack(null);
    closeSidebar();

    if (pathname !== "/") {
      router.push("/");
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-forest-950/40 backdrop-blur-xs transition-opacity duration-300 ${
          isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      {/* Left-edge Pinned Sidebar */}
      <aside
        id="category-sidebar"
        aria-label="Interview tracks sidebar navigation"
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-80 sm:w-96 bg-[#E2ECE5] border-r border-forest-700/60 shadow-2xl transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-sage-300/80 bg-[#D4E3D8]">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest-700 text-white shadow-xs text-sm">
              📁
            </span>
            <div>
              <h2 className="text-sm font-bold text-forest-900 leading-tight">
                Interview Tracks
              </h2>
              <p className="text-[11px] text-darkslate-500 font-medium">
                {allCategories.length} Specialized Fields
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeSidebar}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-darkslate-400 hover:bg-sage-200/60 hover:text-darkslate-700 transition-colors"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filter Controls (Search + Domain Pills) */}
        <div className="p-4 border-b border-sage-300/80 space-y-3 bg-[#E2ECE5]">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Filter tracks (e.g. medical, law, coding)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-sage-300 bg-[#F0F5F1] pl-8 pr-7 py-2 text-xs text-darkslate-900 placeholder:text-darkslate-400 focus:bg-[#E8F0EA] focus:border-forest-600 focus:outline-none focus:ring-2 focus:ring-forest-500/20 transition-all"
            />
            <span className="absolute left-2.5 top-2.5 text-darkslate-400 text-xs" aria-hidden="true">
              🔍
            </span>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-2 rounded-full p-0.5 text-darkslate-400 hover:text-darkslate-600 text-xs"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Domain Chips */}
          <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1 scrollbar-thin">
            <button
              type="button"
              onClick={() => setSelectedGroupId("all")}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                selectedGroupId === "all"
                  ? "bg-forest-700 text-white shadow-xs"
                  : "bg-sage-100 text-darkslate-600 hover:bg-sage-200"
              }`}
            >
              All
            </button>
            {CATEGORY_GROUPS.map((group) => (
              <button
                type="button"
                key={group.id}
                onClick={() => setSelectedGroupId(group.id)}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                  selectedGroupId === group.id
                    ? "bg-forest-700 text-white shadow-xs"
                    : "bg-sage-100 text-darkslate-600 hover:bg-sage-200"
                }`}
              >
                <span>{group.icon}</span>
                <span>{group.name.split(" ")[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Category List */}
        <div
          className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-thin"
          role="listbox"
          aria-label="All interview tracks"
          onScroll={handleCategoryLeave}
        >
          {groupedCategories ? (
            groupedCategories.map((group) => (
              <div key={group.id} className="space-y-1">
                <div className="flex items-center justify-between px-2 pt-1 pb-1 text-[11px] font-bold uppercase tracking-wider text-darkslate-400">
                  <span className="flex items-center gap-1.5 truncate">
                    <span>{group.icon}</span>
                    <span>{group.name}</span>
                  </span>
                  <span>({group.categories.length})</span>
                </div>
                <div className="space-y-1">
                  {group.categories.map((cat) => {
                    const isSelected = selectedCategory === cat;
                    const icon = getCategoryIcon(cat);

                    return (
                      <button
                        key={cat}
                        type="button"
                        title={cat}
                        aria-label={`Select track: ${cat}`}
                        aria-pressed={isSelected}
                        onClick={() => handleSelect(cat)}
                        onMouseEnter={(e) => handleCategoryMouseEnter(e, cat, group.name)}
                        onMouseLeave={handleCategoryLeave}
                        onFocus={(e) => handleCategoryFocus(e, cat, group.name)}
                        onBlur={handleCategoryLeave}
                        className={`group relative flex items-center justify-between w-full rounded-xl px-3 py-2 text-left transition-all duration-150 border ${
                          isSelected
                            ? "border-forest-700 bg-gradient-to-r from-[#D2E2D6] via-[#DEEAE1] to-[#D2E2D6] text-forest-950 font-bold shadow-xs ring-1 ring-forest-600/30"
                            : "border-transparent bg-transparent text-darkslate-700 hover:bg-sage-200/60 hover:text-darkslate-900"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2 flex-1">
                          <span
                            className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-sm transition-colors ${
                              isSelected
                                ? "bg-forest-700 text-white shadow-xs"
                                : "bg-sage-100 text-darkslate-600 group-hover:bg-sage-200"
                            }`}
                            aria-hidden="true"
                          >
                            {icon}
                          </span>
                          <span className="block text-xs leading-snug truncate group-hover:text-forest-950 transition-colors">
                            {cat}
                          </span>
                        </div>

                        <span
                          className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors flex items-center gap-1 ${
                            isSelected
                              ? "bg-gold-100 text-gold-900 border border-gold-300/70"
                              : "bg-sage-100 text-darkslate-500 group-hover:bg-sage-200 group-hover:text-forest-900"
                          }`}
                        >
                          <span>12 Qs</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          ) : filteredCategories.length > 0 ? (
            <div className="space-y-1">
              {filteredCategories.map((cat) => {
                const isSelected = selectedCategory === cat;
                const icon = getCategoryIcon(cat);

                return (
                  <button
                    key={cat}
                    type="button"
                    title={cat}
                    aria-label={`Select track: ${cat}`}
                    aria-pressed={isSelected}
                    onClick={() => handleSelect(cat)}
                    onMouseEnter={(e) => handleCategoryMouseEnter(e, cat)}
                    onMouseLeave={handleCategoryLeave}
                    onFocus={(e) => handleCategoryFocus(e, cat)}
                    onBlur={handleCategoryLeave}
                    className={`group relative flex items-center justify-between w-full rounded-xl px-3 py-2 text-left transition-all duration-150 border ${
                      isSelected
                        ? "border-forest-700 bg-gradient-to-r from-[#D2E2D6] via-[#DEEAE1] to-[#D2E2D6] text-forest-950 font-bold shadow-xs ring-1 ring-forest-600/30"
                        : "border-transparent bg-transparent text-darkslate-700 hover:bg-sage-200/60 hover:text-darkslate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2 flex-1">
                      <span
                        className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-sm transition-colors ${
                          isSelected
                            ? "bg-forest-700 text-white shadow-xs"
                            : "bg-sage-100 text-darkslate-600 group-hover:bg-sage-200"
                        }`}
                        aria-hidden="true"
                      >
                        {icon}
                      </span>
                      <span className="block text-xs leading-snug truncate group-hover:text-forest-950 transition-colors">
                        {cat}
                      </span>
                    </div>

                    <span
                      className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors flex items-center gap-1 ${
                        isSelected
                          ? "bg-gold-100 text-gold-900 border border-gold-300/70"
                          : "bg-sage-100 text-darkslate-500 group-hover:bg-sage-200 group-hover:text-forest-900"
                      }`}
                    >
                      <span>12 Qs</span>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-darkslate-400 space-y-2">
              <span className="text-2xl block" aria-hidden="true">🔍</span>
              <p className="text-xs font-semibold text-darkslate-600">
                No tracks match &quot;{searchQuery}&quot;
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedGroupId("all");
                }}
                className="text-xs text-forest-700 font-bold hover:underline"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>

        {/* ── Mobile Docked Preview (Screens < 640px) ── */}
        {isSidebarOpen && hoveredTrack && (
          <div
            role="tooltip"
            aria-live="polite"
            className="sm:hidden absolute bottom-16 left-3 right-3 z-50 rounded-2xl bg-[#1B2B23]/95 border border-forest-600/80 p-3.5 text-white shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-150"
          >
            {(() => {
              const parsed = parseCategoryName(hoveredTrack.category);
              return (
                <div className="flex items-start gap-2.5">
                  <span className="text-2xl shrink-0 mt-0.5" aria-hidden="true">
                    {hoveredTrack.icon}
                  </span>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold uppercase text-emerald-400 tracking-wider">
                        {hoveredTrack.groupName}
                      </span>
                      <span className="text-[9px] font-semibold text-gold-300 bg-gold-950/80 border border-gold-500/30 px-2 py-0.5 rounded-full">
                        12 Questions
                      </span>
                    </div>
                    <p className="text-xs font-bold text-white leading-snug">
                      {parsed.title}
                    </p>
                    {parsed.details && (
                      <p className="text-[11px] text-sage-200 bg-forest-900/90 rounded-lg p-1.5 border border-forest-700/60 mt-1 leading-normal">
                        <span className="text-gold-400 font-semibold">Focus: </span>
                        {parsed.details}
                      </p>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-sage-300/80 bg-[#D4E3D8] flex items-center justify-between">
          <span className="text-xs text-darkslate-600 font-medium">
            {filteredCategories.length} tracks available
          </span>
          <button
            type="button"
            onClick={() => {
              setHoveredTrack(null);
              closeSidebar();
            }}
            className="rounded-xl border border-sage-300 bg-[#F0F5F1] px-3 py-1.5 text-xs font-semibold text-darkslate-700 hover:bg-[#D4E3D8] transition-colors shadow-xs"
          >
            Close Sidebar
          </button>
        </div>
      </aside>

      {/* ── Floating Hover Card (Desktop & Tablet) ── */}
      {isSidebarOpen && hoveredTrack && (
        <aside
          role="tooltip"
          aria-live="polite"
          className="pointer-events-none fixed z-[70] hidden sm:block animate-in fade-in zoom-in-95 duration-150 ease-out"
          style={{
            top: Math.max(
              16,
              Math.min(
                typeof window !== "undefined" ? window.innerHeight - 240 : 600,
                (hoveredTrack.top + hoveredTrack.bottom) / 2 - 70
              )
            ),
            left: Math.min(
              typeof window !== "undefined" ? window.innerWidth - 380 : 500,
              hoveredTrack.right + 12
            ),
            width: "360px",
          }}
        >
          {(() => {
            const parsed = parseCategoryName(hoveredTrack.category);
            return (
              <div className="relative rounded-2xl bg-[#1B2B23]/95 border border-forest-600/80 p-4 text-white shadow-2xl backdrop-blur-md ring-1 ring-white/10">
                {/* Arrow pointing towards the hovered sidebar row */}
                <div
                  className="absolute -left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 rotate-45 border-b border-l border-forest-600/80 bg-[#1B2B23]"
                  aria-hidden="true"
                />

                <div className="flex items-start gap-3">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-forest-800 text-2xl border border-forest-600/50 shadow-xs"
                    aria-hidden="true"
                  >
                    {hoveredTrack.icon}
                  </span>

                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Domain & Count Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-forest-900/90 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        {hoveredTrack.groupName}
                      </span>
                      <span className="text-[10px] font-semibold text-gold-300 bg-gold-950/80 border border-gold-500/30 px-2 py-0.5 rounded-full">
                        12 Practice Questions
                      </span>
                    </div>

                    {/* Full Category Name */}
                    <div>
                      <h4 className="text-sm font-extrabold text-white leading-snug tracking-tight">
                        {parsed.title}
                      </h4>
                    </div>

                    {/* Focus Areas & Specialization */}
                    {parsed.details && (
                      <div className="rounded-xl bg-forest-900/80 border border-forest-700/60 p-2.5 text-xs text-sage-200 leading-relaxed shadow-inner">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gold-400 block mb-1">
                          Focus Areas & Syllabus:
                        </span>
                        <span>{parsed.details}</span>
                      </div>
                    )}

                    {/* Status & Hint */}
                    <div className="pt-1 flex items-center justify-between text-[11px]">
                      <span className="text-sage-300 font-medium flex items-center gap-1">
                        <span className="text-gold-400">↵</span> Click to select this track
                      </span>
                      {selectedCategory === hoveredTrack.category && (
                        <span className="text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                          Active Track
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </aside>
      )}
    </>
  );
}
