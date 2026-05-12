"use client";

interface ErrorMessageProps {
  /** The error text to display. */
  message: string;
  /**
   * When provided, a "Retry" button is rendered that calls this handler.
   * Only shown when Feedback has NOT been successfully received (Req 5.6).
   */
  onRetry?: () => void;
  /**
   * Optional id used by a parent control's aria-describedby to associate
   * this error message with the relevant input (Req 8.3).
   */
  id?: string;
}

/**
 * ErrorMessage — accessible inline / block error display.
 *
 * Accessibility:
 *   - role="alert" causes screen readers to announce the message immediately
 *     without the user needing to navigate to it (Req 8.3, design §Error Display Rules)
 *   - The retry button has a visible label and focus-visible ring (Req 8.3, 8.4)
 */
export default function ErrorMessage({ message, onRetry, id }: ErrorMessageProps) {
  return (
    <div
      role="alert"
      id={id}
      className="flex flex-col gap-3 rounded-md border border-red-300 bg-red-50 p-4 text-red-800"
    >
      <p className="text-sm font-medium">{message}</p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          aria-label="Resubmit your answer"
          className="self-start rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white
                     hover:bg-red-700
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600
                     focus-visible:ring-offset-2"
        >
          Resubmit
        </button>
      )}
    </div>
  );
}
