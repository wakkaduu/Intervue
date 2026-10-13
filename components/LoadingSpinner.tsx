"use client";

/**
 * LoadingSpinner — generic animated loading indicator.
 *
 * Accessibility:
 *   - role="status" so assistive technologies treat it as a live region
 *   - aria-label provides a descriptive name (Req 8.3)
 *   - The visible spinner is aria-hidden so screen readers only read the label
 */
export default function LoadingSpinner() {
  return (
    <div
      role="status"
      aria-label="Loading feedback…"
      className="flex items-center justify-center p-4"
    >
      {/* Visible animated ring */}
      <div
        aria-hidden="true"
        className="h-10 w-10 animate-spin rounded-full border-4 border-sage-300 border-t-forest-700"
      />
      {/* Visually-hidden text for extra context in older AT */}
      <span className="sr-only">Loading feedback…</span>
    </div>
  );
}
