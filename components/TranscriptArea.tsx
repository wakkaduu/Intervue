"use client";

interface TranscriptAreaProps {
  finalTranscript: string;
  interimTranscript?: string;
  isRecording?: boolean;
  isTranscribing?: boolean;
  fallbackMode?: boolean;
  onFallbackChange?: (text: string) => void;
}

export default function TranscriptArea({
  finalTranscript,
  interimTranscript = "",
  isRecording = false,
  isTranscribing = false,
  fallbackMode = false,
  onFallbackChange,
}: TranscriptAreaProps) {
  if (fallbackMode && onFallbackChange) {
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
          className="w-full min-h-[140px] overflow-y-auto rounded-md border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 resize-y"
          aria-label="Type your answer"
        />
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="Audio transcription"
      aria-live="polite"
      className="w-full min-h-[140px] rounded-lg border border-gray-200 bg-white p-4 shadow-sm flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <span>🎙️</span>
            <span>Spoken Transcription</span>
          </span>
          {finalTranscript && (
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Transcribed with Whisper
            </span>
          )}
        </div>

        {finalTranscript ? (
          <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
            {finalTranscript}
          </p>
        ) : isTranscribing ? (
          <div className="flex items-center gap-2 text-sm text-indigo-600 italic py-4">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
            Whisper is converting your audio to text...
          </div>
        ) : isRecording ? (
          <div className="flex items-center gap-2 text-sm text-red-600 py-4 animate-pulse">
            <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
            Recording your answer... Speak clearly into your microphone.
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic py-4">
            Press &quot;Start Recording&quot; below and answer out loud into your microphone.
            Whisper will transcribe your response when you click Stop.
          </p>
        )}

        {interimTranscript && (
          <p className="text-sm text-gray-400 italic mt-1">{interimTranscript}</p>
        )}
      </div>

      {finalTranscript && (
        <div className="text-xs text-gray-400 text-right pt-2 border-t border-gray-50">
          {finalTranscript.trim().split(/\s+/).length} words recorded
        </div>
      )}
    </div>
  );
}
