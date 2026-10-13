import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AppHeader from "@/components/AppHeader";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Mock Interview Helper",
  description: "Practice job interviews with AI-powered feedback",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen bg-gray-50 text-gray-900`}
      >
        {/* Skip to main content — visually hidden until focused (Req 8.3, 8.4) */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-gray-900 focus:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          Skip to main content
        </a>

        {/* Visually-hidden live region for phase-transition announcements (Req 8.3, 8.4) */}
        <div
          aria-live="polite"
          aria-atomic="true"
          id="phase-announcer"
          className="sr-only"
        />

        <AppHeader />

        <main
          id="main-content"
          className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8"
        >
          {children}
        </main>
      </body>
    </html>
  );
}
