"use client";

// Interview session screen with sequential answering flow followed by comprehensive AI Review
// Requirements: 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 5.1, 5.3, 5.4, 5.5, 5.8

import { Suspense, useEffect, useCallback, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import { useInterviewSession } from "@/hooks/useInterviewSession";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { validateCategory } from "@/lib/validation";
import type { AnswerMode, Category, Feedback, SessionEntry } from "@/types";

import QuestionDisplay from "@/components/QuestionDisplay";
import TranscriptArea from "@/components/TranscriptArea";
import RecordingControls from "@/components/RecordingControls";
import LoadingSpinner from "@/components/LoadingSpinner";
import ApiKeyModal from "@/components/ApiKeyModal";

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

  // Audio recording & Whisper transcription hook (used in Voice Mode)
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

  // API Key modal state
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

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
      <div className="flex min-h-[50vh] items-center justify-center p-4">
        <LoadingSpinner />
      </div>
    );
  }

  const typedWordCount = typedText.trim() ? typedText.trim().split(/\s+/).length : 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* ── Mode indicator & Category badge ── */}
      <div className="flex items-center justify-between text-xs text-gray-500 border-b border-gray-100 pb-2">
        <div className="flex items-center gap-1.5">
          <span aria-hidden="true">{mode === "mic" ? "🎙️" : "✍️"}</span>
          <span className="font-semibold text-gray-700">
            {mode === "mic" ? "Voice Mode (Whisper Speech-to-Text)" : "Written Mode (Typed Only)"}
          </span>
        </div>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="hover:text-indigo-600 transition-colors"
        >
          Change category or mode
        </button>
      </div>

      {/* ── Visual Question Stepper ── */}
      {!isReviewingAll && totalQuestions > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-gray-500">
            <span>Question {questionIndex + 1} of {totalQuestions}</span>
            <span>{Math.round(((questionIndex + 1) / totalQuestions) * 100)}% Completed</span>
          </div>
          <div className="grid grid-cols-5 gap-1.5 w-full">
            {questions.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx < questionIndex || answers[idx]
                    ? "bg-indigo-600"
                    : idx === questionIndex
                    ? "bg-indigo-400"
                    : "bg-gray-200"
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
          className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 space-y-3"
        >
          <div className="flex items-start gap-2.5">
            <span className="text-xl" aria-hidden="true">🔑</span>
            <div>
              <p className="font-semibold text-amber-950">{audioError}</p>
              <p className="mt-0.5 text-xs text-amber-800">
                Audio transcription via Whisper or Gemini requires an API key. You can get a free key from Google AI Studio or Groq Console.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-200/60">
            <button
              type="button"
              onClick={() => setIsKeyModalOpen(true)}
              className="rounded bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 shadow-sm transition-colors"
            >
              Configure API Key
            </button>
            <button
              type="button"
              onClick={() => {
                setAnswerValidationError(null);
                startRecording();
              }}
              className="rounded bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 border border-gray-300 hover:bg-gray-100 transition-colors"
            >
              Try Again
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
              className="rounded bg-transparent px-3 py-1.5 text-xs font-semibold text-amber-800 hover:underline"
            >
              Switch to Written Mode
            </button>
          </div>
        </div>
      )}

      {/* ── Question Answering View ── */}
      {!isReviewingAll && currentQuestion && (
        <>
          <QuestionDisplay
            question={currentQuestion}
            questionNumber={questionIndex + 1}
            totalQuestions={totalQuestions}
          />

          <section aria-label="Answer section" className="space-y-4">
            {/* Mode 1: VOICE MODE (Whisper-powered speech-to-text) */}
            {mode === "mic" && (
              <div className="space-y-4">
                <TranscriptArea
                  finalTranscript={audioTranscript}
                  isRecording={isRecording}
                  isTranscribing={isTranscribing}
                  fallbackMode={false}
                />

                {/* Validation error */}
                {answerValidationError && (
                  <p role="alert" className="text-sm text-red-600" aria-live="assertive">
                    {answerValidationError}
                  </p>
                )}

                {/* Voice controls with duration & Whisper transcribing states */}
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
            )}

            {/* Mode 2: WRITTEN MODE (Typed only) */}
            {mode === "typed" && (
              <div className="space-y-3">
                <label htmlFor="typed-answer" className="block text-sm font-semibold text-gray-700">
                  Your Written Answer
                </label>
                <textarea
                  id="typed-answer"
                  value={typedText}
                  onChange={(e) => {
                    setTypedText(e.target.value);
                    if (e.target.value.trim()) setAnswerValidationError(null);
                  }}
                  placeholder="Type your response here... Tip: Structure your thoughts with the STAR method (Situation, Task, Action, Result) and explain your reasoning clearly."
                  rows={7}
                  className="w-full rounded-lg border border-gray-300 p-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                />

                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{typedWordCount} {typedWordCount === 1 ? "word" : "words"}</span>
                  <span>{typedText.length} characters</span>
                </div>

                {/* Validation error */}
                {answerValidationError && (
                  <p role="alert" className="text-sm text-red-600" aria-live="assertive">
                    {answerValidationError}
                  </p>
                )}

                {/* Navigation buttons */}
                <div className="pt-2 flex items-center justify-between">
                  {canPrevious ? (
                    <button
                      type="button"
                      onClick={handlePreviousQuestion}
                      className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 active:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors"
                    >
                      ← Previous
                    </button>
                  ) : (
                    <div />
                  )}

                  <button
                    type="button"
                    onClick={handleNextOrFinish}
                    disabled={!typedText.trim()}
                    className={`inline-flex items-center gap-1.5 rounded-md px-5 py-2.5 text-sm font-semibold text-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors ${
                      isLastQuestion
                        ? "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 focus-visible:ring-indigo-600"
                        : "bg-green-600 hover:bg-green-700 active:bg-green-800 focus-visible:ring-green-600"
                    }`}
                  >
                    <span>{isLastQuestion ? "Finish & Review with AI ✨" : "Next Question →"}</span>
                  </button>
                </div>
              </div>
            )}
          </section>
        </>
      )}

      {/* ── Reviewing All Questions Progress View ── */}
      {isReviewingAll && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-2xl border border-indigo-100 bg-white p-8 shadow-md text-center space-y-6 animate-fade-in"
        >
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-200">
            <span className="text-3xl animate-bounce" aria-hidden="true">
              🤖
            </span>
            <div className="absolute inset-0 rounded-full border-4 border-indigo-200 border-t-transparent animate-spin" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              AI Coach is Evaluating Your Interview
            </h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Analyzing your answers across the 3 key pillars: Structure & Depth, Tone & Delivery, and Connection to the Question.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="max-w-md mx-auto space-y-2">
            <div className="flex justify-between text-xs font-semibold text-gray-600">
              <span>Evaluating Question {reviewProgress.current} of {reviewProgress.total}</span>
              <span>{Math.round((reviewProgress.current / (reviewProgress.total || 1)) * 100)}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all duration-500 ease-out"
                style={{
                  width: `${Math.round((reviewProgress.current / (reviewProgress.total || 1)) * 100)}%`,
                }}
              />
            </div>
          </div>

          {reviewProgress.currentQuestionText && (
            <div className="rounded-lg bg-gray-50 border border-gray-200/80 p-3 text-xs text-gray-600 max-w-lg mx-auto italic truncate">
              &quot;{reviewProgress.currentQuestionText}&quot;
            </div>
          )}

          {reviewError && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200 max-w-md mx-auto space-y-2">
              <p className="font-semibold">{reviewError}</p>
              <button
                type="button"
                onClick={() => executeReviewAll(answers)}
                className="rounded bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 shadow-sm"
              >
                Retry AI Review
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── API Key Configuration Modal ── */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
      />
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
        <div className="flex min-h-[50vh] items-center justify-center p-4">
          <LoadingSpinner />
        </div>
      }
    >
      <InterviewPageInner />
    </Suspense>
  );
}
