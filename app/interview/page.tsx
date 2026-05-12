"use client";

// Requirements: 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7,
//               4.1, 4.2, 4.3, 4.4, 5.3, 5.4, 5.5, 5.6, 5.8

import { Suspense, useEffect, useCallback, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import { useInterviewSession } from "@/hooks/useInterviewSession";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { validateCategory } from "@/lib/validation";
import type { Category, Feedback } from "@/types";

import QuestionDisplay from "@/components/QuestionDisplay";
import TranscriptArea from "@/components/TranscriptArea";
import RecordingControls from "@/components/RecordingControls";
import FeedbackPanel from "@/components/FeedbackPanel";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";

// ---------------------------------------------------------------------------
// Inner component — uses useSearchParams (must be inside <Suspense>)
// ---------------------------------------------------------------------------

function InterviewPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Session state machine
  const {
    phase,
    currentQuestion,
    questionIndex,
    totalQuestions,
    sessionResults,
    error: sessionError,
    dispatch,
  } = useInterviewSession();

  // Speech recognition
  const {
    isSupported,
    isRecording,
    finalTranscript,
    interimTranscript,
    retryCount,
    autoStopped,
    error: speechError,
    start: startRecording,
    stop: stopRecording,
    reset: resetSpeech,
  } = useSpeechRecognition();

  // Local state for fallback text input (used when fallbackMode is true)
  const [fallbackText, setFallbackText] = useState("");

  // Validation error for empty-answer submission (Req 5.8)
  const [answerValidationError, setAnswerValidationError] = useState<
    string | null
  >(null);

  // Determine fallback mode: no Speech API support OR too many retries (Req 3.5, 3.6)
  const fallbackMode = !isSupported || retryCount >= 3;

  // The effective transcript: from speech recognition or fallback textarea
  const effectiveTranscript = fallbackMode ? fallbackText : finalTranscript;

  // ---------------------------------------------------------------------------
  // On mount: read ?category, validate, dispatch START_SESSION (Req 1.2, 1.3)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const categoryParam = searchParams.get("category");

    if (!validateCategory(categoryParam)) {
      // Invalid or missing category — redirect home
      router.replace("/");
      return;
    }

    dispatch({ type: "START_SESSION", payload: { category: categoryParam as Category } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  // ---------------------------------------------------------------------------
  // Handle stop recording: dispatch STOP_RECORDING with final transcript
  // ---------------------------------------------------------------------------
  const handleStopRecording = useCallback(() => {
    stopRecording();
    // finalTranscript is updated synchronously by the hook's stop() call
    // We dispatch after a tick so the hook state has settled
    setTimeout(() => {
      dispatch({
        type: "STOP_RECORDING",
        payload: { answer: finalTranscript },
      });
    }, 0);
  }, [stopRecording, dispatch, finalTranscript]);

  // ---------------------------------------------------------------------------
  // Handle submit answer (Req 5.1, 5.8)
  // ---------------------------------------------------------------------------
  const handleSubmitAnswer = useCallback(async () => {
    const answer = effectiveTranscript.trim();

    if (!answer) {
      setAnswerValidationError(
        "Please record or type an answer before submitting."
      );
      return;
    }

    setAnswerValidationError(null);

    if (!currentQuestion) return;

    // Transition to REVIEWING phase
    dispatch({ type: "SUBMIT_ANSWER" });

    // Call POST /api/review (Req 5.1, 5.7)
    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentQuestion.text,
          answer,
          category: currentQuestion.category,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: "Review service unavailable. Please try again.",
        }));
        dispatch({
          type: "SET_ERROR",
          payload: {
            error:
              errorData.error ??
              "Review service unavailable. Please try again.",
          },
        });
        return;
      }

      const data = await response.json();
      const feedback: Feedback = data.feedback;

      // Dispatch RECEIVE_FEEDBACK to transition to FEEDBACK_SHOWN (Req 5.4)
      dispatch({ type: "RECEIVE_FEEDBACK", payload: { feedback } });
    } catch {
      dispatch({
        type: "SET_ERROR",
        payload: {
          error:
            "A network error occurred. Please check your connection and try again.",
        },
      });
    }
  }, [effectiveTranscript, currentQuestion, dispatch]);

  // ---------------------------------------------------------------------------
  // Handle retry submit (Req 5.5, 5.6)
  // ---------------------------------------------------------------------------
  const handleRetrySubmit = useCallback(() => {
    dispatch({ type: "RETRY_SUBMIT" });
    handleSubmitAnswer();
  }, [dispatch, handleSubmitAnswer]);

  // ---------------------------------------------------------------------------
  // Handle next question (Req 2.4)
  // ---------------------------------------------------------------------------
  const handleNextQuestion = useCallback(() => {
    resetSpeech();
    setFallbackText("");
    setAnswerValidationError(null);
    dispatch({ type: "NEXT_QUESTION" });
  }, [resetSpeech, dispatch]);

  // ---------------------------------------------------------------------------
  // Handle end session: serialize to sessionStorage, navigate to /summary
  // (Req 2.5, 7.1)
  // ---------------------------------------------------------------------------
  const handleEndSession = useCallback(() => {
    dispatch({ type: "END_SESSION" });
    sessionStorage.setItem("sessionResults", JSON.stringify(sessionResults));
    router.push("/summary");
  }, [dispatch, sessionResults, router]);

  // ---------------------------------------------------------------------------
  // When phase reaches SESSION_ENDED (all questions exhausted), navigate to summary
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (phase === "SESSION_ENDED") {
      sessionStorage.setItem("sessionResults", JSON.stringify(sessionResults));
      router.push("/summary");
    }
  }, [phase, sessionResults, router]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  // While session hasn't started yet (IDLE phase before START_SESSION resolves)
  if (phase === "IDLE") {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <LoadingSpinner />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 space-y-6">
      {/* ── Auto-stop notification (Req 3.7) — aria-live="assertive" ── */}
      {autoStopped && (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          Recording stopped automatically after reaching the 10-minute maximum
          duration.
        </div>
      )}

      {/* ── Speech recognition error (non-fatal) ── */}
      {speechError && !fallbackMode && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {speechError}
        </div>
      )}

      {/* ── Current question ── */}
      {currentQuestion && (
        <QuestionDisplay
          question={currentQuestion}
          questionNumber={questionIndex + 1}
          totalQuestions={totalQuestions}
        />
      )}

      {/* ── RECORDING / SUBMITTED phases: transcript + controls ── */}
      {(phase === "RECORDING" || phase === "SUBMITTED") && (
        <section aria-label="Answer recording" className="space-y-4">
          {/* Transcript area (Req 4.1, 4.3, 4.4) */}
          <TranscriptArea
            finalTranscript={fallbackMode ? fallbackText : finalTranscript}
            interimTranscript={fallbackMode ? "" : interimTranscript}
            fallbackMode={fallbackMode}
            onFallbackChange={(text) => {
              setFallbackText(text);
              // Clear validation error when user starts typing
              if (text.trim()) setAnswerValidationError(null);
            }}
          />

          {/* Inline validation error for empty answer (Req 5.8) */}
          {answerValidationError && (
            <p
              role="alert"
              className="text-sm text-red-600"
              aria-live="assertive"
            >
              {answerValidationError}
            </p>
          )}

          {/* Recording controls (Req 3.1, 3.4, 5.1) */}
          <RecordingControls
            isRecording={isRecording}
            isSupported={isSupported && !fallbackMode}
            onStart={() => {
              setAnswerValidationError(null);
              startRecording();
            }}
            onStop={handleStopRecording}
            onSubmit={handleSubmitAnswer}
            hasTranscript={effectiveTranscript.trim().length > 0}
          />
        </section>
      )}

      {/* ── REVIEWING phase: loading spinner (Req 5.3) ── */}
      {phase === "REVIEWING" && !sessionError && (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      )}

      {/* ── Session error with retry option (Req 5.5, 5.6) ── */}
      {sessionError && (
        <ErrorMessage
          message={sessionError}
          onRetry={phase === "REVIEWING" ? handleRetrySubmit : undefined}
        />
      )}

      {/* ── FEEDBACK_SHOWN phase: feedback panel (Req 5.4, 6.1–6.6) ── */}
      {phase === "FEEDBACK_SHOWN" &&
        !sessionError &&
        currentQuestion &&
        sessionResults.length > 0 && (
          <FeedbackPanel
            question={currentQuestion}
            answer={sessionResults[sessionResults.length - 1].answer}
            feedback={sessionResults[sessionResults.length - 1].feedback}
            onNext={handleNextQuestion}
            onEndSession={handleEndSession}
          />
        )}
    </main>
  );
}

// ---------------------------------------------------------------------------
// Default export — wraps inner component in <Suspense> (required for
// useSearchParams in Next.js App Router)
// ---------------------------------------------------------------------------

export default function InterviewPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center p-4">
          <LoadingSpinner />
        </main>
      }
    >
      <InterviewPageInner />
    </Suspense>
  );
}
