"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 4.1, 4.2, 4.3

export const MAX_RECORDING_MS = 10 * 60 * 1000; // 10 minutes

const MAX_RETRIES = 3;

// Error code → user-friendly message mapping
const ERROR_MESSAGES: Record<string, string> = {
  "not-allowed":
    "Microphone access was denied. Please allow microphone permission in your browser settings.",
  "no-speech":
    "No speech was detected. Please speak clearly into your microphone.",
  "audio-capture":
    "No microphone was found. Please connect a microphone and try again.",
  network:
    "A network error occurred during speech recognition. Please check your connection.",
};

// SpeechRecognitionResult-shaped object used for the pure accumulation function
export interface SpeechRecognitionResultLike {
  transcript: string;
  isFinal: boolean;
}

/**
 * Pure function that accumulates final transcripts from an array of
 * SpeechRecognitionResult-shaped objects.
 *
 * Exported so it can be tested independently (Property 4).
 * Requirements: 3.3, 4.2
 */
export function accumulateTranscript(
  results: SpeechRecognitionResultLike[]
): string {
  return results
    .filter((r) => r.isFinal)
    .map((r) => r.transcript)
    .join("");
}

export interface UseSpeechRecognitionReturn {
  isSupported: boolean;
  isRecording: boolean;
  finalTranscript: string;
  interimTranscript: string;
  retryCount: number;
  autoStopped: boolean;
  error: string | null;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [autoStopped, setAutoStopped] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs to avoid stale closures
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const autoStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track whether stop was intentional (user-initiated or auto-stop)
  const intentionalStopRef = useRef(false);
  // Track interim transcript in a ref so onend can access the latest value
  const interimTranscriptRef = useRef("");
  // Track retry count in a ref so onerror can access the latest value
  const retryCountRef = useRef(0);
  // Track whether we are in fallback mode (>= MAX_RETRIES failures)
  const fallbackTriggeredRef = useRef(false);

  // Detect browser support on mount
  useEffect(() => {
    const SpeechRecognitionAPI =
      typeof window !== "undefined"
        ? (window as Window & { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ??
          (window as Window & { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition
        : undefined;

    setIsSupported(!!SpeechRecognitionAPI);
  }, []);

  const clearAutoStopTimer = useCallback(() => {
    if (autoStopTimerRef.current !== null) {
      clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = null;
    }
  }, []);

  const stopRecognition = useCallback(
    (intentional: boolean) => {
      intentionalStopRef.current = intentional;
      clearAutoStopTimer();

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore errors when stopping (e.g., already stopped)
        }
      }

      // Append any remaining interim transcript to final
      if (interimTranscriptRef.current) {
        setFinalTranscript((prev) => prev + interimTranscriptRef.current);
        interimTranscriptRef.current = "";
        setInterimTranscript("");
      }

      setIsRecording(false);
    },
    [clearAutoStopTimer]
  );

  const createRecognition = useCallback(() => {
    const SpeechRecognitionAPI =
      typeof window !== "undefined"
        ? (window as Window & { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ??
          (window as Window & { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition
        : undefined;

    if (!SpeechRecognitionAPI) return null;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;

        if (result.isFinal) {
          setFinalTranscript((prev) => prev + transcript);
        } else {
          interim = transcript;
        }
      }

      interimTranscriptRef.current = interim;
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const code = event.error;
      const message =
        ERROR_MESSAGES[code] ??
        "An unexpected error occurred during speech recognition.";

      setError(message);

      // not-allowed → immediate fallback (no retries)
      if (code === "not-allowed") {
        fallbackTriggeredRef.current = true;
        stopRecognition(true);
        return;
      }

      // For other errors, increment retry count
      const newCount = retryCountRef.current + 1;
      retryCountRef.current = newCount;
      setRetryCount(newCount);

      if (newCount >= MAX_RETRIES) {
        fallbackTriggeredRef.current = true;
        stopRecognition(true);
      }
    };

    recognition.onend = () => {
      // Auto-restart if recording was not intentionally stopped
      // (handles Chrome's 60-second continuous recognition limit)
      if (!intentionalStopRef.current && !fallbackTriggeredRef.current) {
        try {
          recognition.start();
        } catch {
          // If restart fails, mark as stopped
          setIsRecording(false);
        }
      } else {
        setIsRecording(false);
      }
    };

    return recognition;
  }, [stopRecognition]);

  const start = useCallback(() => {
    if (!isSupported || fallbackTriggeredRef.current) return;

    // Reset intentional stop flag
    intentionalStopRef.current = false;
    setError(null);
    setAutoStopped(false);

    const recognition = createRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;

    try {
      recognition.start();
      setIsRecording(true);

      // Set up 10-minute auto-stop timer
      autoStopTimerRef.current = setTimeout(() => {
        setAutoStopped(true);
        stopRecognition(true);
      }, MAX_RECORDING_MS);
    } catch {
      setError("Failed to start speech recognition. Please try again.");
    }
  }, [isSupported, createRecognition, stopRecognition]);

  const stop = useCallback(() => {
    stopRecognition(true);
  }, [stopRecognition]);

  const reset = useCallback(() => {
    // Stop any active recording first
    if (isRecording) {
      stopRecognition(true);
    }

    clearAutoStopTimer();

    // Clear all transcript state and retry count
    setFinalTranscript("");
    setInterimTranscript("");
    interimTranscriptRef.current = "";
    setRetryCount(0);
    retryCountRef.current = 0;
    setAutoStopped(false);
    setError(null);
    fallbackTriggeredRef.current = false;
    intentionalStopRef.current = false;
  }, [isRecording, stopRecognition, clearAutoStopTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAutoStopTimer();
      if (recognitionRef.current) {
        intentionalStopRef.current = true;
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore cleanup errors
        }
      }
    };
  }, [clearAutoStopTimer]);

  return {
    isSupported,
    isRecording,
    finalTranscript,
    interimTranscript,
    retryCount,
    autoStopped,
    error,
    start,
    stop,
    reset,
  };
}
