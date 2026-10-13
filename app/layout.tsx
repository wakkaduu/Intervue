import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AppHeader from "@/components/AppHeader";
import CategorySidebar from "@/components/CategorySidebar";
import { SidebarProvider } from "@/context/SidebarContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Intervue — Mock Interview Preparation Platform",
  description:
    "Master any job, academic, or professional interview with real-time voice and written evaluation across 52 specialized tracks.",
  keywords: [
    "mock interview",
    "interview practice",
    "interview coach",
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
    <html lang="en" className="h-full scroll-smooth bg-[#23382B]">
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col bg-[#23382B] text-darkslate-900 selection:bg-forest-600 selection:text-white`}
      >
        {/* Skip to main content for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-forest-700 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-forest-400"
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

        <SidebarProvider>
          <CategorySidebar />
          <AppHeader />

          <main
            id="main-content"
            className="flex-1 mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8"
          >
            {children}
          </main>
        </SidebarProvider>

        {/* Sleek minimal footer */}
        <footer className="w-full border-t border-forest-700/60 bg-[#1C2E23]/95 backdrop-blur-sm py-6 text-center text-xs text-sage-300">
          <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-emerald-300 tracking-tight">Intervue</span>
              <span className="text-forest-600">•</span>
              <span className="text-sage-300">Professional Interview Preparation</span>
            </div>
            <p className="text-sage-400">
              624 Curated Scenarios Across 52 Specialized Tracks
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
