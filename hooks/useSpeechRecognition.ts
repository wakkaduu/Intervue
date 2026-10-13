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
    "Speech recognition service unreachable (Network error). In Brave, enable 'Use Google services for speech recognition' under brave://settings/extensions. Otherwise, type your answer below or use Google Chrome.",
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
  fallbackTriggered: boolean;
  start: () => Promise<void>;
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
  const [fallbackTriggered, setFallbackTriggered] = useState(false);

  // Refs to avoid stale closures
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const autoStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track whether stop was intentional (user-initiated or auto-stop)
  const intentionalStopRef = useRef(false);
  // Track interim transcript in a ref so onend can access the latest value
  const interimTranscriptRef = useRef("");
  // Track retry count in a ref so onerror can access the latest value
  const retryCountRef = useRef(0);
  // Track whether we are in fallback mode (>= MAX_RETRIES failures or permission denied)
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

      // "no-speech" is a normal non-fatal event in Chrome when the speaker pauses to think.
      // Do not abort recording or count against fatal retries.
      if (code === "no-speech" || code === "aborted") {
        return;
      }

      const message =
        ERROR_MESSAGES[code] ??
        "An unexpected error occurred during speech recognition.";

      setError(message);

      // not-allowed, audio-capture, or network → immediate fallback (permission/hardware/service issue)
      if (code === "not-allowed" || code === "audio-capture" || code === "network") {
        fallbackTriggeredRef.current = true;
        setFallbackTriggered(true);
        stopRecognition(true);
        return;
      }

      // For other errors, increment retry count
      const newCount = retryCountRef.current + 1;
      retryCountRef.current = newCount;
      setRetryCount(newCount);

      if (newCount >= MAX_RETRIES) {
        fallbackTriggeredRef.current = true;
        setFallbackTriggered(true);
        stopRecognition(true);
      }
    };

    recognition.onend = () => {
      // Auto-restart if recording was not intentionally stopped
      // (handles Chrome's continuous recognition cut-off)
      if (!intentionalStopRef.current && !fallbackTriggeredRef.current) {
        setTimeout(() => {
          if (!intentionalStopRef.current && !fallbackTriggeredRef.current) {
            try {
              recognition.start();
            } catch {
              try {
                const fresh = createRecognition();
                if (fresh) {
                  recognitionRef.current = fresh;
                  fresh.start();
                } else {
                  setIsRecording(false);
                }
              } catch {
                setIsRecording(false);
              }
            }
          }
        }, 100);
      } else {
        setIsRecording(false);
      }
    };

    return recognition;
  }, [stopRecognition]);

  const start = useCallback(async () => {
    if (!isSupported) {
      setError("Speech recognition is not supported in this browser. Please type your answer.");
      fallbackTriggeredRef.current = true;
      setFallbackTriggered(true);
      return;
    }

    // Reset flags on user-initiated start
    intentionalStopRef.current = false;
    fallbackTriggeredRef.current = false;
    setFallbackTriggered(false);
    setError(null);
    setAutoStopped(false);

    // Stop/abort any active recognition instance first to prevent "recognition has already started"
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // Ignore abort errors
      }
      recognitionRef.current = null;
    }

    // Pre-flight check: explicitly request microphone permission via getUserMedia
    // This triggers the browser permission dialog if not yet granted
    // and verifies that an audio input device is available.
    if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Release audio stream tracks immediately so SpeechRecognition has full exclusive access
        stream.getTracks().forEach((track) => track.stop());
      } catch (err: unknown) {
        const mediaErr = err as { name?: string };
        if (
          mediaErr?.name === "NotAllowedError" ||
          mediaErr?.name === "PermissionDeniedError"
        ) {
          setError(ERROR_MESSAGES["not-allowed"]);
          fallbackTriggeredRef.current = true;
          setFallbackTriggered(true);
          setIsRecording(false);
          return;
        }
        if (
          mediaErr?.name === "NotFoundError" ||
          mediaErr?.name === "DevicesNotFoundError"
        ) {
          setError(ERROR_MESSAGES["audio-capture"]);
          fallbackTriggeredRef.current = true;
          setFallbackTriggered(true);
          setIsRecording(false);
          return;
        }
      }
    }

    const recognition = createRecognition();
    if (!recognition) {
      setError("Could not initialize speech recognition. Please type your answer.");
      fallbackTriggeredRef.current = true;
      setFallbackTriggered(true);
      setIsRecording(false);
      return;
    }

    recognitionRef.current = recognition;

    try {
      recognition.start();
      setIsRecording(true);

      // Set up 10-minute auto-stop timer
      autoStopTimerRef.current = setTimeout(() => {
        setAutoStopped(true);
        stopRecognition(true);
      }, MAX_RECORDING_MS);
    } catch (err: unknown) {
      console.error("Speech recognition start failed:", err);
      setError("Failed to start speech recognition. Please try again or type your answer.");
      setIsRecording(false);
    }
  }, [isSupported, createRecognition, stopRecognition]);

  const stop = useCallback(() => {
    stopRecognition(true);
  }, [stopRecognition]);

  const reset = useCallback(() => {
    // Stop any active recognition first
    if (recognitionRef.current) {
      intentionalStopRef.current = true;
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
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
    setFallbackTriggered(false);
    intentionalStopRef.current = false;
    setIsRecording(false);
  }, [clearAutoStopTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAutoStopTimer();
      if (recognitionRef.current) {
        intentionalStopRef.current = true;
        try {
          recognitionRef.current.abort();
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
    fallbackTriggered,
    start,
    stop,
    reset,
  };
}
