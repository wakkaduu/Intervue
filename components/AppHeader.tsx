"use client";

import { useState } from "react";
import Link from "next/link";
import ApiKeyModal from "@/components/ApiKeyModal";

export default function AppHeader() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <header className="w-full border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-gray-900 hover:text-indigo-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
            aria-label="Mock Interview Helper - Go to home"
          >
            Mock Interview Helper
          </Link>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            aria-label="Open API settings"
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors"
          >
            <span aria-hidden="true">🔑</span>
            <span>API Keys</span>
          </button>
        </div>
      </header>

      <ApiKeyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
