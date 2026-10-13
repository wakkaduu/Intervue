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
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl ring-1 ring-gray-200">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">
              🔑
            </span>
            <h2 id="api-modal-title" className="text-lg font-bold text-gray-900">
              API Keys Configuration
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

        <p className="mt-3 text-sm text-gray-600">
          Audio transcription (Whisper) and Gemini AI evaluation require an API key. You can get
          free keys below or configure them in your <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono text-indigo-700">.env.local</code> file.
        </p>

        <div className="mt-5 space-y-4">
          {/* Gemini Key */}
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="gemini-key-input" className="block text-xs font-semibold uppercase text-gray-700 tracking-wider">
                Google Gemini API Key (Audio & Review)
              </label>
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-indigo-600 hover:underline font-medium"
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
              className="mt-1.5 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Free from Google AI Studio. Used for live audio transcription and answer grading.
            </p>
          </div>

          {/* Groq Key */}
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="groq-key-input" className="block text-xs font-semibold uppercase text-gray-700 tracking-wider">
                Groq API Key (Ultra-Fast Whisper-v3)
              </label>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-indigo-600 hover:underline font-medium"
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
              className="mt-1.5 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Free from Groq Console. Provides sub-second Whisper Large v3 speech transcription.
            </p>
          </div>

          {savedSuccess && (
            <div
              role="status"
              className="rounded-md bg-green-50 p-3 text-xs font-medium text-green-800 border border-green-200"
            >
              ✓ Settings saved successfully in your browser!
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-gray-500 hover:text-red-600 transition-colors"
          >
            Clear Stored Keys
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-md bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 shadow-sm transition-colors"
            >
              Save Keys
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
