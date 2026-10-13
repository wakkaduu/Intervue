"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  hasUnsyncedGuestSessions,
  syncGuestSessionsToAccount,
} from "@/lib/guest-storage";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "signin" | "signup" | "confirm";
  initialEmail?: string;
  onSuccess?: () => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = "signin",
  initialEmail = "",
  onSuccess,
}: AuthModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup" | "confirm">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [hasGuestData, setHasGuestData] = useState(false);

  // Clears all credentials and feedback states
  function resetCredentials() {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setConfirmationCode("");
    setError(null);
    setSuccessMessage(null);
  }

  // Switches mode and clears sensitive password/code fields
  function switchMode(newMode: "signin" | "signup" | "confirm") {
    setMode(newMode);
    setPassword("");
    setConfirmPassword("");
    setConfirmationCode("");
    setError(null);
    setSuccessMessage(null);
  }

  // Closes modal and sanitizes all form states
  function handleClose() {
    resetCredentials();
    onClose();
  }

  useEffect(() => {
    if (isOpen) {
      setHasGuestData(hasUnsyncedGuestSessions());
      setMode(initialMode);
      setEmail(initialEmail || "");
      setPassword("");
      setConfirmPassword("");
      setConfirmationCode("");
      setError(null);
      setSuccessMessage(null);
    } else {
      resetCredentials();
    }
  }, [isOpen, initialMode, initialEmail]);

  // Clean memory on unmount
  useEffect(() => {
    return () => {
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setConfirmationCode("");
    };
  }, []);

  // Cooldown countdown timer for resending confirmation code
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  if (!isOpen) return null;

  async function handlePostAuthSuccess() {
    resetCredentials();
    try {
      await syncGuestSessionsToAccount();
    } catch {
      // ignore
    }
    onClose();
    if (onSuccess) onSuccess();
    router.refresh();
  }

  async function handleGoogleLogin() {
    setError(null);
    setGoogleLoading(true);

    try {
      const checkRes = await fetch("/api/auth/providers-available");
      const providers = await checkRes.json();

      if (!providers.google) {
        setError(
          "Google Sign-In requires AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET in environment configuration. You may sign in with the Demo Account or standard credentials."
        );
        setGoogleLoading(false);
        return;
      }

      await signIn("google", {
        callbackUrl: window.location.pathname === "/login" ? "/history" : undefined,
      });
    } catch {
      setError("Unable to initiate Google authentication. Please try again.");
      setGoogleLoading(false);
    }
  }

  async function handleDemoLogin() {
    setError(null);
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: "demo@intervue.io",
        password: "intervue123",
      });

      if (res?.error) {
        setError("Demo authentication failed. Please try again.");
      } else {
        await handlePostAuthSuccess();
      }
    } catch {
      setError("An unexpected authentication error occurred.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendCode() {
    if (resendCooldown > 0 || resending) return;
    setError(null);
    setSuccessMessage(null);
    setResending(true);

    try {
      const res = await fetch("/api/auth/resend-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to resend confirmation code.");
        if (data.retryAfterSeconds) {
          setResendCooldown(data.retryAfterSeconds);
        }
      } else {
        setSuccessMessage("A fresh 6-digit confirmation code has been dispatched to your email.");
        setResendCooldown(data.cooldownSeconds || 60);
      }
    } catch {
      setError("Network error while resending confirmation code.");
    } finally {
      setResending(false);
    }
  }

  async function handleVerifyConfirmation(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const cleanCode = confirmationCode.trim();
    if (!/^\d{6}$/.test(cleanCode)) {
      setError("Please enter a valid 6-digit verification code.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/confirm-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: cleanCode }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to verify confirmation code.");
        setConfirmationCode(""); // Wipe failed code
        setLoading(false);
        return;
      }

      setSuccessMessage(data.message || "Email verified successfully!");

      // If password was entered, sign in immediately and wipe credentials
      if (password) {
        const emailToLogin = email;
        const passwordToLogin = password;
        setPassword("");
        setConfirmPassword("");
        setConfirmationCode("");

        const loginRes = await signIn("credentials", {
          redirect: false,
          email: emailToLogin,
          password: passwordToLogin,
        });

        if (!loginRes?.error) {
          await handlePostAuthSuccess();
          return;
        }
      }

      // If user was already logged in or verifying from profile
      await handlePostAuthSuccess();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSkipConfirmation() {
    setError(null);
    // Graceful access: let user access their account and start practicing immediately
    if (password) {
      setLoading(true);
      const emailToLogin = email;
      const passwordToLogin = password;
      setPassword("");
      setConfirmPassword("");
      setConfirmationCode("");

      try {
        const loginRes = await signIn("credentials", {
          redirect: false,
          email: emailToLogin,
          password: passwordToLogin,
        });

        if (loginRes?.error) {
          switchMode("signin");
          setError("Please sign in with your credentials to access your account.");
        } else {
          await handlePostAuthSuccess();
        }
      } catch {
        setError("Unable to complete sign in.");
        switchMode("signin");
      } finally {
        setLoading(false);
      }
    } else {
      handleClose();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (mode === "signup") {
      if (!name.trim()) {
        setError("Please enter your full name.");
        return;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters long.");
        return;
      }
      if (
        !/[a-zA-Z]/.test(password) ||
        !/[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password)
      ) {
        setError("Password must contain letters and numbers or symbols.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      setLoading(true);
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to create account.");
          setLoading(false);
          return;
        }

        // Transition to confirmation code entry
        if (data.requiresConfirmation) {
          setMode("confirm");
          setResendCooldown(60);
          setLoading(false);
          return;
        }

        // Direct sign-in fallback
        const emailToLogin = email;
        const passwordToLogin = password;
        setPassword("");
        setConfirmPassword("");

        const loginRes = await signIn("credentials", {
          redirect: false,
          email: emailToLogin,
          password: passwordToLogin,
        });

        if (loginRes?.error) {
          setError(
            "Account created successfully. Please sign in with your credentials."
          );
          switchMode("signin");
        } else {
          await handlePostAuthSuccess();
        }
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    } else if (mode === "signin") {
      setLoading(true);
      const emailToLogin = email;
      const passwordToLogin = password;

      try {
        const res = await signIn("credentials", {
          redirect: false,
          email: emailToLogin,
          password: passwordToLogin,
        });

        if (res?.error) {
          setError("Invalid email address or password.");
          setPassword(""); // Wipe password immediately on failed attempt
        } else {
          await handlePostAuthSuccess();
        }
      } catch {
        setError("Unable to complete sign in. Please try again.");
        setPassword("");
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-3 sm:p-4 backdrop-blur-sm animate-fade-in flex min-h-full items-center justify-center"
    >
      <div className="relative w-full max-w-md my-auto rounded-2xl sm:rounded-3xl border border-sage-300 bg-[#E2ECE5] p-5 sm:p-7 shadow-2xl max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] flex flex-col">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close dialog"
          className="absolute right-3.5 top-3.5 sm:right-4 sm:top-4 z-10 rounded-lg p-1.5 text-darkslate-500 hover:bg-[#D4E3D8] hover:text-darkslate-800 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Upper Panel: Header & Mode Switcher Tabs (Always visible & pinned) */}
        <div className="shrink-0 mb-3 sm:mb-4">
          <div className="text-center space-y-1 mb-2.5 sm:mb-3">
            <div className="mx-auto mb-1.5 sm:mb-2 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-forest-850 text-white shadow-sm border border-forest-700/60">
              {mode === "confirm" ? (
                <svg className="h-5 w-5 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              )}
            </div>
            <h2
              id="auth-modal-title"
              className="text-lg sm:text-2xl font-extrabold text-forest-950 tracking-tight"
            >
              {mode === "confirm"
                ? "Confirm Your Email"
                : mode === "signin"
                ? "Sign In to Intervue"
                : "Create Account"}
            </h2>
            <p className="text-xs sm:text-sm text-darkslate-600 line-clamp-2">
              {mode === "confirm"
                ? `Enter the 6-digit verification code sent to ${email}`
                : mode === "signin"
                ? "Access your saved interview sessions and performance analytics"
                : "Register to preserve your practice history across sessions"}
            </p>
          </div>

          {/* Mode Switcher Tabs (Only when not confirming) */}
          {mode !== "confirm" && (
            <div className="grid grid-cols-2 p-1 rounded-xl sm:rounded-2xl bg-sage-200/90 border border-sage-300">
              <button
                type="button"
                onClick={() => switchMode("signin")}
                className={`py-1.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                  mode === "signin"
                    ? "bg-forest-800 text-white shadow-xs"
                    : "text-darkslate-700 hover:text-forest-950 hover:bg-sage-100/60"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode("signup")}
                className={`py-1.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                  mode === "signup"
                    ? "bg-forest-800 text-white shadow-xs"
                    : "text-darkslate-700 hover:text-forest-950 hover:bg-sage-100/60"
                }`}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 -mr-1 scrollbar-thin">

        {/* Guest Progress Notice */}
        {hasGuestData && mode !== "confirm" && (
          <div className="mb-4 rounded-xl border border-emerald-600/30 bg-emerald-50/90 p-3 text-xs text-forest-950 flex items-start gap-2.5 shadow-xs">
            <svg className="h-4 w-4 text-forest-750 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <p>
              <strong className="font-semibold">Local progress detected:</strong>{" "}
              Unsaved sessions on this device will be linked to your account upon signing in.
            </p>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div
            role="status"
            className="mb-4 rounded-xl border border-emerald-600/30 bg-emerald-50 p-2.5 text-xs font-semibold text-emerald-900 leading-relaxed flex items-start gap-2"
          >
            <svg className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-xs font-semibold text-red-900 leading-relaxed flex items-start gap-2"
          >
            <svg className="h-4 w-4 text-red-700 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* CONFIRMATION CODE VIEW */}
        {mode === "confirm" ? (
          <div className="space-y-4">
            <form onSubmit={handleVerifyConfirmation} className="space-y-3.5">
              <div>
                <label
                  htmlFor="auth-confirm-code"
                  className="block text-xs font-bold text-darkslate-700 mb-1.5 text-center"
                >
                  6-Digit Verification Code
                </label>
                <input
                  id="auth-confirm-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={confirmationCode}
                  onChange={(e) =>
                    setConfirmationCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="000000"
                  className="w-full rounded-xl border border-sage-300 bg-[#F0F5F1] py-2.5 text-center font-mono text-2xl font-bold tracking-[0.4em] text-darkslate-900 placeholder:text-darkslate-300 focus:bg-[#E8F0EA] focus:border-forest-600 focus:outline-none focus:ring-2 focus:ring-forest-500/20 transition-all"
                  autoFocus
                />
                <p className="mt-1 text-center text-[11px] text-darkslate-500">
                  Security code valid for 15 minutes. Delivered to your email inbox.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || confirmationCode.length !== 6}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-forest-800 hover:bg-forest-900 active:bg-forest-950 p-2.5 sm:p-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-forest-950/25 border border-forest-900 transition-all disabled:opacity-50 active:scale-[0.99] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600 focus-visible:ring-offset-2"
              >
                <span>{loading ? "Verifying..." : "Confirm Email & Continue"}</span>
                <svg className="h-4 w-4 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </form>

            {/* Resend Code Section */}
            <div className="flex items-center justify-between text-xs text-darkslate-600 pt-1 border-t border-sage-300/60">
              <span>Didn&apos;t receive code?</span>
              <button
                type="button"
                disabled={resendCooldown > 0 || resending}
                onClick={handleResendCode}
                className="font-bold text-forest-850 hover:text-forest-950 underline underline-offset-2 decoration-forest-600 hover:decoration-forest-850 disabled:opacity-50 disabled:no-underline transition-colors"
              >
                {resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : resending
                  ? "Sending..."
                  : "Resend Code"}
              </button>
            </div>

            {/* Skip for Now: User can access freely without lock-out */}
            <div className="pt-2 border-t border-sage-300/80">
              <button
                type="button"
                onClick={handleSkipConfirmation}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-sage-300/90 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-semibold text-darkslate-700 shadow-xs transition-all active:scale-[0.99]"
              >
                <span>Skip for now &amp; start practicing</span>
                <svg className="h-3.5 w-3.5 text-darkslate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
              <p className="mt-1 text-center text-[10px] text-darkslate-500">
                You can verify your email anytime in your account settings.
              </p>
            </div>

            {/* Back to sign in / re-enter details */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => switchMode("signin")}
                className="text-xs font-medium text-darkslate-600 hover:text-forest-850 transition-colors"
              >
                ← Back to Sign In
              </button>
            </div>
          </div>
        ) : (
          /* STANDARD SIGNIN / SIGNUP VIEW */
          <>
            {/* OAuth and Demo Buttons */}
            <div className="space-y-2.5 mb-5">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading || googleLoading}
                className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-sage-300/90 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs sm:text-sm font-semibold text-darkslate-800 shadow-xs transition-all active:scale-[0.99] disabled:opacity-50"
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>
                  {googleLoading ? "Connecting to Google..." : "Continue with Google"}
                </span>
              </button>

              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={loading || googleLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-forest-600/50 bg-forest-800 px-4 py-2.5 text-xs sm:text-sm font-semibold text-emerald-200 shadow-xs hover:bg-forest-750 hover:text-white transition-all active:scale-[0.99] disabled:opacity-50"
              >
                <span>Sign in with Demo Account</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-4 text-center text-xs text-darkslate-500">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-sage-300/80" />
              </div>
              <span className="relative bg-[#E2ECE5] px-3 font-semibold uppercase tracking-wider text-[11px] text-darkslate-500">
                Or with email credentials
              </span>
            </div>

            {/* Credentials Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === "signup" && (
                <div>
                  <label
                    htmlFor="auth-name"
                    className="block text-xs font-bold text-darkslate-700 mb-1"
                  >
                    Full Name
                  </label>
                  <input
                    id="auth-name"
                    type="text"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    className="w-full rounded-xl border border-sage-300 bg-[#F0F5F1] px-3.5 py-2 text-xs sm:text-sm text-darkslate-900 placeholder:text-darkslate-400 focus:bg-[#E8F0EA] focus:border-forest-600 focus:outline-none focus:ring-2 focus:ring-forest-500/20 transition-all"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="auth-email"
                  className="block text-xs font-bold text-darkslate-700 mb-1"
                >
                  Email Address
                </label>
                <input
                  id="auth-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full rounded-xl border border-sage-300 bg-[#F0F5F1] px-3.5 py-2 text-xs sm:text-sm text-darkslate-900 placeholder:text-darkslate-400 focus:bg-[#E8F0EA] focus:border-forest-600 focus:outline-none focus:ring-2 focus:ring-forest-500/20 transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="auth-password"
                  className="block text-xs font-bold text-darkslate-700 mb-1"
                >
                  Password
                </label>
                <input
                  id="auth-password"
                  type="password"
                  required
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full rounded-xl border border-sage-300 bg-[#F0F5F1] px-3.5 py-2 text-xs sm:text-sm text-darkslate-900 placeholder:text-darkslate-400 focus:bg-[#E8F0EA] focus:border-forest-600 focus:outline-none focus:ring-2 focus:ring-forest-500/20 transition-all"
                />
              </div>

              {mode === "signup" && (
                <div>
                  <label
                    htmlFor="auth-confirm"
                    className="block text-xs font-bold text-darkslate-700 mb-1"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="auth-confirm"
                    type="password"
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full rounded-xl border border-sage-300 bg-[#F0F5F1] px-3.5 py-2 text-xs sm:text-sm text-darkslate-900 placeholder:text-darkslate-400 focus:bg-[#E8F0EA] focus:border-forest-600 focus:outline-none focus:ring-2 focus:ring-forest-500/20 transition-all"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-forest-800 hover:bg-forest-900 active:bg-forest-950 p-2.5 sm:p-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-forest-950/25 border border-forest-900 transition-all disabled:opacity-50 active:scale-[0.99] cursor-pointer mt-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600 focus-visible:ring-offset-2"
              >
                <span>
                  {loading
                    ? "Authenticating..."
                    : mode === "signin"
                    ? "Sign In"
                    : "Sign Up (Create Account)"}
                </span>
                <svg className="h-4 w-4 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>

            {/* Toggle Mode */}
            <div className="mt-5 text-center text-xs text-darkslate-600 border-t border-sage-300/80 pt-4 space-y-2">
              {mode === "signin" ? (
                <>
                  <p>
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("signup")}
                      className="font-bold text-forest-850 hover:text-forest-950 underline underline-offset-4 decoration-2 decoration-forest-600 hover:decoration-forest-850 transition-colors ml-1"
                    >
                      Sign up
                    </button>
                  </p>
                  {email && (
                    <p>
                      <button
                        type="button"
                        onClick={() => switchMode("confirm")}
                        className="text-[11px] text-darkslate-600 hover:text-forest-850 underline transition-colors"
                      >
                        Have a confirmation code? Verify email
                      </button>
                    </p>
                  )}
                </>
              ) : (
                <p>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("signin")}
                    className="font-bold text-forest-850 hover:text-forest-950 underline underline-offset-4 decoration-2 decoration-forest-600 hover:decoration-forest-850 transition-colors ml-1"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </>
        )}
        </div>
      </div>
    </div>
  );
}
