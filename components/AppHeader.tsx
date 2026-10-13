"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AppHeader() {
  const pathname = usePathname();
  const isInterviewing = pathname === "/interview";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label="Intervue - Go to home"
        >
          {/* Logo Icon */}
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 shadow-sm shadow-indigo-500/25 transition-transform group-hover:scale-105">
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
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Inter<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 font-extrabold">vue</span>
            </span>
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
              AI
            </span>
          </div>
        </Link>

        {/* Right side status / navigation */}
        <div className="flex items-center gap-3">
          {isInterviewing ? (
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <span>← Exit Session</span>
            </Link>
          ) : (
            <div className="hidden sm:inline-flex items-center gap-2 rounded-full bg-slate-100/80 px-3 py-1 text-xs font-medium text-slate-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
              <span>32 Tracks Available</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
