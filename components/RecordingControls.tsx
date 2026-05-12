"use client";

interface RecordingControlsProps {
  /** Whether the microphone is currently recording. */
  isRecording: boolean;
  /**
   * Whether the browser supports the Web Speech API.
   * When false, microphone buttons are hidden and the text fallback is shown
   * instead (Req 3.5, design §Browser Support and Fallback).
   */
  isSupported: boolean;
  /** Called when the user activates the "Start Recording" control (Req 3.1). */
  onStart: () => void;
  /** Called when the user activates the "Stop Recording" control (Req 3.4). */
  onStop: () => void;
  /**
   * Called when the user confirms submission of their answer (Req 5.1).
   * Disabled when hasTranscript is false (Req 5.8).
   */
  onSubmit: () => void;
  /**
   * Whether there is any recorded or typed text available to submit.
   * The "Submit Answer" button is disabled when this is false (Req 5.8).
   */
  hasTranscript: boolean;
}

/**
 * RecordingControls — Start/Stop recording buttons and Submit Answer control.
 *
 * Accessibility:
 *   - Each button has a visible label and an aria-label for assistive technologies (Req 8.3).
 *   - All interactive elements use focus-visible ring styles for keyboard navigation (Req 8.4).
 *   - Microphone buttons are hidden (not just disabled) when the browser does not support
 *     the Web Speech API, so users in fallback mode are not confused by unavailable controls.
 *   - The "Submit Answer" button uses aria-disabled when hasTranscript is false so screen
 *     readers can still discover and describe the control (Req 5.8, 8.3).
 */
export default function RecordingControls({
  isRecording,
  isSupported,
  onStart,
  onStop,
  onSubmit,
  hasTranscript,
}: RecordingControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Microphone buttons — hidden entirely when Speech API is not supported (Req 3.5) */}
      {isSupported && (
        <>
          {/* Start Recording — only shown when not currently recording */}
          {!isRecording && (
            <button
              type="button"
              onClick={onStart}
              aria-label="Start recording your answer"
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2
                         text-sm font-semibold text-white
                         hover:bg-blue-700 active:bg-blue-800
                         focus-visible:outline-none focus-visible:ring-2
                         focus-visible:ring-blue-600 focus-visible:ring-offset-2
                         disabled:cursor-not-allowed disabled:opacity-50"
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
              Start Recording
            </button>
          )}

          {/* Stop Recording — only shown while recording is active */}
          {isRecording && (
            <button
              type="button"
              onClick={onStop}
              aria-label="Stop recording your answer"
              className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2
                         text-sm font-semibold text-white
                         hover:bg-red-700 active:bg-red-800
                         focus-visible:outline-none focus-visible:ring-2
                         focus-visible:ring-red-600 focus-visible:ring-offset-2"
            >
              {/* Stop icon */}
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4"
              >
                <rect x="4" y="4" width="16" height="16" rx="2" />
              </svg>
              Stop Recording
            </button>
          )}
        </>
      )}

      {/* Submit Answer — always rendered; disabled when there is no transcript (Req 5.8) */}
      <button
        type="button"
        onClick={hasTranscript ? onSubmit : undefined}
        disabled={!hasTranscript}
        aria-label={
          hasTranscript
            ? "Submit your answer for AI review"
            : "Submit your answer for AI review — record or type an answer first"
        }
        aria-disabled={!hasTranscript}
        className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2
                   text-sm font-semibold text-white
                   hover:bg-green-700 active:bg-green-800
                   focus-visible:outline-none focus-visible:ring-2
                   focus-visible:ring-green-600 focus-visible:ring-offset-2
                   disabled:cursor-not-allowed disabled:opacity-50"
      >
        Submit Answer
      </button>
    </div>
  );
}
