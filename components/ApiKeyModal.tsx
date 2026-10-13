"use client";

import { useState, useEffect } from "react";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

export default function ApiKeyModal({ isOpen, onClose, onSave }: ApiKeyModalProps) {
  const [geminiKey, setGeminiKey] = useState("");
  const [groqKey, setGroqKey] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
      setGeminiKey(localStorage.getItem("mock_gemini_key") || "");
      setGroqKey(localStorage.getItem("mock_groq_key") || "");
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (typeof window !== "undefined") {
      if (geminiKey.trim()) {
        localStorage.setItem("mock_gemini_key", geminiKey.trim());
      } else {
        localStorage.removeItem("mock_gemini_key");
      }

      if (groqKey.trim()) {
        localStorage.setItem("mock_groq_key", groqKey.trim());
      } else {
        localStorage.removeItem("mock_groq_key");
      }
    }
    setSavedSuccess(true);
    if (onSave) onSave();
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const handleClear = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("mock_gemini_key");
      localStorage.removeItem("mock_groq_key");
    }
    setGeminiKey("");
    setGroqKey("");
    setSavedSuccess(true);
    if (onSave) onSave();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in"
    >
      <div className="w-full max-w-lg rounded-2xl bg-[#E2ECE5] border border-sage-300 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-sage-300/80 pb-3">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-forest-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <h2 id="api-modal-title" className="text-lg font-bold text-gray-900">
              API Configuration
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close API settings modal"
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        <p className="mt-3 text-sm text-darkslate-600">
          Audio transcription (Whisper) and Gemini AI evaluation require an API key. You can get
          free keys below or configure them in your <code className="bg-sage-100 px-1 py-0.5 rounded text-xs font-mono text-forest-800">.env.local</code> file.
        </p>

        <div className="mt-5 space-y-4">
          {/* Gemini Key */}
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="gemini-key-input" className="block text-xs font-semibold uppercase text-darkslate-700 tracking-wider">
                Google Gemini API Key (Audio & Review)
              </label>
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-forest-700 hover:underline font-medium"
              >
                Get Free Gemini Key ↗
              </a>
            </div>
            <input
              id="gemini-key-input"
              type="password"
              placeholder="AIzaSy..."
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              className="mt-1.5 block w-full rounded-md border border-sage-300 px-3 py-2 text-sm shadow-sm focus:border-forest-600 focus:outline-none focus:ring-1 focus:ring-forest-600"
            />
            <p className="mt-1 text-xs text-darkslate-500">
              Free from Google AI Studio. Used for live audio transcription and answer grading.
            </p>
          </div>

          {/* Groq Key */}
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="groq-key-input" className="block text-xs font-semibold uppercase text-darkslate-700 tracking-wider">
                Groq API Key (Ultra-Fast Whisper-v3)
              </label>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-forest-700 hover:underline font-medium"
              >
                Get Free Groq Key ↗
              </a>
            </div>
            <input
              id="groq-key-input"
              type="password"
              placeholder="gsk_..."
              value={groqKey}
              onChange={(e) => setGroqKey(e.target.value)}
              className="mt-1.5 block w-full rounded-md border border-sage-300 px-3 py-2 text-sm shadow-sm focus:border-forest-600 focus:outline-none focus:ring-1 focus:ring-forest-600"
            />
            <p className="mt-1 text-xs text-darkslate-500">
              Free from Groq Console. Provides sub-second Whisper Large v3 speech transcription.
            </p>
          </div>

          {savedSuccess && (
            <div
              role="status"
              className="rounded-md bg-forest-50 p-3 text-xs font-medium text-forest-800 border border-forest-200"
            >
              ✓ Settings saved successfully in your browser!
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-sage-200 pt-4">
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-darkslate-500 hover:text-red-600 transition-colors"
          >
            Clear Stored Keys
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-sage-100 px-3 py-1.5 text-xs font-semibold text-darkslate-700 hover:bg-sage-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-md bg-forest-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-forest-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600 shadow-sm transition-colors"
            >
              Save Keys
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
