"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";

export default function AppHeader() {
  const pathname = usePathname();
  const isInterviewing = pathname === "/interview";
  const { toggleSidebar } = useSidebar();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-forest-700/60 bg-[#1C2E23]/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          {/* Left Edge Sidebar Open / Toggle Button */}
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Open interview tracks sidebar"
            className="flex items-center gap-2 rounded-xl border border-forest-600/80 bg-forest-800/90 px-3 py-1.5 text-xs font-bold text-emerald-200 shadow-xs hover:bg-forest-700 hover:border-forest-500 hover:text-white transition-all active:scale-95"
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
            <span className="font-semibold">Tracks</span>
          </button>

          {/* Brand Logo */}
          <Link
            href="/"
            className="group flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-400"
            aria-label="Intervue - Go to home"
          >
            {/* Logo Icon */}
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-forest-600 via-forest-500 to-emerald-600 shadow-sm shadow-forest-950/40 transition-transform group-hover:scale-105">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z"
                />
              </svg>
            </div>

            {/* Brand Name Typography */}
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold tracking-tight text-white">
                Inter<span className="text-emerald-400 font-extrabold">vue</span>
                <span className="text-gold-400 font-black">.</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Right side status / navigation */}
        <div className="flex items-center gap-3">
          {isInterviewing ? (
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-sage-200 hover:bg-forest-800 hover:text-white transition-colors"
            >
              <span>← Exit Session</span>
            </Link>
          ) : (
            <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-forest-700/80 bg-forest-900/90 px-3 py-1 text-xs font-medium text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
              <span>52 Tracks Available</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
