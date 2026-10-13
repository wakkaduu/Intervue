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
    <div className="flex flex-wrap items-center gap-3">
      {/* Microphone controls */}
      {isSupported && (
        <>
          {/* While Whisper is transcribing */}
          {isTranscribing && (
            <div
              role="status"
              aria-live="polite"
              className="inline-flex items-center gap-2 rounded-md bg-indigo-50 border border-indigo-200 px-4 py-2 text-sm font-semibold text-indigo-700"
            >
              <span
                className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"
                aria-hidden="true"
              />
              Transcribing audio with Whisper...
            </div>
          )}

          {/* Not recording and not transcribing */}
          {!isRecording && !isTranscribing && (
            <button
              type="button"
              onClick={onStart}
              aria-label={hasTranscript ? "Record answer again" : "Start recording your answer"}
              className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2
                         text-sm font-semibold text-white shadow-sm
                         hover:bg-indigo-700 active:bg-indigo-800
                         focus-visible:outline-none focus-visible:ring-2
                         focus-visible:ring-indigo-600 focus-visible:ring-offset-2
                         disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
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
              {hasTranscript ? "Re-record with Mic" : "Start Recording"}
            </button>
          )}

          {/* Active recording */}
          {isRecording && (
            <button
              type="button"
              onClick={onStop}
              aria-label="Stop recording your answer"
              className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2
                         text-sm font-semibold text-white shadow-sm
                         hover:bg-red-700 active:bg-red-800
                         focus-visible:outline-none focus-visible:ring-2
                         focus-visible:ring-red-600 focus-visible:ring-offset-2 transition-colors"
            >
              <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-200 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
              </span>
              Stop Recording ({formatDuration(recordingDuration)})
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
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3.5 py-2
                     text-sm font-semibold text-gray-700 shadow-sm
                     hover:bg-gray-50 active:bg-gray-100
                     focus-visible:outline-none focus-visible:ring-2
                     focus-visible:ring-indigo-600 focus-visible:ring-offset-2 transition-colors"
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
          (isLastQuestion ? "Finish interview and review with AI" : "Go to next question")
        }
        aria-disabled={!hasTranscript || isRecording || isTranscribing}
        className={`inline-flex items-center gap-2 rounded-md px-4 py-2
                   text-sm font-semibold text-white shadow-sm
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                   disabled:cursor-not-allowed disabled:opacity-50 transition-colors ${
                     isLastQuestion
                       ? "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 focus-visible:ring-indigo-600"
                       : "bg-green-600 hover:bg-green-700 active:bg-green-800 focus-visible:ring-green-600"
                   }`}
      >
        <span>
          {submitLabel || (isLastQuestion ? "Finish & Review with AI ✨" : "Next Question →")}
        </span>
      </button>
    </div>
  );
}
