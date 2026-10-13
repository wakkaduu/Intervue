"use client";

interface LoadingSpinnerProps {
  label?: string;
  subtext?: string;
  size?: "sm" | "md" | "lg";
}

export default function LoadingSpinner({
  label = "Loading feedback…",
  subtext,
  size = "md",
}: LoadingSpinnerProps = {}) {
  const sizeClasses =
    size === "sm"
      ? "h-6 w-6 border-2"
      : size === "lg"
      ? "h-14 w-14 border-4"
      : "h-10 w-10 border-4";

  return (
    <div
      role="status"
      aria-label={label}
      className="flex flex-col items-center justify-center p-4 space-y-2.5"
    >
      <div className="relative flex items-center justify-center">
        <div
          aria-hidden="true"
          className={`${sizeClasses} animate-spin rounded-full border-sage-300 border-t-forest-700 shadow-xs`}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-emerald-400/20 blur-xs animate-pulse pointer-events-none"
        />
      </div>
      {subtext && (
        <p className="text-xs font-semibold text-darkslate-600 animate-pulse">
          {subtext}
        </p>
      )}
      <span className="sr-only">{label}</span>
    </div>
  );
}
