"use client";

// Requirements: 4.1, 4.3, 4.4, 3.5, 8.3

interface TranscriptAreaProps {
  finalTranscript: string;
  interimTranscript: string;
  fallbackMode: boolean;
  onFallbackChange: (text: string) => void;
}

export default function TranscriptArea({
  finalTranscript,
  interimTranscript,
  fallbackMode,
  onFallbackChange,
}: TranscriptAreaProps) {
  if (fallbackMode) {
    // Req 3.5, 8.3: fallback textarea with associated label
    return (
      <div className="w-full">
        <label
          htmlFor="fallback-answer"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Type your answer
        </label>
        <textarea
          id="fallback-answer"
          value={finalTranscript}
          onChange={(e) => onFallbackChange(e.target.value)}
          placeholder="Type your answer here…"
          className="w-full min-h-[120px] overflow-y-auto rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 resize-y"
          aria-label="Type your answer"
        />
      </div>
    );
  }

  // Req 4.1, 4.3, 4.4: live transcription display
  return (
    <div
      role="region"
      aria-label="Live transcription"
      aria-live="polite"
      className="w-full min-h-[120px] overflow-y-auto rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
    >
      {/* Req 4.3: finalized text in default style */}
      <span className="text-gray-900">{finalTranscript}</span>

      {/* Req 4.3: interim text in muted/italic style */}
      {interimTranscript && (
        <span className="text-gray-400 italic">{interimTranscript}</span>
      )}

      {/* Placeholder when nothing has been transcribed yet */}
      {!finalTranscript && !interimTranscript && (
        <span className="text-gray-400 select-none">
          Your transcription will appear here…
        </span>
      )}
    </div>
  );
}
