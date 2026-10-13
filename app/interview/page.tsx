"use client";

// Interview session screen on Intervue Platform
// Requirements: 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 5.1, 5.3, 5.4, 5.5, 5.8

import { Suspense, useEffect, useCallback, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

import { useInterviewSession } from "@/hooks/useInterviewSession";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { validateCategory } from "@/lib/validation";
import type { AnswerMode, Category, Feedback, SessionEntry } from "@/types";

import QuestionDisplay from "@/components/QuestionDisplay";
import TranscriptArea from "@/components/TranscriptArea";
import RecordingControls from "@/components/RecordingControls";
import LoadingSpinner from "@/components/LoadingSpinner";

// ---------------------------------------------------------------------------
// Inner component — uses useSearchParams (must be inside <Suspense>)
// ---------------------------------------------------------------------------

function InterviewPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Mode: "mic" (Voice Mode with Whisper) or "typed" (Written Mode)
  const mode: AnswerMode = searchParams.get("mode") === "typed" ? "typed" : "mic";

  // Session state machine
  const {
    phase,
    questions,
    currentQuestion,
    questionIndex,
    totalQuestions,
    dispatch,
  } = useInterviewSession();

  // Audio recording & Whisper transcription hook
  const {
    isSupported: isAudioSupported,
    isRecording,
    isTranscribing,
    recordingDuration,
    transcript: audioTranscript,
    error: audioError,
    startRecording,
    stopRecording,
    resetRecording,
    setTranscript,
  } = useAudioRecorder();

  // Typed mode state
  const [typedText, setTypedText] = useState("");

  // Answers map storing all answered questions by question index: { [index]: answerText }
  const [answers, setAnswers] = useState<Record<number, string>>({});

  // Review-all loading and progress state
  const [isReviewingAll, setIsReviewingAll] = useState(false);
  const [reviewProgress, setReviewProgress] = useState<{
    current: number;
    total: number;
    currentQuestionText: string;
  }>({ current: 0, total: 0, currentQuestionText: "" });
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Validation error for empty-answer submission
  const [answerValidationError, setAnswerValidationError] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // On mount: read ?category, validate, dispatch START_SESSION
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const categoryParam = searchParams.get("category");

    if (!validateCategory(categoryParam)) {
      router.replace("/");
      return;
    }

    dispatch({ type: "START_SESSION", payload: { category: categoryParam as Category } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Current effective answer for active question
  const effectiveAnswer = mode === "typed" ? typedText : audioTranscript;
  const isLastQuestion = questionIndex === totalQuestions - 1;
  const canPrevious = questionIndex > 0;

  // ---------------------------------------------------------------------------
  // Handle stop recording in Voice Mode
  // ---------------------------------------------------------------------------
  const handleStopRecording = useCallback(async () => {
    await stopRecording();
  }, [stopRecording]);

  // ---------------------------------------------------------------------------
  // Review all answers once all questions are answered
  // ---------------------------------------------------------------------------
  const executeReviewAll = useCallback(
    async (finalAnswers: Record<number, string>) => {
      setIsReviewingAll(true);
      setReviewError(null);

      const results: SessionEntry[] = [];
      const customGeminiKey =
        typeof window !== "undefined" ? localStorage.getItem("mock_gemini_key") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (customGeminiKey) headers["x-gemini-key"] = customGeminiKey;

      try {
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          const ans = finalAnswers[i] || "";

          setReviewProgress({
            current: i + 1,
            total: questions.length,
            currentQuestionText: q.text,
          });

          const response = await fetch("/api/review", {
            method: "POST",
            headers,
            body: JSON.stringify({
              question: q.text,
              answer: ans,
              category: q.category,
              mode,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
              errorData.error || `Review request failed for Question ${i + 1}.`
            );
          }

          const data = await response.json();
          results.push({
            question: q,
            answer: ans,
            feedback: data.feedback as Feedback,
          });
        }

        try {
          sessionStorage.setItem("sessionResults", JSON.stringify(results));
        } catch {
          // Ignore quota errors
        }
        router.push("/summary");
      } catch (err: unknown) {
        console.error("AI review all error:", err);
        const msg =
          err instanceof Error
            ? err.message
            : "An error occurred while generating the AI review. Please try again.";
        setReviewError(msg);
      }
    },
    [questions, mode, router]
  );

  // ---------------------------------------------------------------------------
  // Handle Next Question or Finish & Submit for AI Review
  // ---------------------------------------------------------------------------
  const handleNextOrFinish = useCallback(async () => {
    const answer = effectiveAnswer.trim();

    if (!answer) {
      setAnswerValidationError(
        mode === "typed"
          ? "Please type your answer before proceeding."
          : "Please record your answer using your microphone before proceeding."
      );
      return;
    }

    setAnswerValidationError(null);

    // Save answer for current question
    const updatedAnswers = {
      ...answers,
      [questionIndex]: answer,
    };
    setAnswers(updatedAnswers);

    if (!isLastQuestion) {
      // Advance to next question
      const nextIndex = questionIndex + 1;
      dispatch({ type: "NEXT_QUESTION" });

      const nextAnswer = updatedAnswers[nextIndex] || "";
      if (mode === "typed") {
        setTypedText(nextAnswer);
      } else {
        resetRecording();
        setTranscript(nextAnswer);
      }
    } else {
      // Last question answered! Proceed to AI review
      await executeReviewAll(updatedAnswers);
    }
  }, [
    effectiveAnswer,
    mode,
    answers,
    questionIndex,
    isLastQuestion,
    dispatch,
    resetRecording,
    setTranscript,
    executeReviewAll,
  ]);

  // ---------------------------------------------------------------------------
  // Handle Previous Question
  // ---------------------------------------------------------------------------
  const handlePreviousQuestion = useCallback(() => {
    if (questionIndex <= 0) return;

    // Save current draft if provided
    const currentAns = effectiveAnswer.trim();
    const updatedAnswers = currentAns
      ? { ...answers, [questionIndex]: currentAns }
      : answers;
    if (currentAns) setAnswers(updatedAnswers);

    setAnswerValidationError(null);
    const prevIndex = questionIndex - 1;
    dispatch({ type: "PREV_QUESTION" });

    const prevAnswer = updatedAnswers[prevIndex] || "";
    if (mode === "typed") {
      setTypedText(prevAnswer);
    } else {
      resetRecording();
      setTranscript(prevAnswer);
    }
  }, [questionIndex, effectiveAnswer, answers, mode, dispatch, resetRecording, setTranscript]);

  // While session hasn't started yet
  if (phase === "IDLE") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-4 space-y-3">
        <LoadingSpinner />
        <p className="text-xs font-medium text-slate-500">Preparing your interview session...</p>
      </div>
    );
  }

  const typedWordCount = typedText.trim() ? typedText.trim().split(/\s+/).length : 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* ── Top Bar: Category, Mode & Exit ── */}
      <div className="flex items-center justify-between text-xs text-slate-600 border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 text-sm">
            {mode === "mic" ? "🎙️" : "✍️"}
          </span>
          <span className="font-semibold text-slate-900">
            {currentQuestion?.category || "Practice Track"}
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500">
            {mode === "mic" ? "Voice Mode" : "Written Mode"}
          </span>
        </div>
        <Link
          href="/"
          className="font-medium text-slate-500 hover:text-indigo-600 transition-colors"
        >
          Change Track
        </Link>
      </div>

      {/* ── Visual Question Stepper ── */}
      {!isReviewingAll && totalQuestions > 0 && (
        <div className="space-y-2 rounded-xl bg-white p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Question {questionIndex + 1} of {totalQuestions}</span>
            <span className="text-indigo-600">{Math.round(((questionIndex + 1) / totalQuestions) * 100)}% Completed</span>
          </div>
          <div
            className="grid gap-1.5 w-full"
            style={{
              gridTemplateColumns: `repeat(${totalQuestions || 1}, minmax(0, 1fr))`,
            }}
          >
            {questions.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx < questionIndex || answers[idx]
                    ? "bg-indigo-600"
                    : idx === questionIndex
                    ? "bg-indigo-400 ring-2 ring-indigo-300/50"
                    : "bg-slate-100"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Audio recording error in Voice Mode ── */}
      {mode === "mic" && audioError && !isReviewingAll && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-900 space-y-3"
        >
          <div className="flex items-start gap-2.5">
            <span className="text-lg" aria-hidden="true">⚠️</span>
            <div>
              <p className="font-semibold text-red-950">{audioError}</p>
              <p className="mt-0.5 text-xs text-red-700">
                Please verify your microphone permission and ensure clear sound. You can also switch to Written Mode.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-red-200/60">
            <button
              type="button"
              onClick={() => {
                setAnswerValidationError(null);
                startRecording();
              }}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors shadow-xs"
            >
              Try Recording Again
            </button>
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/interview?category=${encodeURIComponent(
                    currentQuestion?.category || "Behavioral"
                  )}&mode=typed`
                )
              }
              className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-red-700 border border-red-300 hover:bg-red-50 transition-colors"
            >
              Switch to Written Mode
            </button>
          </div>
        </div>
      )}

      {/* ── Question Answering View ── */}
      {!isReviewingAll && currentQuestion && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
            <QuestionDisplay
              question={currentQuestion}
              questionNumber={questionIndex + 1}
              totalQuestions={totalQuestions}
            />
          </div>

          <section aria-label="Answer section" className="space-y-4">
            {/* Mode 1: VOICE MODE (Whisper-powered speech-to-text) */}
            {mode === "mic" && (
              <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Spoken Answer
                  </span>
                  <span className="text-xs text-slate-400">
                    Press Start Recording, speak your response, then click Stop
                  </span>
                </div>

                <TranscriptArea
                  finalTranscript={audioTranscript}
                  isRecording={isRecording}
                  isTranscribing={isTranscribing}
                  fallbackMode={false}
                />

                {/* Validation error */}
                {answerValidationError && (
                  <p role="alert" className="text-sm font-medium text-red-600" aria-live="assertive">
                    {answerValidationError}
                  </p>
                )}

                {/* Voice controls with duration & Whisper transcribing states */}
                <div className="pt-2">
                  <RecordingControls
                    isRecording={isRecording}
                    isSupported={isAudioSupported}
                    isTranscribing={isTranscribing}
                    recordingDuration={recordingDuration}
                    onStart={() => {
                      setAnswerValidationError(null);
                      startRecording();
                    }}
                    onStop={handleStopRecording}
                    onSubmit={handleNextOrFinish}
                    hasTranscript={audioTranscript.trim().length > 0}
                    submitLabel={isLastQuestion ? "Finish & Review with AI ✨" : "Next Question →"}
                    isLastQuestion={isLastQuestion}
                    onPrevious={handlePreviousQuestion}
                    canPrevious={canPrevious}
                  />
                </div>
              </div>
            )}

            {/* Mode 2: WRITTEN MODE (Typed only) */}
            {mode === "typed" && (
              <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <label htmlFor="typed-answer" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Written Answer
                  </label>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span className="font-semibold text-indigo-600">STAR Tip:</span>
                    <span>Situation • Task • Action • Result</span>
                  </div>
                </div>

                <textarea
                  id="typed-answer"
                  value={typedText}
                  onChange={(e) => {
                    setTypedText(e.target.value);
                    if (e.target.value.trim()) setAnswerValidationError(null);
                  }}
                  placeholder="Structure your answer here... Example: At my previous company, we faced a major bottleneck (Situation). My task was to streamline the workflow (Task). I implemented a continuous integration protocol (Action), which reduced cycle time by 40% (Result)."
                  rows={8}
                  className="w-full rounded-xl border border-slate-300 p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-xs transition-all leading-relaxed"
                />

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{typedWordCount} {typedWordCount === 1 ? "word" : "words"}</span>
                  <span>{typedText.length} characters</span>
                </div>

                {/* Validation error */}
                {answerValidationError && (
                  <p role="alert" className="text-sm font-medium text-red-600" aria-live="assertive">
                    {answerValidationError}
                  </p>
                )}

                {/* Navigation buttons */}
                <div className="pt-2 flex items-center justify-between">
                  {canPrevious ? (
                    <button
                      type="button"
                      onClick={handlePreviousQuestion}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 active:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors"
                    >
                      ← Previous Question
                    </button>
                  ) : (
                    <div />
                  )}

                  <button
                    type="button"
                    onClick={handleNextOrFinish}
                    disabled={!typedText.trim()}
                    className={`inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all ${
                      isLastQuestion
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-indigo-500/25"
                        : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                    }`}
                  >
                    <span>{isLastQuestion ? "Finish & Review with AI ✨" : "Next Question →"}</span>
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {/* ── Reviewing All Questions Progress View ── */}
      {isReviewingAll && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-3xl border border-indigo-100 bg-white p-10 shadow-xl text-center space-y-8 animate-fade-in"
        >
          {/* Animated AI Brain Icon */}
          <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 shadow-xl shadow-indigo-500/30">
            <span className="text-4xl animate-bounce" aria-hidden="true">
              🤖
            </span>
            <div className="absolute inset-0 rounded-3xl border-4 border-indigo-200 border-t-transparent animate-spin" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Intervue AI Coach is Evaluating Your Session
            </h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Evaluating your answers across the 3 key pillars: Structure & Depth, Tone & Delivery, and Connection to the Question.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="max-w-md mx-auto space-y-3">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>Evaluating Question {reviewProgress.current} of {reviewProgress.total}</span>
              <span className="text-indigo-600">{Math.round((reviewProgress.current / (reviewProgress.total || 1)) * 100)}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 transition-all duration-500 ease-out shadow-xs"
                style={{
                  width: `${Math.round((reviewProgress.current / (reviewProgress.total || 1)) * 100)}%`,
                }}
              />
            </div>
          </div>

          {reviewProgress.currentQuestionText && (
            <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-4 text-xs text-slate-600 max-w-lg mx-auto italic truncate">
              &quot;{reviewProgress.currentQuestionText}&quot;
            </div>
          )}

          {reviewError && (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-200 max-w-md mx-auto space-y-3">
              <p className="font-semibold">{reviewError}</p>
              <button
                type="button"
                onClick={() => executeReviewAll(answers)}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 shadow-xs transition-colors"
              >
                Retry AI Review
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Default export — wraps inner component in <Suspense>
// ---------------------------------------------------------------------------

export default function InterviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] flex-col items-center justify-center p-4 space-y-3">
          <LoadingSpinner />
          <p className="text-xs font-medium text-slate-500">Loading interview session...</p>
        </div>
      }
    >
      <InterviewPageInner />
    </Suspense>
  );
}
