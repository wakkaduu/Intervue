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
          className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5"
        >
          Type your answer
        </label>
        <textarea
          id="fallback-answer"
          value={finalTranscript}
          onChange={(e) => onFallbackChange(e.target.value)}
          placeholder="Type your answer here…"
          className="w-full min-h-[160px] overflow-y-auto rounded-xl border border-sage-300 bg-[#F0F5F1] p-4 text-sm text-darkslate-900 placeholder:text-darkslate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600 shadow-xs resize-y"
          aria-label="Type your answer"
        />
      </div>
    );
  }

  const wordCount = finalTranscript ? finalTranscript.trim().split(/\s+/).length : 0;

  return (
    <div
      role="region"
      aria-label="Audio transcription"
      aria-live="polite"
      className="w-full min-h-[180px] rounded-2xl border border-sage-300/90 bg-[#D8E6DC]/70 p-5 shadow-xs flex flex-col justify-between transition-all"
    >
      <div>
        <div className="flex items-center justify-between border-b border-sage-300/70 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-forest-100 text-forest-800 text-xs font-bold">
              🎙️
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-forest-900">
              Spoken Voice Transcription
            </span>
          </div>

          {finalTranscript && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-800 bg-forest-50 px-2.5 py-1 rounded-full border border-forest-200">
              <span className="h-1.5 w-1.5 rounded-full bg-forest-700" />
              Voice Transcribed
            </span>
          )}
        </div>

        {finalTranscript ? (
          <div className="rounded-xl bg-[#F0F5F1] p-4 border border-sage-300/80 shadow-xs">
            <p className="text-sm font-normal text-darkslate-900 leading-relaxed whitespace-pre-wrap">
              {finalTranscript}
            </p>
          </div>
        ) : isTranscribing ? (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-1.5 rounded-full bg-forest-700 animate-pulse" />
              <span className="h-6 w-1.5 rounded-full bg-forest-700 animate-pulse delay-75" />
              <span className="h-4 w-1.5 rounded-full bg-forest-700 animate-pulse delay-150" />
              <span className="h-8 w-1.5 rounded-full bg-forest-700 animate-pulse delay-100" />
              <span className="h-5 w-1.5 rounded-full bg-forest-700 animate-pulse delay-200" />
            </div>
            <p className="text-xs font-semibold text-forest-800">
              Transcribing your voice audio into high-accuracy text...
            </p>
          </div>
        ) : isRecording ? (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
            {/* Animated Audio Waveform */}
            <div className="flex items-center gap-1.5 h-10">
              <span className="h-4 w-1.5 rounded-full bg-red-500 animate-bounce" />
              <span className="h-8 w-1.5 rounded-full bg-red-600 animate-bounce delay-100" />
              <span className="h-10 w-1.5 rounded-full bg-red-500 animate-bounce delay-200" />
              <span className="h-6 w-1.5 rounded-full bg-red-600 animate-bounce delay-75" />
              <span className="h-9 w-1.5 rounded-full bg-red-500 animate-bounce delay-150" />
              <span className="h-5 w-1.5 rounded-full bg-red-600 animate-bounce delay-300" />
            </div>
            <p className="text-xs font-bold text-red-600 tracking-wide uppercase">
              Listening... Speak clearly into your microphone
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-2 text-darkslate-400">
            <div className="h-10 w-10 rounded-full bg-sage-100 flex items-center justify-center text-darkslate-400 text-lg">
              🎙️
            </div>
            <p className="text-xs font-medium text-darkslate-500 max-w-sm">
              Press <span className="font-bold text-darkslate-700">&quot;Start Recording&quot;</span> below, articulate your response, and click <span className="font-bold text-darkslate-700">&quot;Stop Recording&quot;</span> when done.
            </p>
          </div>
        )}

        {interimTranscript && (
          <p className="text-xs text-darkslate-400 italic mt-2">{interimTranscript}</p>
        )}
      </div>

      {finalTranscript && (
        <div className="flex items-center justify-between text-xs text-darkslate-400 pt-3 border-t border-sage-200/70 mt-3">
          <span>{wordCount} {wordCount === 1 ? "word" : "words"} captured</span>
          <span className="text-[11px] text-darkslate-400">Ready for evaluation</span>
        </div>
      )}
    </div>
  );
}

