import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AppHeader from "@/components/AppHeader";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Intervue — AI Mock Interview Platform",
  description:
    "Master any job, academic, or professional interview with real-time voice and written AI evaluation powered by Gemini and Whisper.",
  keywords: [
    "mock interview",
    "interview practice",
    "AI interview coach",
    "voice interview",
    "speech-to-text practice",
    "MMI practice",
    "STAR method feedback",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col text-slate-900 selection:bg-indigo-500 selection:text-white`}
      >
        {/* Skip to main content for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          Skip to main content
        </a>

        {/* Live region for accessibility announcements */}
        <div
          aria-live="polite"
          aria-atomic="true"
          id="phase-announcer"
          className="sr-only"
        />

        <AppHeader />

        <main
          id="main-content"
          className="flex-1 mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8"
        >
          {children}
        </main>

        {/* Sleek minimal footer */}
        <footer className="w-full border-t border-slate-200/80 bg-white/60 backdrop-blur-sm py-6 text-center text-xs text-slate-500">
          <div className="mx-auto max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800 tracking-tight">Intervue</span>
              <span className="text-slate-300">•</span>
              <span>Intelligent Interview Coaching</span>
            </div>
            <p className="text-slate-400">
              Voice engine powered by Whisper • AI review by Gemini
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
