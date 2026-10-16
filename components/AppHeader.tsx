"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useSidebar } from "@/context/SidebarContext";
import AuthModal from "@/components/AuthModal";
import Button, { buttonClasses } from "@/components/ui/Button";
import {
  syncGuestSessionsToAccount,
  hasUnsyncedGuestSessions,
} from "@/lib/guest-storage";

export default function AppHeader() {
  const pathname = usePathname();
  const isInterviewing = pathname === "/interview";
  const { toggleSidebar } = useSidebar();
  const { data: session, status } = useSession();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"signin" | "signup" | "confirm">("signin");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Automatically sync any offline guest sessions when user is authenticated
  useEffect(() => {
    if (status === "authenticated" && hasUnsyncedGuestSessions()) {
      syncGuestSessionsToAccount().catch(() => {});
    }
  }, [status]);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-forest-700/60 bg-[#1C2E23]/90 backdrop-blur-md transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-2.5 sm:px-6 lg:px-8 py-2.5 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Left Edge Sidebar Open / Toggle Button */}
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label="Open interview tracks sidebar"
              className={buttonClasses({ variant: "dark", size: "sm", className: "shrink-0 gap-1.5 !px-2 sm:!px-3" })}
            >
              <svg
                className="h-4 w-4 text-emerald-300 shrink-0"
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
              className="group flex items-center gap-2 sm:gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-400 shrink-0"
              aria-label="Intervue - Go to home"
            >
              {/* Logo Icon */}
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-forest-600 via-forest-500 to-emerald-600 shadow-sm shadow-forest-950/40 transition-transform group-hover:scale-105 shrink-0">
                <svg
                  className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-white"
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
              <div className="flex items-center gap-1">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  Inter<span className="text-emerald-400 font-extrabold">vue</span>
                  <span className="text-gold-400 font-black">.</span>
                </span>
              </div>
            </Link>
          </div>

          {/* Right side status / navigation */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {isInterviewing ? (
              <Link
                href="/"
                className={buttonClasses({ variant: "dark", size: "sm", className: "shrink-0" })}
              >
                <span>← Exit Session</span>
              </Link>
            ) : (
              <Link
                href="/history"
                className={buttonClasses({ variant: "dark", size: "sm", className: "hidden md:inline-flex shrink-0 gap-1.5" })}
              >
                <svg className="h-3.5 w-3.5 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>My History</span>
              </Link>
            )}

            {/* Auth State Button / User Menu */}
            {status === "authenticated" && session?.user ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 rounded-xl border border-forest-600/80 bg-forest-800/90 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-forest-700 transition-all shrink-0"
                  aria-expanded={isUserMenuOpen}
                  aria-label="User account menu"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-forest-700 text-[10px] font-bold text-emerald-200 uppercase">
                    {session.user.name?.charAt(0) || "U"}
                  </span>
                  <span className="max-w-[70px] sm:max-w-[130px] truncate">
                    {session.user.name?.split(" ")[0] || "Account"}
                  </span>
                  <span className="text-[10px] text-emerald-300">▼</span>
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-forest-600/80 bg-[#1C2E23] p-2 text-white shadow-2xl ring-1 ring-white/10 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 border-b border-forest-700/70">
                      <div className="flex items-center justify-between gap-1.5 mb-0.5">
                        <p className="text-xs font-bold text-white truncate">
                          {session.user.name}
                        </p>
                        {session.user.emailVerified ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/90 border border-emerald-500/50 px-2 py-0.5 text-[9px] font-semibold text-emerald-300">
                            <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-950/90 border border-amber-500/50 px-2 py-0.5 text-[9px] font-semibold text-amber-300">
                            Unverified
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-sage-300 truncate">
                        {session.user.email}
                      </p>
                    </div>

                    {/* Unverified Action Banner */}
                    {!session.user.emailVerified && (
                      <div className="p-1 border-b border-forest-700/70">
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            setAuthModalMode("confirm");
                            setIsAuthModalOpen(true);
                          }}
                          className="w-full flex items-center justify-between gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 px-2.5 py-1.5 text-xs font-medium text-amber-200 hover:bg-amber-500/20 transition-all text-left"
                        >
                          <span className="flex items-center gap-1.5">
                            <svg className="h-3.5 w-3.5 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>Confirm email</span>
                          </span>
                          <span className="text-[10px] text-amber-400 font-bold">Verify →</span>
                        </button>
                      </div>
                    )}

                    <div className="py-1">
                      <Link
                        href="/history"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-sage-200 hover:bg-forest-800 hover:text-white transition-colors"
                      >
                        <svg className="h-4 w-4 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span>My Practice History</span>
                      </Link>
                      <Link
                        href="/"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-sage-200 hover:bg-forest-800 hover:text-white transition-colors"
                      >
                        <svg className="h-4 w-4 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Practice Tracks</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-forest-700/70">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-950/50 hover:text-red-200 transition-colors text-left"
                      >
                        <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={`${isInterviewing ? "hidden sm:flex" : "flex"} items-center gap-1.5 sm:gap-2 shrink-0`}>
                <Button
                  variant="dark"
                  size="sm"
                  aria-label="Sign in to your account"
                  onClick={() => {
                    setAuthModalMode("signin");
                    setIsAuthModalOpen(true);
                  }}
                >
                  Sign in
                </Button>
                <Button
                  variant="accent"
                  size="sm"
                  aria-label="Sign up for an account"
                  onClick={() => {
                    setAuthModalMode("signup");
                    setIsAuthModalOpen(true);
                  }}
                >
                  Sign up
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setAuthModalMode("signin");
        }}
        initialMode={authModalMode}
        initialEmail={session?.user?.email || ""}
      />
    </>
  );
}
