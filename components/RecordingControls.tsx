"use client";

interface RecordingControlsProps {
  /** Whether the microphone is currently recording. */
  isRecording: boolean;
  /** Whether the browser supports audio recording. */
  isSupported: boolean;
  /** Whether audio is currently being transcribed by Whisper. */
  isTranscribing?: boolean;
  /** Current duration in seconds recorded. */
  recordingDuration?: number;
  /** Called when the user activates the "Start Recording" control. */
  onStart: () => void;
  /** Called when the user activates the "Stop Recording" control. */
  onStop: () => void;
  /** Called when the user confirms advancing or submitting their answer. */
  onSubmit: () => void;
  /** Whether there is any recorded or transcribed text available to submit. */
  hasTranscript: boolean;
  /** Custom label for the Next / Review button */
  submitLabel?: string;
  /** Whether this is the final question of the interview */
  isLastQuestion?: boolean;
  /** Optional handler to navigate to the previous question */
  onPrevious?: () => void;
  /** Whether going to previous question is allowed */
  canPrevious?: boolean;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * RecordingControls — Cross-browser Start/Stop recording and Next Question / Review controls.
 */
export default function RecordingControls({
  isRecording,
  isSupported,
  isTranscribing = false,
  recordingDuration = 0,
  onStart,
  onStop,
  onSubmit,
  hasTranscript,
  submitLabel,
  isLastQuestion = false,
  onPrevious,
  canPrevious = false,
}: RecordingControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3">
      {/* Microphone controls */}
      {isSupported && (
        <>
          {/* While audio is transcribing */}
          {isTranscribing && (
            <div
              role="status"
              aria-live="polite"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest-50 border border-forest-200 px-4 py-3 min-h-[48px] sm:min-h-0 sm:py-2.5 text-xs font-semibold text-forest-800 w-full sm:w-auto"
            >
              <span
                className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-forest-700 border-t-transparent"
                aria-hidden="true"
              />
              Transcribing audio...
            </div>
          )}

          {/* Not recording and not transcribing */}
          {!isRecording && !isTranscribing && (
            <button
              type="button"
              onClick={onStart}
              aria-label={hasTranscript ? "Record answer again" : "Start recording your answer"}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest-700 px-5 py-3 min-h-[48px] sm:min-h-0 sm:py-2.5
                         text-sm font-semibold text-white shadow-sm hover:bg-forest-800 active:bg-forest-900
                         focus-visible:outline-none focus-visible:ring-2
                         focus-visible:ring-forest-600 focus-visible:ring-offset-2
                         disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:shadow-md w-full sm:w-auto"
            >
              {/* Microphone icon */}
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4Z" />
                <path d="M19 10a1 1 0 1 0-2 0 5 5 0 0 1-10 0 1 1 0 1 0-2 0 7 7 0 0 0 6 6.93V19H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-2.07A7 7 0 0 0 19 10Z" />
              </svg>
              <span>{hasTranscript ? "Re-record Answer" : "Start Recording"}</span>
            </button>
          )}

          {/* Active recording */}
          {isRecording && (
            <button
              type="button"
              onClick={onStop}
              aria-label="Stop recording your answer"
              className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-red-600 px-5 py-3 min-h-[48px] sm:min-h-0 sm:py-2.5
                         text-sm font-semibold text-white shadow-sm hover:bg-red-700 active:bg-red-800
                         focus-visible:outline-none focus-visible:ring-2
                         focus-visible:ring-red-600 focus-visible:ring-offset-2 transition-all shadow-red-600/25 w-full sm:w-auto"
            >
              <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-200 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
              </span>
              <span>Stop Recording ({formatDuration(recordingDuration)})</span>
            </button>
          )}
        </>
      )}

      {/* Previous Question button */}
      {canPrevious && onPrevious && !isRecording && !isTranscribing && (
        <button
          type="button"
          onClick={onPrevious}
          aria-label="Go back to previous question"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-sage-300 bg-[#F0F5F1] px-4 py-3 min-h-[48px] sm:min-h-0 sm:py-2.5
                     text-sm font-semibold text-darkslate-700 shadow-xs
                     hover:bg-[#D4E3D8] active:bg-sage-200
                     focus-visible:outline-none focus-visible:ring-2
                     focus-visible:ring-forest-600 focus-visible:ring-offset-2 transition-colors w-full sm:w-auto"
        >
          ← Previous
        </button>
      )}

      {/* Next Question / Finish & Review button */}
      <button
        type="button"
        onClick={hasTranscript && !isRecording && !isTranscribing ? onSubmit : undefined}
        disabled={!hasTranscript || isRecording || isTranscribing}
        aria-label={
          submitLabel ||
          (isLastQuestion ? "Finish interview and view results" : "Go to next question")
        }
        aria-disabled={!hasTranscript || isRecording || isTranscribing}
        className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 min-h-[48px] sm:min-h-0 sm:py-2.5
                   text-sm font-semibold text-white shadow-sm
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                   disabled:cursor-not-allowed disabled:opacity-50 transition-all w-full sm:w-auto ${
                     isLastQuestion
                       ? "bg-forest-700 hover:bg-forest-800 shadow-forest-900/20 ring-2 ring-gold-400/50"
                       : "bg-forest-700 hover:bg-forest-800 shadow-forest-900/20"
                   }`}
      >
        <span>
          {submitLabel || (isLastQuestion ? "Finish & View Results" : "Next Question →")}
        </span>
      </button>
    </div>
  );
}
