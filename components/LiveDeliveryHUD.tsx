"use client";

import { useMemo } from "react";
import { analyzeSpeechDelivery } from "@/lib/speech-metrics";

interface LiveDeliveryHUDProps {
  transcript: string;
  durationSeconds: number;
  isRecording: boolean;
  enabled: boolean;
  onToggleEnabled: () => void;
}

export default function LiveDeliveryHUD({
  transcript,
  durationSeconds,
  isRecording,
  enabled,
  onToggleEnabled,
}: LiveDeliveryHUDProps) {
  // Compute speech metrics in real-time
  const metrics = useMemo(() => {
    if (!transcript.trim() || durationSeconds < 2) return null;
    return analyzeSpeechDelivery(transcript, durationSeconds);
  }, [transcript, durationSeconds]);

  // Pace styling badge
  const paceTheme = useMemo(() => {
    if (!metrics) return { bg: "bg-sage-100", border: "border-sage-300", text: "text-darkslate-700" };
    switch (metrics.paceCategory) {
      case "optimal":
        return { bg: "bg-emerald-50", border: "border-emerald-300", text: "text-emerald-900" };
      case "fast":
      case "slow":
        return { bg: "bg-amber-50", border: "border-amber-300", text: "text-amber-900" };
      case "too-fast":
      case "too-slow":
        return { bg: "bg-rose-50", border: "border-rose-300", text: "text-rose-900" };
      default:
        return { bg: "bg-sage-100", border: "border-sage-300", text: "text-darkslate-700" };
    }
  }, [metrics]);

  return (
    <div className="space-y-2">
      {/* Toggle Bar */}
      <div className="flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={onToggleEnabled}
          aria-pressed={enabled}
          className="inline-flex items-center gap-2 rounded-lg py-1 text-xs font-semibold text-darkslate-700 hover:text-forest-950 transition-colors"
        >
          <span
            className={`flex h-4 w-7 items-center rounded-full p-0.5 transition-colors ${
              enabled ? "bg-forest-700 justify-end" : "bg-sage-300 justify-start"
            }`}
          >
            <span className="h-3 w-3 rounded-full bg-white shadow-xs" />
          </span>
          <span>Live Pacing & Filler HUD</span>
        </button>

        {enabled && (
          <span className="text-[10px] font-medium text-darkslate-500">
            Real-time delivery coaching
          </span>
        )}
      </div>

      {/* Active Live HUD Metrics Display */}
      {enabled && isRecording && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-sage-300/80 bg-[#E8F0EA] p-2.5 animate-in fade-in duration-200">
          {/* Pacing Badge */}
          <div
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-bold ${paceTheme.bg} ${paceTheme.border} ${paceTheme.text}`}
          >
            <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              {metrics && metrics.wpm > 0
                ? `${metrics.wpm} WPM (${metrics.paceCategory === "optimal" ? "Optimal" : metrics.paceLabel.split(" ")[0]})`
                : "Calibrating WPM..."}
            </span>
          </div>

          {/* Filler Word Counter Badge */}
          <div
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-bold ${
              metrics && metrics.fillerCount > 0
                ? "bg-amber-50 border-amber-300 text-amber-900"
                : "bg-emerald-50 border-emerald-300 text-emerald-900"
            }`}
          >
            <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>
              {metrics && metrics.fillerCount > 0
                ? `${metrics.fillerCount} Fillers (${metrics.fillerMatches
                    .slice(0, 2)
                    .map((f) => `${f.word}:${f.count}`)
                    .join(", ")})`
                : "0 Filler Words"}
            </span>
          </div>

          {/* Live Words Count */}
          <span className="text-[11px] text-darkslate-600 font-medium ml-auto">
            {metrics ? `${metrics.totalWords} words spoken` : "Speak your response..."}
          </span>
        </div>
      )}
    </div>
  );
}
